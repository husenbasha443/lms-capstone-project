from __future__ import annotations

import asyncio
from typing import List, Tuple

import chromadb
from chromadb.api.types import Documents, Embeddings, QueryResult
from loguru import logger

from backend.core.config import settings
from backend.services.azure_openai_service import AzureOpenAIService


_client = chromadb.PersistentClient(path=settings.chroma_db_dir)
_collection = _client.get_or_create_collection(name=settings.chroma_collection_name)


class ChromaService:
    @staticmethod
    async def add_lesson_chunks(
        lesson_id: int,
        chunks: List[str],
    ) -> List[str]:
        """
        Store chunks in Chroma with Azure OpenAI embeddings and return their IDs.
        """
        if not chunks:
            return []

        embeddings = await AzureOpenAIService.embed_texts(chunks)
        ids = [f"lesson-{lesson_id}-chunk-{i}" for i in range(len(chunks))]

        def _add() -> None:
            logger.info(f"Adding {len(chunks)} chunks to Chroma for lesson {lesson_id}")
            _collection.add(
                ids=ids,
                documents=Documents(chunks),
                embeddings=Embeddings(embeddings),
                metadatas=[{"lesson_id": str(lesson_id), "chunk_index": i} for i in range(len(chunks))],
            )

        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _add)
        return ids

    @staticmethod
    async def query(
        lesson_id: int | None,
        question: str,
        top_k: int = 5,
    ) -> Tuple[List[str], List[float]]:
        """
        Query ChromaDB for the most relevant chunks.
        If lesson_id is provided, filters for that lesson.
        """

        query_embedding = (await AzureOpenAIService.embed_texts([question]))[0]

        def _query() -> QueryResult:
            logger.info(f"Querying Chroma{' for lesson ' + str(lesson_id) if lesson_id else ' globally'}")
            where_filter = {"lesson_id": str(lesson_id)} if lesson_id else None
            return _collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter,
            )

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, _query)

        documents = result.get("documents", [[]])[0]
        distances = result.get("distances", [[]])[0]
        return list(documents), list(distances)

