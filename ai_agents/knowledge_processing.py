from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ai_agents.transcript_cleaner import clean_transcript
from ai_agents.summary_agent import summarize_lesson
from ai_agents.concept_extractor import extract_concepts


@dataclass
class KnowledgeProcessingResult:
    cleaned_transcript: str
    summary: str
    key_takeaways: str
    concepts: str


def chunk_text(text: str, max_chars: int = 800) -> List[str]:
    """
    Simple text chunking by character length, keeping sentence boundaries where possible.
    This feeds into the RAG pipeline.
    """
    if not text:
        return []

    chunks: List[str] = []
    current = ""
    for sentence in text.split(". "):
        sentence = sentence.strip()
        if not sentence:
            continue
        candidate = (current + " " + sentence).strip() if current else sentence
        if len(candidate) > max_chars and current:
            chunks.append(current.strip())
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current.strip())
    return chunks


async def run_knowledge_processing_pipeline(transcript: str) -> KnowledgeProcessingResult:
    """
    Orchestrate the knowledge processing agents in sequence.
    """
    cleaned = await clean_transcript(transcript)
    summary_res = await summarize_lesson(cleaned.cleaned_transcript)
    concepts_res = await extract_concepts(cleaned.cleaned_transcript)

    return KnowledgeProcessingResult(
        cleaned_transcript=cleaned.cleaned_transcript,
        summary=summary_res.summary,
        key_takeaways=summary_res.key_takeaways,
        concepts="\n".join(concepts_res.concepts),
    )

