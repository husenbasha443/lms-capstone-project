from __future__ import annotations

from typing import List

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import AsyncSessionLocal
from backend.models.course import Lesson
from backend.models.embedding import LessonChunk
from backend.services.chroma_service import ChromaService
from backend.services.speech_service import SpeechService
import fitz  # PyMuPDF
from ai_agents.knowledge_processing import run_knowledge_processing_pipeline, chunk_text


class KnowledgePipelineService:
    @staticmethod
    async def extract_text_from_pdf(file_path: str) -> str:
        """
        Extract text from a PDF file using PyMuPDF.
        """
        text = ""
        try:
            # fitz.open is blocking, but for small-medium PDFs it's usually fast enough.
            # For a production system, consider running in an executor.
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            return text.strip()
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {file_path}: {e}")
            return ""

    @staticmethod
    async def process_lesson_recording(lesson_id: int, file_path: str) -> None:
        """
        End-to-end pipeline:
        - Transcribe audio OR extract PDF text
        - Clean transcript, segment topics, summarize, extract concepts via CrewAI-based agents
        - Chunk content, generate embeddings, store metadata in DB and embeddings in ChromaDB
        """
        logger.info(f"Starting knowledge pipeline for lesson {lesson_id} with file {file_path}")

        async with AsyncSessionLocal() as db:
            lesson = await db.get(Lesson, lesson_id)
            if not lesson:
                logger.error(f"Lesson {lesson_id} not found for pipeline")
                return

            # Determine processing type based on file extension
            ext = file_path.lower().split('.')[-1]
            content = ""

            if ext in ['pdf']:
                logger.info(f"Processing PDF for lesson {lesson_id}")
                content = await KnowledgePipelineService.extract_text_from_pdf(file_path)
            else:
                # Assume audio/video for other types (transcription)
                logger.info(f"Transcribing audio for lesson {lesson_id}")
                content = await SpeechService.transcribe_audio_from_file(file_path)

            if not content:
                logger.warning(f"No content extracted for lesson {lesson_id}")
                lesson.transcript_status = "failed"
                await db.commit()
                return

            lesson.transcript = content
            await db.commit()
            await db.refresh(lesson)

            try:
                # Use transcription/content as the basis for AI insights
                result = await run_knowledge_processing_pipeline(content)

                lesson.cleaned_transcript = result.cleaned_transcript
                lesson.summary = result.summary
                lesson.key_takeaways = result.key_takeaways
                lesson.concepts = result.concepts

                # Chunk the cleaned transcript for RAG
                chunks: List[str] = chunk_text(result.cleaned_transcript or content)
                ids = await ChromaService.add_lesson_chunks(lesson.id, chunks)

                for idx, (cid, text) in enumerate(zip(ids, chunks)):
                    db.add(
                        LessonChunk(
                            lesson_id=lesson.id,
                            chunk_id=cid,
                            content=text,
                            order_index=idx,
                        )
                    )

                lesson.processed = True
                lesson.transcript_status = "completed"
                await db.commit()
                logger.info(f"Completed knowledge pipeline for lesson {lesson_id}")

            except Exception as e:
                logger.error(f"Knowledge pipeline failed for lesson {lesson_id}: {e}")
                lesson.transcript_status = "failed"
                await db.commit()

