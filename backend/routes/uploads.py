from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.dependencies import get_current_user
from backend.models.user import User
from backend.models.course import Lesson
from backend.services.file_service import FileService
from backend.services.knowledge_pipeline_service import KnowledgePipelineService


router = APIRouter()


@router.post("/lessons/{lesson_id}/upload")
async def upload_lesson_file(
    lesson_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:

    # 🔐 ROLE CHECK
    if current_user.role not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload")

    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    ext = file.filename.split(".")[-1].lower()

    # 🎯 Decide file type
    if ext in ["mp4", "mov", "avi"]:
        category = "videos"
        field_name = "video_url"

    elif ext in ["mp3", "wav"]:
        category = "audio"
        field_name = "audio_url"

    elif ext in ["pdf"]:
        category = "pdfs"
        field_name = "pdf_url"

    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # 📁 Save file using FileService
    stored_path = await FileService.save_upload_file(
        file=file,
        category=category
    )

    # 🗂 Update correct DB column dynamically
    setattr(lesson, field_name, stored_path)

    await db.commit()

    # 🔥 If video uploaded → trigger AI pipeline
    if category == "videos":
        background_tasks.add_task(
            KnowledgePipelineService.process_lesson_recording,
            lesson_id,
            stored_path
        )

    return {
        "status": "uploaded",
        "file_type": category,
        "stored_path": stored_path
    }