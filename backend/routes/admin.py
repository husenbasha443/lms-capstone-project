from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request


from backend.db.session import get_db
from backend.dependencies import get_admin_user
from backend.models.user import User
from backend.models.course import Course, Module, Lesson
from backend.models.activity_log import ActivityLog
from backend.core.config import settings
from backend.services.admin_service import AdminService
from backend.services.activity_log_service import ActivityLogService
from backend.services.analytics_service import AnalyticsService
from backend.services.certificate_service import CertificateService
from backend.services.file_service import FileService
from backend.services.knowledge_pipeline_service import KnowledgePipelineService
from backend.schemas.admin import (
    AdminStats,
    PaginatedUsers,
    ResetPasswordAdmin,
    CourseCreateAdmin,
    CourseUpdateAdmin,
    ModuleCreateAdmin,
    ChangeRoleRequest,
)

router = APIRouter(dependencies=[Depends(get_admin_user)])


# ━━━━━━━━━━━━━━━━━━━━ Dashboard Stats ━━━━━━━━━━━━━━━━━━━━
@router.get("/stats", response_model=AdminStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await AdminService.get_stats(db)


# ━━━━━━━━━━━━━━━━━━━━ Users ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/users", response_model=PaginatedUsers)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService.list_users(db, page, page_size, role)


@router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(user_id: int, db: AsyncSession = Depends(get_db)):
    return await AdminService.toggle_user_active(db, user_id)


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int, payload: ResetPasswordAdmin, db: AsyncSession = Depends(get_db)
):
    return await AdminService.reset_user_password(db, user_id, payload.new_password)


@router.get("/users/{user_id}/activity")
async def get_user_activity(user_id: int, db: AsyncSession = Depends(get_db)):
    return await ActivityLogService.get_user_activity(db, user_id)


# ━━━━━━━━━━━━━━━━ Approval Workflow ━━━━━━━━━━━━━━━━━━━━━━
@router.post("/users/{user_id}/approve")
async def approve_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService.approve_user(db, user_id, admin.id)


@router.post("/users/{user_id}/revoke")
async def revoke_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService.revoke_user(db, user_id, admin.id)


@router.post("/users/{user_id}/change-role")
async def change_user_role(
    user_id: int,
    payload: ChangeRoleRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService.change_user_role(db, user_id, payload.role, admin.id)


# ━━━━━━━━━━━━━━━━━━━━ Activity Log ━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/activities")
async def list_activities(
    limit: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db)
):
    return await ActivityLogService.get_recent(db, limit)


