from dataclasses import dataclass
from typing import List

from crewai import Agent, Task, Crew

from backend.services.azure_openai_service import AzureOpenAIService


@dataclass
class ConceptExtractionResult:
    concepts: List[str]


async def extract_concepts(transcript: str) -> ConceptExtractionResult:
    system_prompt = (
        "You are a learning scientist. Extract the important concepts, definitions, and skills from "
        "the lesson transcript. Return them as a simple bullet list."
    )

    content = await AzureOpenAIService.chat(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Transcript:\n\n{transcript}"},
        ],
        temperature=0.3,
    )

    concepts = [line.strip("-• ").strip() for line in content.splitlines() if line.strip()]

    agent = Agent(
        role="Concept Extractor",
        goal="Identify key concepts learners must master.",
        backstory="Expert in mapping content to learning objectives.",
        allow_delegation=False,
        verbose=False,
    )
    task = Task(
        description="Extract key concepts from the lesson.",
        agent=agent,
        expected_output="Bullet list of key concepts.",
    )
    Crew(agents=[agent], tasks=[task])

    return ConceptExtractionResult(concepts=concepts)

