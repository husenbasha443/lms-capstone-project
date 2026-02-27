from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks, Body
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import Query


from backend.db.session import get_db
from backend.dependencies import get_trainer_user
from backend.models.user import User
from backend.models.course import Course, Module, Lesson
from backend.services.trainer_service import TrainerService
from backend.services.activity_log_service import ActivityLogService
from backend.services.file_service import FileService
from backend.services.knowledge_pipeline_service import KnowledgePipelineService
from backend.core.config import settings

router = APIRouter()


# ── Pydantic schemas ──
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ModuleCreate(BaseModel):
    title: str
    order_index: int = 0


# ━━━━━━━━━━━━━━━━━━━━ Dashboard Stats ━━━━━━━━━━━━━━━━━━━━
@router.get("/stats")
async def get_stats(
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_stats(db, user.id)


# ━━━━━━━━━━━━━━━━━━━━ Courses ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses")
async def get_courses(
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_courses(db, user.id)


@router.post("/courses")
async def create_course(
    payload: CourseCreate,
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    course = Course(title=payload.title, description=payload.description, created_by_id=user.id)
    db.add(course)
    await db.commit()
    await db.refresh(course)
    await ActivityLogService.log_activity(db, user.id, "course_created", f"Created course: {payload.title}", course.id)
    return {"id": course.id, "title": course.title}


@router.put("/courses/{course_id}")
async def update_course(
    course_id: int,
    payload: CourseUpdate,
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")
    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
    await db.commit()
    await ActivityLogService.log_activity(db, user.id, "course_updated", f"Updated course: {course.title}", course.id)
    return {"id": course.id, "title": course.title}


@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")
    await db.delete(course)
    await db.commit()
    await ActivityLogService.log_activity(db, user.id, "course_deleted", f"Deleted course: {course.title}")
    return {"ok": True}


# ━━━━━━━━━━━━━━━━━━━━ Modules ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/courses/{course_id}/modules")
async def create_module(
    course_id: int,
    payload: ModuleCreate,
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")

    # Get max order index
    max_order = (await db.execute(
        select(func.coalesce(func.max(Module.order_index), 0)).where(Module.course_id == course_id)
    )).scalar()

    mod = Module(
        course_id=course_id, 
        title=payload.title, 
        order_index=(max_order or 0) + 1
    )
    db.add(mod)
    await db.commit()
    await db.refresh(mod)
    await ActivityLogService.log_activity(db, user.id, "module_created", f"Added module: {payload.title}", course_id)
    return {"id": mod.id, "title": mod.title, "course_id": course_id}


# ━━━━━━━━━━━━━━━━━━━━ Uploads ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/modules/{module_id}/upload-video")
async def upload_video(
    module_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    mod = await db.get(Module, module_id)
    if not mod:
        raise HTTPException(404, "Module not found")
    course = await db.get(Course, mod.course_id)
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")

    # Use correct service method: save_upload_file
    file_path = await FileService.save_upload_file(
        file=file,
        category="videos"
    )

    lesson = (await db.execute(
        select(Lesson).where(Lesson.module_id == module_id).limit(1)
    )).scalar_one_or_none()

    if not lesson:
        lesson = Lesson(module_id=module_id, title=f"{mod.title} — Video", order_index=0)
        db.add(lesson)
        await db.commit()
        await db.refresh(lesson)

    lesson.video_path = file_path
    lesson.transcript_status = "processing"
    await db.commit()

    await ActivityLogService.log_activity(db, user.id, "video_uploaded", f"Video uploaded for module: {mod.title}", course.id)

    # Correct method for pipeline is process_lesson_recording, NOT process_lesson
    background_tasks.add_task(KnowledgePipelineService.process_lesson_recording, lesson.id, file_path)

    return {"status": "uploaded", "blob_url": file_path, "lesson_id": lesson.id}


@router.post("/modules/{module_id}/upload-pdf")
async def upload_pdf(
    module_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    mod = await db.get(Module, module_id)
    if not mod:
        raise HTTPException(404, "Module not found")
    course = await db.get(Course, mod.course_id)
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")

    # Use correct service method: save_upload_file
    file_path = await FileService.save_upload_file(
        file=file,
        category="pdfs"
    )

    lesson = (await db.execute(
        select(Lesson).where(Lesson.module_id == module_id).limit(1)
    )).scalar_one_or_none()

    if not lesson:
        lesson = Lesson(module_id=module_id, title=f"{mod.title} — Material", order_index=0)
        db.add(lesson)
        await db.commit()
        await db.refresh(lesson)

    lesson.pdf_path = file_path
    await db.commit()

    await ActivityLogService.log_activity(db, user.id, "pdf_uploaded", f"PDF uploaded for module: {mod.title}", course.id)
    return {"status": "uploaded", "blob_url": file_path, "lesson_id": lesson.id}


# ━━━━━━━━━━━━━━━━━━━━ Publish ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/courses/{course_id}/publish")
async def publish_course(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if course.created_by_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not your course")

    modules = (await db.execute(
        select(Module).where(Module.course_id == course_id)
    )).scalars().all()

    if not modules:
        raise HTTPException(400, "Course must have at least one module to publish")

    errors = []
    for m in modules:
        lessons = (await db.execute(
            select(Lesson).where(Lesson.module_id == m.id)
        )).scalars().all()
        has_video = any(l.video_path for l in lessons)
        has_pdf = any(l.pdf_path for l in lessons)
        if not has_video:
            errors.append(f"Module '{m.title}' has no video")
        if not has_pdf:
            errors.append(f"Module '{m.title}' has no PDF")

    if errors:
        raise HTTPException(400, detail={"errors": errors})

    course.is_published = True
    await db.commit()
    await ActivityLogService.log_activity(db, user.id, "course_published", f"Published: {course.title}", course.id)
    return {"status": "published", "course_id": course_id, "title": course.title}


# ━━━━━━━━━━━━━━━━━━━━ Students ━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/students")
async def get_students(
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_students(db, user.id)


# ━━━━━━━━━━━━━━━━━━━━ Analytics ━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/analytics/completion")
async def completion_rates(
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_completion_rates(db, user.id)


@router.get("/analytics/enrollment-trend")
async def enrollment_trend(
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_enrollment_trend(db, user.id)


# ━━━━━━━━━━━━━━━━━━━━ Activities ━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/activities")
async def get_activities(
    limit: int = Query(30, ge=1, le=100),
    user: User = Depends(get_trainer_user),
    db: AsyncSession = Depends(get_db),
):
    return await TrainerService.get_activities(db, user.id, limit)