# ━━━━━━━━━━━━━━━━━━━━ Analytics ━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/analytics/completion")
async def analytics_completion(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_course_completion_rates(db)


@router.get("/analytics/difficult-topics")
async def analytics_difficult_topics(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_difficult_topics(db)


@router.get("/analytics/enrollment-trend")
async def analytics_enrollment_trend(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_enrollment_trend(db)


@router.get("/analytics/registrations")
async def analytics_registrations(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_recent_registrations(db)


# ━━━━━━━━━━━━━━━━━━━━ Certificates ━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/certificates")
async def list_certificates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await CertificateService.list_certificates(db, page, page_size)


@router.post("/certificates/{cert_id}/revoke")
async def revoke_certificate(cert_id: int, db: AsyncSession = Depends(get_db)):
    return await CertificateService.revoke(db, cert_id)


# ━━━━━━━━━━━━━━━━━━━━ Course CRUD ━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses")
async def list_courses(db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Course)
        .options(selectinload(Course.creator))
        .order_by(Course.created_at.desc())
    )
    result_set = await db.execute(stmt)
    courses = result_set.scalars().all()
    
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
        result.append({
            "id": c.id, "title": c.title, "description": c.description,
            "is_published": c.is_published,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "trainer_name": c.creator.full_name if c.creator else "Unknown",
            "trainer_email": c.creator.email if c.creator else "N/A",
            "modules": mod_list,
        })
    return result


@router.post("/courses")
async def create_course(
    payload: CourseCreateAdmin,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    course = Course(title=payload.title, description=payload.description, created_by_id=admin.id)
    db.add(course)
    await db.commit()
    await db.refresh(course)
    db.add(ActivityLog(user_id=admin.id, action="course_created", detail=course.title, related_course_id=course.id))
    await db.commit()
    return {"id": course.id, "title": course.title}


@router.put("/courses/{course_id}")
async def update_course(
    course_id: int, payload: CourseUpdateAdmin, db: AsyncSession = Depends(get_db)
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
    await db.commit()
    await db.refresh(course)
    return {"id": course.id, "title": course.title}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    await db.delete(course)
    await db.commit()
    return {"status": "deleted", "id": course_id}


@router.post("/courses/{course_id}/modules")
async def create_module(
    course_id: int,
    payload: ModuleCreateAdmin,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    module = Module(course_id=course_id, title=payload.title, order_index=payload.order_index)
    db.add(module)
    await db.commit()
    await db.refresh(module)
    db.add(ActivityLog(user_id=admin.id, action="module_created", detail=module.title, related_course_id=course_id))
    await db.commit()
    return {"id": module.id, "title": module.title, "course_id": course_id}


# ━━━━━━━━━━━━━━━━━━━━ File Upload ━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/modules/{module_id}/upload-video")
async def upload_module_video(
    module_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    request: Request = None, 
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if request:
        print(f"DEBUG HEADER Content-Type: {request.headers.get('content-type')}")
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # Find or create the first lesson in the module
    result = await db.execute(select(Lesson).where(Lesson.module_id == module_id).limit(1))
    lesson = result.scalar_one_or_none()
    if not lesson:
        lesson = Lesson(module_id=module_id, title=f"{module.title} — Video", order_index=0)
        db.add(lesson)
        await db.commit()
        await db.refresh(lesson)

    file_path = await FileService.save_upload_file(
        file=file,
        category="videos"
    )
    lesson.video_path = file_path
    lesson.transcript_status = "processing"
    await db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="video_uploaded",
        detail=f"Video uploaded for module: {module.title}",
        related_course_id=module.course_id,
    ))
    await db.commit()

    # Trigger async transcript generation
    background_tasks.add_task(KnowledgePipelineService.process_lesson_recording, lesson.id, file_path)

    return {"status": "uploaded", "blob_url": file_path, "lesson_id": lesson.id}


@router.post("/modules/{module_id}/upload-pdf")
async def upload_module_pdf(
    module_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    request: Request = None, 
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if request:
        print(f"DEBUG HEADER Content-Type: {request.headers.get('content-type')}")
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    file_path = await FileService.save_upload_file(
        file=file,
        category="pdfs"
    )

    # Store PDF url on the lesson
    result = await db.execute(select(Lesson).where(Lesson.module_id == module_id).limit(1))
    lesson = result.scalar_one_or_none()
    if not lesson:
        lesson = Lesson(module_id=module_id, title=f"{module.title} — Material", order_index=0)
        db.add(lesson)
        await db.commit()
        await db.refresh(lesson)

    lesson.pdf_path = file_path
    lesson.transcript_status = "processing"
    await db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="pdf_uploaded",
        detail=f"PDF uploaded for module: {module.title}",
        related_course_id=module.course_id,
    ))
    await db.commit()

    # Trigger async PDF processing (text extraction + AI pipeline)
    background_tasks.add_task(KnowledgePipelineService.process_lesson_recording, lesson.id, file_path)

    return {"status": "uploaded", "blob_url": file_path, "lesson_id": lesson.id}


# ━━━━━━━━━━━━━━━━━━━━ Publish Validation ━━━━━━━━━━━━━━━━━
@router.post("/courses/{course_id}/publish")
async def publish_course(
    course_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Validates every module has at least 1 video AND 1 PDF before publishing."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = (
        await db.execute(select(Module).where(Module.course_id == course_id))
    ).scalars().all()

    if not modules:
        raise HTTPException(status_code=400, detail="Course has no modules — cannot publish")

    errors = []
    for mod in modules:
        lessons = (
            await db.execute(select(Lesson).where(Lesson.module_id == mod.id))
        ).scalars().all()
        has_video = any(l.video_path for l in lessons)
        has_pdf = any(l.pdf_path for l in lessons)
        if not has_video:
            errors.append(f"Module '{mod.title}' has no video")
        if not has_pdf:
            errors.append(f"Module '{mod.title}' has no PDF")

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    course.is_published = True
    await db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="course_published",
        detail=f"Course '{course.title}' published",
        related_course_id=course.id,
    ))
    await db.commit()

    return {"status": "published", "course_id": course_id, "title": course.title}


# ━━━━━━━━━━━━━━━━━━━━ Export ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/export/{export_type}")
async def export_report(export_type: str, db: AsyncSession = Depends(get_db)):
    """Export CSV: users | courses | activities"""
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "users":
        writer.writerow(["ID", "Name", "Email", "Role", "Status", "Active", "Last Login", "Joined"])
        users = (await db.execute(select(User).order_by(User.id))).scalars().all()
        for u in users:
            writer.writerow([
                u.id, u.full_name, u.email, u.role, u.status, u.is_active,
                u.last_login.isoformat() if u.last_login else "",
                u.created_at.isoformat() if u.created_at else "",
            ])
    elif export_type == "courses":
        writer.writerow(["ID", "Title", "Description", "Published", "Created By", "Created At"])
        courses = (await db.execute(select(Course).order_by(Course.id))).scalars().all()
        for c in courses:
            writer.writerow([c.id, c.title, c.description or "", c.is_published, c.created_by_id, c.created_at.isoformat() if c.created_at else ""])
    elif export_type == "activities":
        writer.writerow(["ID", "Action", "Detail", "Course ID", "Timestamp"])
        activities = (
            await db.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(500))
        ).scalars().all()
        for a in activities:
            writer.writerow([a.id, a.action, a.detail or "", a.related_course_id or "", a.created_at.isoformat() if a.created_at else ""])
    else:
        raise HTTPException(status_code=400, detail="Invalid export type. Use: users, courses, activities")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={export_type}_report.csv"},
    )
