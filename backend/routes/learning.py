from datetime import datetime, date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from backend.db.session import get_db
from backend.dependencies import get_current_user
from backend.models.user import User
from backend.models.course import Course, Module, Lesson, LessonProgress
from backend.models.enrollment import Enrollment
from backend.models.activity_log import ActivityLog
from backend.schemas.course import LessonUpdateProgress
from backend.services.certificate_service import CertificateService
from backend.models.certificate import Certificate

router = APIRouter()


# =========================================================
# 🔥 PROGRESS SAVE (UPSERT + AUTO CERTIFICATE)
# =========================================================

@router.post("/progress")
async def update_progress(
    payload: LessonUpdateProgress,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    # 1️⃣ Find lesson
    lesson = await db.get(Lesson, payload.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # 2️⃣ UPSERT progress
    stmt = select(LessonProgress).where(
        LessonProgress.lesson_id == payload.lesson_id,
        LessonProgress.user_id == current_user.id,
    )

    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()

    if progress:
        progress.completion_percentage = payload.completion_percentage
        progress.last_position_seconds = payload.last_position_seconds
        progress.is_completed = payload.is_completed
        progress.updated_at = datetime.utcnow()
    else:
        progress = LessonProgress(
            lesson_id=payload.lesson_id,
            user_id=current_user.id,
            completion_percentage=payload.completion_percentage,
            last_position_seconds=payload.last_position_seconds,
            is_completed=payload.is_completed,
        )
        db.add(progress)

    await db.commit()

    # 3️⃣ If lesson completed → log activity
    if payload.is_completed:
        db.add(
            ActivityLog(
                user_id=current_user.id,
                action="completed",
                detail=f"Completed lesson {lesson.title}"
            )
        )
        await db.commit()

    # 4️⃣ 🔥 CHECK COURSE COMPLETION
    course_id = lesson.module.course_id

    total_stmt = select(func.count(Lesson.id)).join(Module).where(
        Module.course_id == course_id
    )
    total_lessons = (await db.execute(total_stmt)).scalar() or 0

    completed_stmt = (
        select(func.count(LessonProgress.id))
        .join(Lesson)
        .join(Module)
        .where(
            Module.course_id == course_id,
            LessonProgress.user_id == current_user.id,
            LessonProgress.is_completed == True,
        )
    )

    completed_lessons = (await db.execute(completed_stmt)).scalar() or 0

    # 5️⃣ If 100% complete → issue certificate
    if total_lessons > 0 and completed_lessons == total_lessons:

        mastery_score = (completed_lessons / total_lessons) * 100

        await CertificateService.issue_certificate(
            db=db,
            user_id=current_user.id,
            course_id=course_id,
            ai_mastery_score=mastery_score,
        )

    return {"status": "saved"}


# =========================================================
# 🔥 GET PROGRESS (RESUME SUPPORT)
# =========================================================

@router.get("/progress/{lesson_id}")
async def get_progress(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    stmt = select(LessonProgress).where(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.user_id == current_user.id,
    )

    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()

    if not progress:
        return {
            "last_position_seconds": 0,
            "completion_percentage": 0,
            "is_completed": False,
        }

    return {
        "last_position_seconds": progress.last_position_seconds,
        "completion_percentage": progress.completion_percentage,
        "is_completed": progress.is_completed,
    }


# =========================================================
# 🔥 STREAK CALCULATION
# =========================================================

async def calculate_streak(db: AsyncSession, user_id: int) -> int:

    today = date.today()

    stmt = (
        select(func.date(LessonProgress.updated_at))
        .where(LessonProgress.user_id == user_id)
        .group_by(func.date(LessonProgress.updated_at))
        .order_by(desc(func.date(LessonProgress.updated_at)))
    )

    result = await db.execute(stmt)
    activity_days = [r[0] for r in result.all()]

    if not activity_days:
        return 0

    streak = 0
    current_day = today

    for day in activity_days:
        if day == current_day or day == current_day - timedelta(days=1):
            streak += 1
            current_day = day
        else:
            break

    return streak


# =========================================================
# 🔥 DASHBOARD
# =========================================================

@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    enrolled_stmt = (
        select(Course)
        .join(Enrollment, Course.id == Enrollment.course_id)
        .where(Enrollment.user_id == current_user.id)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
    )

    courses = (await db.execute(enrolled_stmt)).scalars().unique().all()

    courses_data = []
    total_completed = 0

    for course in courses:

        total_stmt = select(func.count(Lesson.id)).join(Module).where(
            Module.course_id == course.id
        )
        total_lessons = (await db.execute(total_stmt)).scalar() or 0

        completed_stmt = (
            select(func.count(LessonProgress.id))
            .join(Lesson)
            .join(Module)
            .where(
                Module.course_id == course.id,
                LessonProgress.user_id == current_user.id,
                LessonProgress.is_completed == True,
            )
        )

        completed = (await db.execute(completed_stmt)).scalar() or 0
        total_completed += completed

        progress = int((completed / total_lessons) * 100) if total_lessons else 0

        courses_data.append({
            "id": course.id,
            "title": course.title,
            "progress": progress,
            "completed_lessons": completed,
            "total_lessons": total_lessons,
        })

    streak = await calculate_streak(db, current_user.id)

    return {
        "user": {
            "name": current_user.full_name,
            "streak": streak
        },
        "courses": courses_data,
        "stats": {
            "enrolled_courses": len(courses_data),
            "completed_lessons": total_completed,
        }
    }