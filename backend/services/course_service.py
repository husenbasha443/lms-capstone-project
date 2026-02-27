from typing import List

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.course import Course, Module, Lesson, LessonProgress
from backend.models.enrollment import Enrollment
from backend.models.user import User
from backend.schemas.course import (
    CourseCreate,
    CourseOut,
    ModuleCreate,
    ModuleOut,
    LessonCreate,
    LessonOut,
    LessonUpdateProgress,
)

DEFAULT_AI_FEATURES = ["AI Transcript", "Audio Summary", "AI Q&A"]
DEFAULT_AI_ICONS = ["description", "mic", "smart_toy"]


# ================= ENRICH COURSE FOR UI =================
def _enrich_course_out(co: CourseOut, course: Course) -> CourseOut:
    if co.instructor is None and hasattr(course, "creator") and course.creator:
        co.instructor = course.creator.full_name

    co.instructor = co.instructor or "Expert Instructor"
    co.duration = co.duration or f"{len(course.modules) * 2}h"
    co.aiFeatures = DEFAULT_AI_FEATURES
    co.aiIcons = DEFAULT_AI_ICONS
    co.enrolled = co.is_enrolled

    return co


class CourseService:

    # ================= CREATE COURSE =================
    @staticmethod
    async def create_course(
        db: AsyncSession, creator_id: int, payload: CourseCreate
    ) -> CourseOut:

        course = Course(
            title=payload.title,
            description=payload.description,
            created_by_id=creator_id,
        )

        db.add(course)
        await db.commit()
        await db.refresh(course)

        return CourseOut.model_validate(course)

    # ================= LIST COURSES =================
    @staticmethod
    async def list_courses(
        db: AsyncSession, current_user: User
    ) -> List[CourseOut]:

        base_options = [
            selectinload(Course.modules).selectinload(Module.lessons),
            selectinload(Course.creator),
        ]

        if current_user.role == "admin":
            stmt = select(Course).options(*base_options)

        elif current_user.role == "trainer":
            stmt = (
                select(Course)
                .where(Course.created_by_id == current_user.id)
                .options(*base_options)
            )

        else:
            stmt = (
                select(Course)
                .where(Course.is_published == True)
                .options(*base_options)
            )

        stmt = stmt.order_by(Course.created_at.desc())

        result = await db.execute(stmt)
        courses = result.scalars().unique().all()

        # Enrollment mapping
        enr_result = await db.execute(
            select(Enrollment.course_id).where(
                Enrollment.user_id == current_user.id
            )
        )

        enrolled_ids = set(enr_result.scalars().all())

        out_courses = []

        for c in courses:
            co = CourseOut.model_validate(c)
            co.is_enrolled = c.id in enrolled_ids
            co = _enrich_course_out(co, c)
            out_courses.append(co)

        return out_courses

    # ================= LIST MY COURSES =================
    @staticmethod
    async def list_my_courses(
        db: AsyncSession, user_id: int
    ) -> List[CourseOut]:

        stmt = (
            select(Course)
            .join(Enrollment, Course.id == Enrollment.course_id)
            .where(Enrollment.user_id == user_id)
            .options(
                selectinload(Course.modules).selectinload(Module.lessons),
                selectinload(Course.creator),
            )
            .order_by(Enrollment.enrolled_at.desc())
        )

        result = await db.execute(stmt)
        courses = result.scalars().unique().all()

        out_courses = []

        for c in courses:

            # Total lessons
            total_lessons_stmt = (
                select(func.count(Lesson.id))
                .join(Module)
                .where(Module.course_id == c.id)
            )
            total_lessons = (
                await db.execute(total_lessons_stmt)
            ).scalar() or 0

            # Completed lessons
            comp_lessons_stmt = (
                select(func.count(LessonProgress.id))
                .join(Lesson)
                .join(Module)
                .where(
                    Module.course_id == c.id,
                    LessonProgress.user_id == user_id,
                    LessonProgress.is_completed == True,
                )
            )
            completed_lessons = (
                await db.execute(comp_lessons_stmt)
            ).scalar() or 0

            # Total percentage
            total_percentage_stmt = (
                select(func.sum(LessonProgress.completion_percentage))
                .join(Lesson)
                .join(Module)
                .where(
                    Module.course_id == c.id,
                    LessonProgress.user_id == user_id,
                )
            )

            total_percentage = (
                await db.execute(total_percentage_stmt)
            ).scalar() or 0

            progress = (
                int(total_percentage / total_lessons)
                if total_lessons > 0
                else 0
            )

            co = CourseOut.model_validate(c)
            co.is_enrolled = True
            co.progress_percentage = progress
            co.completed_lessons = completed_lessons
            co.total_lessons = total_lessons

            co = _enrich_course_out(co, c)

            out_courses.append(co)

        return out_courses

    # ================= ENROLL =================
    @staticmethod
    async def enroll_in_course(
        db: AsyncSession, user_id: int, course_id: int
    ) -> bool:

        check_stmt = select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id,
        )

        existing = (
            await db.execute(check_stmt)
        ).scalar_one_or_none()

        if existing:
            return False

        course = await db.get(Course, course_id)

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        if not course.is_published:
            raise HTTPException(status_code=403, detail="Course not published")

        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id
        )

        db.add(enrollment)
        await db.commit()

        return True

    # ================= GET SINGLE COURSE =================
    @staticmethod
    async def get_course(
        db: AsyncSession, course_id: int, user_id: int
    ) -> CourseOut:

        stmt = (
            select(Course)
            .where(Course.id == course_id)
            .options(
                selectinload(Course.modules).selectinload(Module.lessons),
                selectinload(Course.creator),
            )
        )

        result = await db.execute(stmt)
        course = result.scalars().unique().one_or_none()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Enrollment check
        enr_stmt = select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id,
        )

        enrollment = (
            await db.execute(enr_stmt)
        ).scalar_one_or_none()

        # Lesson stats
        total_lessons_stmt = (
            select(func.count(Lesson.id))
            .join(Module)
            .where(Module.course_id == course_id)
        )

        total_lessons = (
            await db.execute(total_lessons_stmt)
        ).scalar() or 0

        comp_lessons_stmt = (
            select(func.count(LessonProgress.id))
            .join(Lesson)
            .join(Module)
            .where(
                Module.course_id == course_id,
                LessonProgress.user_id == user_id,
                LessonProgress.is_completed == True,
            )
        )

        completed_lessons = (
            await db.execute(comp_lessons_stmt)
        ).scalar() or 0

        total_percentage_stmt = (
            select(func.sum(LessonProgress.completion_percentage))
            .join(Lesson)
            .join(Module)
            .where(
                Module.course_id == course_id,
                LessonProgress.user_id == user_id,
            )
        )

        total_percentage = (
            await db.execute(total_percentage_stmt)
        ).scalar() or 0

        progress = (
            int(total_percentage / total_lessons)
            if total_lessons > 0
            else 0
        )

        co = CourseOut.model_validate(course)
        co.is_enrolled = enrollment is not None
        co.progress_percentage = progress
        co.completed_lessons = completed_lessons
        co.total_lessons = total_lessons

        co = _enrich_course_out(co, course)

        return co