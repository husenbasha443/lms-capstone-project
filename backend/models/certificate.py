from datetime import datetime
import uuid

from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column

from backend.db.base import Base


def _generate_verification_id() -> str:
    return uuid.uuid4().hex[:12].upper()


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"), nullable=False
    )

    certificate_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    verification_id: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        default=_generate_verification_id,
    )

    ai_mastery_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    revoked: Mapped[bool] = mapped_column(Boolean, default=False)