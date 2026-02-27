from __future__ import annotations

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from backend.models.activity_log import ActivityLog
from backend.models.user import User


class ActivityLogService:
    @staticmethod
    async def log_activity(
        db: AsyncSession,
        user_id: int | None,
        action: str,
        detail: str | None = None,
        related_course_id: int | None = None,
        ip_address: str | None = None,
    ) -> None:
        entry = ActivityLog(
            user_id=user_id,
            action=action,
            detail=detail,
            related_course_id=related_course_id,
            ip_address=ip_address,
        )
        db.add(entry)
        await db.commit()

    @staticmethod
    async def get_recent(db: AsyncSession, limit: int = 50) -> list[dict]:
        stmt = (
            select(
                ActivityLog.id,
                ActivityLog.action,
                ActivityLog.detail,
                ActivityLog.related_course_id,
                ActivityLog.ip_address,
                ActivityLog.created_at,
                User.full_name.label("user_name"),
                User.role.label("user_role"),
            )
            .outerjoin(User, User.id == ActivityLog.user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
        )
        rows = (await db.execute(stmt)).all()
        return [
            {
                "id": r.id,
                "action": r.action,
                "detail": r.detail,
                "related_course_id": r.related_course_id,
                "ip_address": r.ip_address,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "user_name": r.user_name,
                "user_role": r.user_role,
            }
            for r in rows
        ]

    @staticmethod
    async def get_user_activity(db: AsyncSession, user_id: int, limit: int = 30) -> list[dict]:
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
        )
        rows = (await db.execute(stmt)).scalars().all()
        return [
            {
                "id": r.id,
                "action": r.action,
                "detail": r.detail,
                "related_course_id": r.related_course_id,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
