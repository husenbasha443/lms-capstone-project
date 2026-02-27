from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    related_course_id: Mapped[int | None] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"), nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, index=True
    )
    user: Mapped["User"] = relationship("User", back_populates="activity_logs")
