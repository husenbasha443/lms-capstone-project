from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False, index=True)
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
