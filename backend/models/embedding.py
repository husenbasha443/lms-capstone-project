from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.db.base import Base


class LessonChunk(Base):
    """
    Metadata table to map lesson chunks stored in ChromaDB.
    Embedding vectors are persisted in Chroma; we keep only IDs and text here.
    """

    __tablename__ = "lesson_chunks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), index=True, nullable=False)
    chunk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

