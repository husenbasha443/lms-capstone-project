from typing import Optional

from crewai import Agent, Task, Crew

from backend.services.azure_openai_service import AzureOpenAIService


REVISION_SYSTEM_PROMPT = (
    "You are a senior teaching assistant. Based on the lesson summary, concepts, and the learner's "
    "weak topics, create a highly targeted revision plan including explanations, practice questions, "
    "and suggested activities."
)


async def generate_revision_plan(
    lesson_title: str,
    summary: str,
    concepts: str,
    weak_topics: Optional[str] = None,
) -> str:
    weak_text = weak_topics or "The learner did not specify weak topics; focus on generally tricky parts."
    user_prompt = (
        f"Lesson title: {lesson_title}\n\n"
        f"Summary:\n{summary}\n\n"
        f"Concepts:\n{concepts}\n\n"
        f"Weak topics:\n{weak_text}\n\n"
        "Create a structured revision plan."
    )

    content = await AzureOpenAIService.chat(
        messages=[
            {"role": "system", "content": REVISION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
    )

    agent = Agent(
        role="Revision Planner",
        goal="Generate targeted revision plans for learners.",
        backstory="Experienced in adaptive learning and remediation.",
        allow_delegation=False,
        verbose=False,
    )
    task = Task(
        description="Generate a revision plan for a learner based on weak topics.",
        agent=agent,
        expected_output="Structured plan with sections and practice questions.",
    )
    Crew(agents=[agent], tasks=[task])

    return content

