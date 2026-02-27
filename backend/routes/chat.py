from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from backend.db.session import get_db
from backend.models.user import User
from backend.services.chat_service import ChatService
from backend.dependencies import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    mode: str = "internal"  # internal | external

@router.post("/message")
async def chat_message(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to the AI Chatbot.
    """
    response = await ChatService.process_chat(db, user, payload.message, payload.mode)
    return {"response": response}

@router.get("/history")
async def chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get chat history for the current user.
    """
    history = await ChatService.get_history(db, user.id)
    return [
        {
            "id": h.id,
            "role": h.role,
            "message": h.message,
            "response": h.response,
            "mode": h.mode,
            "timestamp": h.created_at
        }
        for h in history
    ]