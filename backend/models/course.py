from datetime import datetime
from typing import List

from sqlalchemy import String, ForeignKey, DateTime, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships
    modules: Mapped[List["Module"]] = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Module.order_index"
    )
    creator: Mapped["User"] = relationship("User")
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan"
    )


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(
        ForeignKey("modules.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # ===== MEDIA FILE PATHS =====
    video_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    pdf_path: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ===== AI / EXTRA FIELDS =====
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    cleaned_transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_takeaways: Mapped[str | None] = mapped_column(Text, nullable=True)
    concepts: Mapped[str | None] = mapped_column(Text, nullable=True)

    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    transcript_status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships (string references avoid circular imports)
    module: Mapped["Module"] = relationship(
        "Module",
        back_populates="lessons"
    )

    progresses: Mapped[List["LessonProgress"]] = relationship(
        "LessonProgress",
        back_populates="lesson",
        cascade="all, delete-orphan"
    )


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"), nullable=False
    )
    completion_percentage: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    last_position_seconds: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    last_accessed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="progresses")