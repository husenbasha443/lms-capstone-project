from __future__ import annotations

import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.db.base import Base


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # "admin", "trainer", "student"
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    mode = Column(String, default="internal")  # "internal" or "external"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_logs")
