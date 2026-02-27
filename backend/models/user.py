from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from backend.db.base import Base



class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="learner")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending | approved | revoked
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    login_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    activity_logs: Mapped[list["ActivityLog"]] = relationship("ActivityLog", back_populates="user")
    chat_logs: Mapped[list["ChatLog"]] = relationship("ChatLog", back_populates="user", cascade="all, delete-orphan")
    enrollments: Mapped[list["Enrollment"]] = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)