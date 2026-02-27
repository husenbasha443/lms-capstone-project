from typing import List, Optional

from pydantic import BaseModel


class AskAIRequest(BaseModel):
    lesson_id: int
    question: str


class RetrievedChunk(BaseModel):
    content: str
    score: float


class AskAIResponse(BaseModel):
    answer: str
    chunks: List[RetrievedChunk]


class AudioSummaryRequest(BaseModel):
    lesson_id: int


class AudioSummaryResponse(BaseModel):
    audio_url: str


class RevisionRequest(BaseModel):
    lesson_id: int
    weak_topics: Optional[str] = None


class RevisionResponse(BaseModel):
    revision_plan: str

