from __future__ import annotations

from sqlalchemy import select, func, desc, extract, case
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User
from backend.models.course import Course, Module, Lesson, LessonProgress
from backend.models.enrollment import Enrollment


class AnalyticsService:
    @staticmethod
    async def get_course_completion_rates(db: AsyncSession) -> list[dict]:
        """Real completion % per course based on lesson progress."""
        stmt = (
            select(
                Course.id,
                Course.title,
                func.coalesce(func.avg(LessonProgress.completion_percentage), 0).label("avg_completion"),
                func.count(func.distinct(LessonProgress.user_id)).label("students"),
            )
            .outerjoin(Module, Module.course_id == Course.id)
            .outerjoin(Lesson, Lesson.module_id == Module.id)
            .outerjoin(LessonProgress, LessonProgress.lesson_id == Lesson.id)
            .group_by(Course.id, Course.title)
            .order_by(desc("avg_completion"))
        )
        rows = (await db.execute(stmt)).all()
        return [
            {
                "id": r.id,
                "name": r.title,
                "completion": round(float(r.avg_completion), 1),
                "students": r.students,
            }
            for r in rows
        ]

    @staticmethod
    async def get_difficult_topics(db: AsyncSession) -> list[dict]:
        """Topics where students struggle most — based on lesson progress data."""
        stmt = (
            select(
                Lesson.title,
                func.coalesce(func.avg(LessonProgress.completion_percentage), 0).label("avg_completion"),
                func.count(LessonProgress.id).label("attempts"),
            )
            .outerjoin(LessonProgress, LessonProgress.lesson_id == Lesson.id)
            .group_by(Lesson.id, Lesson.title)
            .having(func.count(LessonProgress.id) > 0)
            .order_by(func.avg(LessonProgress.completion_percentage).asc())
            .limit(10)
        )
        rows = (await db.execute(stmt)).all()
        return [
            {
                "topic": r.title,
                "difficulty": round(100 - float(r.avg_completion), 1),
                "attempts": r.attempts,
            }
            for r in rows
        ]

    @staticmethod
    async def get_enrollment_trend(db: AsyncSession) -> list[dict]:
        """Monthly enrollment counts from the enrollments table."""
        stmt = (
            select(
                extract("year", Enrollment.enrolled_at).label("year"),
                extract("month", Enrollment.enrolled_at).label("month"),
                func.count(Enrollment.id).label("count"),
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .limit(12)
        )
        rows = (await db.execute(stmt)).all()
        month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        if not rows:
            # Fallback: use user registration dates if no enrollments yet
            stmt2 = (
                select(
                    extract("year", User.created_at).label("year"),
                    extract("month", User.created_at).label("month"),
                    func.count(User.id).label("count"),
                )
                .group_by("year", "month")
                .order_by("year", "month")
                .limit(12)
            )
            rows = (await db.execute(stmt2)).all()

        return [
            {"month": month_names[int(r.month)] if 1 <= int(r.month) <= 12 else str(int(r.month)), "users": r.count}
            for r in rows
        ]

    @staticmethod
    async def get_recent_registrations(db: AsyncSession, limit: int = 20) -> list[dict]:
        """Latest user registrations."""
        stmt = (
            select(User)
            .order_by(desc(User.created_at))
            .limit(limit)
        )
        rows = (await db.execute(stmt)).scalars().all()
        return [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in rows
        ]
