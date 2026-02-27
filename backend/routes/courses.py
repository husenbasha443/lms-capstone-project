from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.dependencies import get_current_user, get_trainer_user
from backend.models.activity_log import ActivityLog
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
from backend.services.course_service import CourseService


router = APIRouter()


@router.post("/courses", response_model=CourseOut)
async def create_course(
    payload: CourseCreate,
    trainer: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
) -> CourseOut:
    return await CourseService.create_course(db, trainer.id, payload)


@router.get("/courses", response_model=List[CourseOut])
async def list_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[CourseOut]:
    # Pass the full user object so the service can apply role-based filtering
    return await CourseService.list_courses(db, current_user)


@router.get("/courses/my-courses", response_model=List[CourseOut])
async def list_my_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[CourseOut]:
    return await CourseService.list_my_courses(db, current_user.id)


@router.get("/courses/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CourseOut:
    return await CourseService.get_course(db, course_id, current_user.id)


@router.post("/courses/{course_id}/enroll", response_model=List[CourseOut])
async def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[CourseOut]:
    """
    Enroll the authenticated user in a course.
    Returns the updated list of all enrolled courses with progress data.
    Idempotent — enrolling twice is a no-op.
    """
    newly_enrolled = await CourseService.enroll_in_course(db, current_user.id, course_id)

    # Log the enrollment activity (only on first enrollment)
    if newly_enrolled:
        log = ActivityLog(
            user_id=current_user.id,
            action="enrolled",
            detail=f"Enrolled in course {course_id}",
            related_course_id=course_id,
        )
        db.add(log)
        await db.commit()

    # Return full enrolled course list so the frontend can update state immediately
    return await CourseService.list_my_courses(db, current_user.id)


@router.post("/modules", response_model=ModuleOut)
async def create_module(
    payload: ModuleCreate,
    trainer: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
) -> ModuleOut:
    return await CourseService.create_module(db, payload)


@router.post("/lessons", response_model=LessonOut)
async def create_lesson(
    payload: LessonCreate,
    trainer: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
) -> LessonOut:
    return await CourseService.create_lesson(db, payload)


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
async def get_lesson(
    lesson_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LessonOut:
    lesson = await CourseService.get_lesson(db, lesson_id)
    return LessonOut.model_validate(lesson)


@router.post("/lessons/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: int,
    payload: LessonUpdateProgress,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await CourseService.update_lesson_progress(db, current_user.id, lesson_id, payload)
    return {"status": "ok"}
