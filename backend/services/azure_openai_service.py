import asyncio
from typing import List

from loguru import logger
from openai import AzureOpenAI

from backend.core.config import settings


_client = AzureOpenAI(
    azure_endpoint=str(settings.azure_openai_endpoint),
    api_key=settings.azure_openai_key,
    api_version="2024-02-01",
)


class AzureOpenAIService:
    @staticmethod
    async def chat(
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> str:
        def _call() -> str:
            logger.debug("Calling Azure OpenAI chat completion")
            response = _client.chat.completions.create(
                model=settings.azure_openai_deployment,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _call)

    @staticmethod
    async def embed_texts(texts: List[str]) -> List[List[float]]:
        def _call() -> List[List[float]]:
            logger.debug(f"Calling Azure OpenAI embeddings for {len(texts)} texts")
            response = _client.embeddings.create(
                model=settings.azure_openai_embedding_deployment,
                input=texts,
            )
            return [d.embedding for d in response.data]

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _call)

