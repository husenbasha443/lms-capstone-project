from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# =========================================================
# LESSON SCHEMAS
# =========================================================

class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0


class LessonCreate(LessonBase):
    module_id: int


# 🔥 UPDATED (ONLY ADDED FIELDS — NOTHING REMOVED)
class LessonUpdateProgress(BaseModel):
    lesson_id: int = Field(..., gt=0)  # ✅ ADDED

    completion_percentage: int = Field(..., ge=0, le=100)
    last_position_seconds: int = Field(..., ge=0)

    is_completed: bool = False
    weak_topics: Optional[str] = None

    class Config:
        from_attributes = True


class LessonOut(LessonBase):
    id: int
    module_id: int

    # =========================
    # EXISTING MEDIA FIELDS (NOT REMOVED)
    # =========================
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None

    # =========================
    # 🔥 ADDITIONAL FIELDS (FOR DB COMPATIBILITY)
    # =========================
    video_path: Optional[str] = None
    pdf_path: Optional[str] = None
    audio_summary_url: Optional[str] = None

    # =========================
    # AI / Transcript fields
    # =========================
    transcript: Optional[str] = None
    cleaned_transcript: Optional[str] = None
    summary: Optional[str] = None
    key_takeaways: Optional[str] = None
    concepts: Optional[str] = None

    transcript_status: Optional[str] = None
    processed: bool = False
    created_at: datetime

    # 🔥 ADDITIONAL PROGRESS INFO (SAFE FOR FRONTEND)
    completion_percentage: Optional[int] = 0
    is_completed: Optional[bool] = False
    last_position_seconds: Optional[int] = 0

    class Config:
        from_attributes = True


# =========================================================
# MODULE SCHEMAS
# =========================================================

class ModuleBase(BaseModel):
    title: str
    order_index: int = 0


class ModuleCreate(ModuleBase):
    course_id: int


class ModuleOut(ModuleBase):
    id: int
    course_id: int
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True


# =========================================================
# COURSE SCHEMAS
# =========================================================

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    id: int
    created_by_id: int
    is_published: bool = False
    created_at: datetime

    modules: List[ModuleOut] = []

    # Enrollment / progress fields
    is_enrolled: bool = False
    progress_percentage: int = 0
    completed_lessons: int = 0
    total_lessons: int = 0

    # =========================
    # UI SAFE FIELDS (UNCHANGED)
    # =========================
    instructor: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = "Beginner"
    category: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    students: Optional[int] = None

    aiFeatures: List[str] = ["AI Transcript", "Audio Summary", "AI Q&A"]
    aiIcons: List[str] = ["description", "mic", "smart_toy"]

    enrolled: bool = False  # legacy alias

    # 🔥 ADDITIONAL SMART METRICS (SAFE ADDITION)
    average_completion_time: Optional[int] = None
    certificate_eligible: Optional[bool] = False

    class Config:
        from_attributes = True