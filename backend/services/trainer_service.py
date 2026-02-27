from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select, func, desc, extract
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User
from backend.models.course import Course, Module, Lesson, LessonProgress
from backend.models.enrollment import Enrollment
from backend.models.activity_log import ActivityLog


class TrainerService:
    # ━━━━ Dashboard KPIs ━━━━
    @staticmethod
    async def get_stats(db: AsyncSession, trainer_id: int) -> dict:
        """All stats filtered to courses created by this trainer."""

        # Trainer's courses
        trainer_courses = select(Course.id).where(Course.created_by_id == trainer_id)
        course_ids_result = (await db.execute(trainer_courses)).scalars().all()
        course_ids = list(course_ids_result)

        total_courses = len(course_ids)

        if not course_ids:
            return {
                "total_courses": 0, "total_modules": 0, "total_videos": 0,
                "total_pdfs": 0, "total_students": 0, "avg_completion": 0.0,
                "total_transcripts": 0, "active_courses": 0,
                "processed_lessons": 0, "unprocessed_lessons": 0, "total_lessons": 0,
            }

        # Modules
        total_modules = (await db.execute(
            select(func.count(Module.id)).where(Module.course_id.in_(course_ids))
        )).scalar() or 0

        # Module IDs for deeper queries
        module_ids_result = (await db.execute(
            select(Module.id).where(Module.course_id.in_(course_ids))
        )).scalars().all()
        module_ids = list(module_ids_result)

        # Lessons / Videos / PDFs / Transcripts
        total_lessons = 0
        total_videos = 0
        total_pdfs = 0
        total_transcripts = 0
        processed_lessons = 0

        if module_ids:
            lessons = (await db.execute(
                select(Lesson).where(Lesson.module_id.in_(module_ids))
            )).scalars().all()
            total_lessons = len(lessons)
            total_videos = sum(1 for l in lessons if l.video_path)
            total_pdfs = sum(1 for l in lessons if l.pdf_path)
            total_transcripts = sum(1 for l in lessons if l.transcript)
            processed_lessons = sum(1 for l in lessons if l.transcript_status == "completed")

        # Students enrolled in trainer's courses
        total_students = (await db.execute(
            select(func.count(func.distinct(Enrollment.user_id)))
            .where(Enrollment.course_id.in_(course_ids))
        )).scalar() or 0

        # Average completion
        avg_completion = 0.0
        if module_ids:
            lesson_ids = (await db.execute(
                select(Lesson.id).where(Lesson.module_id.in_(module_ids))
            )).scalars().all()
            if lesson_ids:
                avg_completion = (await db.execute(
                    select(func.avg(LessonProgress.completion_percentage))
                    .where(LessonProgress.lesson_id.in_(list(lesson_ids)))
                )).scalar() or 0.0

        # Active (published) courses
        active_courses = (await db.execute(
            select(func.count(Course.id))
            .where(Course.created_by_id == trainer_id, Course.is_published == True)
        )).scalar() or 0

        return {
            "total_courses": total_courses,
            "total_modules": total_modules,
            "total_videos": total_videos,
            "total_pdfs": total_pdfs,
            "total_students": total_students,
            "avg_completion": round(float(avg_completion), 1),
            "total_transcripts": total_transcripts,
            "active_courses": active_courses,
            "processed_lessons": processed_lessons,
            "unprocessed_lessons": total_lessons - processed_lessons,
            "total_lessons": total_lessons,
        }

    # ━━━━ Courses ━━━━
    @staticmethod
    async def get_courses(db: AsyncSession, trainer_id: int) -> list[dict]:
        courses = (await db.execute(
            select(Course)
            .where(Course.created_by_id == trainer_id)
            .order_by(Course.created_at.desc())
        )).scalars().all()

        result = []
        for c in courses:
            modules = (await db.execute(
                select(Module).where(Module.course_id == c.id).order_by(Module.order_index)
            )).scalars().all()

            mod_list = []
            for m in modules:
                lessons = (await db.execute(
                    select(Lesson).where(Lesson.module_id == m.id)
                )).scalars().all()
                mod_list.append({
                    "id": m.id, "title": m.title, "order_index": m.order_index,
                    "has_video": any(l.video_path for l in lessons),
                    "has_pdf": any(l.pdf_path for l in lessons),
                    "transcript_status": (
                        "completed" if any(l.transcript for l in lessons)
                        else "processing" if any(l.video_path and l.transcript_status == "processing" for l in lessons)
                        else "none"
                    ),
                    "lesson_count": len(lessons),
                    "lessons": [
                        {
                            "id": l.id,
                            "title": l.title,
                            "video_path": l.video_path,
                            "pdf_path": l.pdf_path,
                            "transcript_status": l.transcript_status
                        } for l in lessons
                    ]
                })

            # Enrolled students count
            enrolled = (await db.execute(
                select(func.count(func.distinct(Enrollment.user_id)))
                .where(Enrollment.course_id == c.id)
            )).scalar() or 0

            result.append({
                "id": c.id, "title": c.title, "description": c.description,
                "is_published": c.is_published,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "enrolled_count": enrolled,
                "modules": mod_list,
            })
        return result

    # ━━━━ Students ━━━━
    @staticmethod
    async def get_students(db: AsyncSession, trainer_id: int) -> list[dict]:
        """Students enrolled in trainer's courses with progress."""
        trainer_courses = (await db.execute(
            select(Course.id, Course.title)
            .where(Course.created_by_id == trainer_id)
        )).all()

        if not trainer_courses:
            return []

        course_map = {c.id: c.title for c in trainer_courses}
        course_ids = list(course_map.keys())

        enrollments = (await db.execute(
            select(Enrollment)
            .where(Enrollment.course_id.in_(course_ids))
            .order_by(Enrollment.enrolled_at.desc())
        )).scalars().all()

        result = []
        for e in enrollments:
            user = await db.get(User, e.user_id)
            if not user:
                continue

            # Calculate progress for this student in this course
            module_ids = (await db.execute(
                select(Module.id).where(Module.course_id == e.course_id)
            )).scalars().all()

            progress_pct = 0.0
            if module_ids:
                lesson_ids = (await db.execute(
                    select(Lesson.id).where(Lesson.module_id.in_(list(module_ids)))
                )).scalars().all()
                if lesson_ids:
                    avg = (await db.execute(
                        select(func.avg(LessonProgress.completion_percentage))
                        .where(
                            LessonProgress.user_id == user.id,
                            LessonProgress.lesson_id.in_(list(lesson_ids)),
                        )
                    )).scalar()
                    progress_pct = round(float(avg or 0), 1)

            result.append({
                "student_id": user.id,
                "student_name": user.full_name,
                "student_email": user.email,
                "course_id": e.course_id,
                "course_title": course_map.get(e.course_id, "Unknown"),
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
                "progress": progress_pct,
                "status": "completed" if progress_pct >= 100 else "in_progress" if progress_pct > 0 else "not_started",
            })
        return result

    # ━━━━ Analytics — Completion ━━━━
    @staticmethod
    async def get_completion_rates(db: AsyncSession, trainer_id: int) -> list[dict]:
        stmt = (
            select(
                Course.id, Course.title,
                func.coalesce(func.avg(LessonProgress.completion_percentage), 0).label("avg_completion"),
                func.count(func.distinct(LessonProgress.user_id)).label("students"),
            )
            .where(Course.created_by_id == trainer_id)
            .outerjoin(Module, Module.course_id == Course.id)
            .outerjoin(Lesson, Lesson.module_id == Module.id)
            .outerjoin(LessonProgress, LessonProgress.lesson_id == Lesson.id)
            .group_by(Course.id, Course.title)
            .order_by(desc("avg_completion"))
        )
        rows = (await db.execute(stmt)).all()
        return [
            {"id": r.id, "name": r.title, "completion": round(float(r.avg_completion), 1), "students": r.students}
            for r in rows
        ]

    # ━━━━ Analytics — Enrollment Trend ━━━━
    @staticmethod
    async def get_enrollment_trend(db: AsyncSession, trainer_id: int) -> list[dict]:
        course_ids = (await db.execute(
            select(Course.id).where(Course.created_by_id == trainer_id)
        )).scalars().all()

        if not course_ids:
            return []

        stmt = (
            select(
                extract("year", Enrollment.enrolled_at).label("year"),
                extract("month", Enrollment.enrolled_at).label("month"),
                func.count(Enrollment.id).label("count"),
            )
            .where(Enrollment.course_id.in_(list(course_ids)))
            .group_by("year", "month")
            .order_by("year", "month")
            .limit(12)
        )
        rows = (await db.execute(stmt)).all()
        month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return [
            {"month": month_names[int(r.month)] if 1 <= int(r.month) <= 12 else str(int(r.month)), "users": r.count}
            for r in rows
        ]

    # ━━━━ Activities ━━━━
    @staticmethod
    async def get_activities(db: AsyncSession, trainer_id: int, limit: int = 30) -> list[dict]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.user_id == trainer_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
        )
        rows = (await db.execute(stmt)).scalars().all()
        return [
            {
                "id": r.id,
                "action": r.action,
                "detail": r.detail,
                "related_course_id": r.related_course_id,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
