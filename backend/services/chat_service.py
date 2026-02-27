from __future__ import annotations

import httpx
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.models.chat_log import ChatLog
from backend.models.user import User
from backend.models.course import Course, Module, Lesson
from backend.models.enrollment import Enrollment
from backend.models.activity_log import ActivityLog
from backend.core.config import settings

class ChatService:
    @staticmethod
    async def process_chat(db: AsyncSession, user: User, message: str, mode: str = "internal") -> str:
        """
        Process a chat message from a user.
        mode: "internal" (database data) or "external" (general knowledge via Azure OpenAI)
        """
        response_text = ""
        
        if mode == "internal":
            # 1. Platform/Database context
            db_context = await ChatService._build_context(db, user)
            
            # 2. Vector DB (RAG) context
            from backend.services.chroma_service import ChromaService
            search_results, _ = await ChromaService.query(lesson_id=None, question=message, top_k=5)
            rag_context = "\n".join([f"- {chunk}" for chunk in search_results]) if search_results else "No relevant lesson content found."

            system_prompt = (
                f"You are an AI assistant for an LMS platform. "
                f"The user is a {user.role}. use the following context to answer their question. "
                f"Be helpful and professional.\n\n"
                f"--- Platform Context ---\n{db_context}\n\n"
                f"--- Course Content Context (RAG) ---\n{rag_context}\n\n"
                f"If the answer is not in the context, say you don't have that information."
            )
            response_text = await ChatService._call_llm(system_prompt, message)
        
        else:
            system_prompt = "You are a helpful AI assistant. Answer the user's question to the best of your ability."
            response_text = await ChatService._call_llm(system_prompt, message)

        # Log the chat
        log = ChatLog(
            user_id=user.id,
            role=user.role,
            message=message,
            response=response_text,
            mode=mode
        )
        db.add(log)
        await db.commit()
        
        return response_text

    @staticmethod
    async def _build_context(db: AsyncSession, user: User) -> str:
        context_parts = []
        
        # 1. User Info
        context_parts.append(f"User: {user.full_name} ({user.email}), Role: {user.role}")

        # 2. Courses (Role specific)
        if user.role == "admin":
            # Admin sees all courses
            courses = (await db.execute(select(Course).limit(20))).scalars().all()
            context_parts.append(f"All Courses ({len(courses)}): " + ", ".join([c.title for c in courses]))
            
            # Key Stats
            total_users = (await db.execute(select(func.count(User.id)))).scalar()
            total_courses = (await db.execute(select(func.count(Course.id)))).scalar()
            context_parts.append(f"Platform Stats: {total_users} users, {total_courses} courses.")

        elif user.role == "trainer":
            # Trainer sees their created courses
            courses = (await db.execute(select(Course).where(Course.created_by_id == user.id))).scalars().all()
            context_parts.append(f"My Courses ({len(courses)}): " + ", ".join([c.title for c in courses]))
            
            # Enrollment count for their courses
            if courses:
                course_ids = [c.id for c in courses]
                enrollment_count = (await db.execute(
                    select(func.count(Enrollment.id)).where(Enrollment.course_id.in_(course_ids))
                )).scalar()
                context_parts.append(f"Total Enrollments in my courses: {enrollment_count}")

        elif user.role == "student":
            # Student sees enrolled courses
            enrollments = (await db.execute(
                select(Enrollment).options(selectinload(Enrollment.course)).where(Enrollment.user_id == user.id)
            )).scalars().all()
            enrolled_courses = [e.course.title for e in enrollments if e.course]
            context_parts.append(f"Enrolled Courses: {', '.join(enrolled_courses)}")

        # 3. Recent Activity (for everyone)
        activities = (await db.execute(
            select(ActivityLog).where(ActivityLog.user_id == user.id).order_by(desc(ActivityLog.created_at)).limit(5)
        )).scalars().all()
        
        if activities:
            recent_acts = [f"- {a.action}: {a.detail} ({a.created_at})" for a in activities]
            context_parts.append("Recent Activity:\n" + "\n".join(recent_acts))

        return "\n\n".join(context_parts)

    @staticmethod
    async def _call_llm(system_prompt: str, user_message: str) -> str:
        """
        Call Azure OpenAI (or mock if not configured).
        """
        if not settings.azure_openai_endpoint:
            return "AI Chat is not configured (missing Azure OpenAI endpoint)."

        headers = {
            "Content-Type": "application/json",
            "api-key": settings.azure_openai_key,
        }
        
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 800,
            "temperature": 0.7,
        }

        async with httpx.AsyncClient() as client:
            try:
                # Assuming standard Azure OpenAI deployment URL structure
                url = f"{settings.azure_openai_endpoint}/openai/deployments/{settings.azure_openai_deployment}/chat/completions?api-version=2023-05-15"
                response = await client.post(url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            except Exception as e:
                return f"Error connecting to AI: {str(e)}"

    @staticmethod
    async def get_history(db: AsyncSession, user_id: int, limit: int = 50) -> list[ChatLog]:
        stmt = select(ChatLog).where(ChatLog.user_id == user_id).order_by(ChatLog.created_at.asc()).limit(limit)
        return (await db.execute(stmt)).scalars().all()
