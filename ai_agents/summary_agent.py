from dataclasses import dataclass

from crewai import Agent, Task, Crew

from backend.services.azure_openai_service import AzureOpenAIService


@dataclass
class SummaryResult:
    summary: str
    key_takeaways: str


async def summarize_lesson(transcript: str) -> SummaryResult:
    system_prompt = (
        "You are an expert instructor. Create a concise summary of the lesson and list key takeaways "
        "as bullet points suitable for revision."
    )

    content = await AzureOpenAIService.chat(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Transcript:\n\n{transcript}"},
        ],
        temperature=0.3,
    )

    # Heuristically split summary vs key takeaways
    parts = content.split("Key Takeaways:")
    summary = parts[0].strip()
    key_takeaways = parts[1].strip() if len(parts) > 1 else ""

    agent = Agent(
        role="Lesson Summarizer",
        goal="Produce summaries and key takeaways learners can quickly review.",
        backstory="Specialist in instructional design.",
        allow_delegation=False,
        verbose=False,
    )
    task = Task(
        description="Summarize the lesson and extract key takeaways.",
        agent=agent,
        expected_output="Narrative summary plus 'Key Takeaways' section.",
    )
    Crew(agents=[agent], tasks=[task])

    return SummaryResult(summary=summary, key_takeaways=key_takeaways)

