from dataclasses import dataclass

from crewai import Agent, Task, Crew

from backend.services.azure_openai_service import AzureOpenAIService


SYSTEM_PROMPT = (
    "You are a transcript cleaning specialist. Your goal is to turn noisy speech-to-text "
    "output into clean, well-punctuated, readable text without changing the meaning."
)


@dataclass
class CleanTranscriptResult:
    cleaned_transcript: str


async def clean_transcript(transcript: str) -> CleanTranscriptResult:
    """Use Azure OpenAI via a CrewAI-style agent to clean the transcript."""

    async def _llm_call() -> str:
        return await AzureOpenAIService.chat(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Clean the following transcript while preserving meaning:\n\n{transcript}",
                },
            ],
            temperature=0.1,
        )

    # Minimal CrewAI wiring (agent + task + crew) as a sample
    agent = Agent(
        role="Transcript Cleaner",
        goal="Produce a clean, well-formatted transcript.",
        backstory="Expert at turning ASR output into readable learning material.",
        allow_delegation=False,
        verbose=False,
    )

    task = Task(
        description="Clean the given transcript.",
        agent=agent,
        expected_output="A single cleaned transcript string.",
    )

    # We don't rely on Crew to call the LLM directly; instead we use our AzureOpenAIService.
    Crew(agents=[agent], tasks=[task])  # Constructed for architectural completeness

    cleaned = await _llm_call()
    return CleanTranscriptResult(cleaned_transcript=cleaned.strip())

