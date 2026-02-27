from dataclasses import dataclass
from typing import List

from crewai import Agent, Task, Crew

from backend.services.azure_openai_service import AzureOpenAIService


@dataclass
class TopicSegment:
    title: str
    summary: str
    start_index: int
    end_index: int


@dataclass
class TopicSegmentationResult:
    segments: List[TopicSegment]


async def segment_topics(transcript: str) -> TopicSegmentationResult:
    system_prompt = (
        "You are a learning architect. Given a lesson transcript, segment it into logical topics. "
        "Return a JSON array of objects with fields: title, summary, start_index, end_index "
        "(indexes are approximate character offsets)."
    )

    response = await AzureOpenAIService.chat(
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Transcript:\n\n{transcript}",
            },
        ],
        temperature=0.3,
    )

    # Simple robust parsing of LLM JSON-like output
    import json

    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        data = []

    segments: List[TopicSegment] = []
    for item in data:
        try:
            segments.append(
                TopicSegment(
                    title=item.get("title", "Untitled Topic"),
                    summary=item.get("summary", ""),
                    start_index=int(item.get("start_index", 0)),
                    end_index=int(item.get("end_index", 0)),
                )
            )
        except Exception:
            continue

    # Minimal CrewAI wiring for architecture
    agent = Agent(
        role="Topic Segmenter",
        goal="Break lessons into coherent topics.",
        backstory="Expert at structuring long-form educational content.",
        allow_delegation=False,
        verbose=False,
    )
    task = Task(
        description="Segment a lesson transcript into topic blocks.",
        agent=agent,
        expected_output="JSON array of topic segments with title, summary, start_index, end_index.",
    )
    Crew(agents=[agent], tasks=[task])

    return TopicSegmentationResult(segments=segments)

