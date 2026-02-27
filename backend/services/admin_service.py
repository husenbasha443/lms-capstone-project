from fastapi import HTTPException
from sqlalchemy import func, select, case, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import get_password_hash
from backend.models.user import User
from backend.models.course import Course, Module, Lesson, LessonProgress
from backend.models.activity_log import ActivityLog
from backend.schemas.admin import (
    AdminStats,
    RoleCount,
    RecentUser,
    TopCourse,
    PaginatedUsers,
    UserListItem,
)


class AdminService:
    @staticmethod
    async def get_stats(db: AsyncSession) -> AdminStats:
        # Total counts
        total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
        total_courses = (await db.execute(select(func.count(Course.id)))).scalar() or 0
        total_modules = (await db.execute(select(func.count(Module.id)))).scalar() or 0
        total_lessons = (await db.execute(select(func.count(Lesson.id)))).scalar() or 0

        # Active users
        active_users = (
            await db.execute(
                select(func.count(User.id)).where(User.is_active == True)
            )
        ).scalar() or 0

        # Average completion rate
        avg_completion = (
            await db.execute(select(func.avg(LessonProgress.completion_percentage)))
        ).scalar() or 0.0

        # Processed / unprocessed lessons
        processed_lessons = (
            await db.execute(
                select(func.count(Lesson.id)).where(Lesson.processed == True)
            )
        ).scalar() or 0
        unprocessed_lessons = total_lessons - processed_lessons

        # Role distribution
        role_rows = (
            await db.execute(
                select(User.role, func.count(User.id))
                .group_by(User.role)
            )
        ).all()
        role_distribution = [RoleCount(role=r, count=c) for r, c in role_rows]

        # Recent users (last 20)
        recent_stmt = (
            select(User)
            .order_by(desc(User.created_at))
            .limit(20)
        )
        recent_result = (await db.execute(recent_stmt)).scalars().all()
        recent_users = [
            RecentUser(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                role=u.role,
                created_at=u.created_at.isoformat() if u.created_at else None,
            )
            for u in recent_result
        ]

        # Top courses by enrollment
        top_stmt = (
            select(
                Course.id,
                Course.title,
                func.count(func.distinct(LessonProgress.user_id)).label("enrolled_count"),
                func.coalesce(func.avg(LessonProgress.completion_percentage), 0).label("avg_completion"),
            )
            .outerjoin(Module, Module.course_id == Course.id)
            .outerjoin(Lesson, Lesson.module_id == Module.id)
            .outerjoin(LessonProgress, LessonProgress.lesson_id == Lesson.id)
            .group_by(Course.id, Course.title)
            .order_by(desc("enrolled_count"))
            .limit(10)
        )
        top_rows = (await db.execute(top_stmt)).all()
        top_courses = [
            TopCourse(
                id=row.id,
                title=row.title,
                enrolled_count=row.enrolled_count,
                avg_completion=round(float(row.avg_completion), 1),
            )
            for row in top_rows
        ]

        return AdminStats(
            total_users=total_users,
            total_courses=total_courses,
            total_modules=total_modules,
            total_lessons=total_lessons,
            avg_completion_rate=round(float(avg_completion), 1),
            active_users=active_users,
            processed_lessons=processed_lessons,
            unprocessed_lessons=unprocessed_lessons,
            role_distribution=role_distribution,
            recent_users=recent_users,
            top_courses=top_courses,
        )

    @staticmethod
    async def list_users(
        db: AsyncSession, page: int = 1, page_size: int = 20, role: str | None = None
    ) -> PaginatedUsers:
        base = select(func.count(User.id))
        if role:
            base = base.where(User.role == role)
        total = (await db.execute(base)).scalar() or 0
        offset = (page - 1) * page_size
        stmt = select(User).order_by(desc(User.created_at)).offset(offset).limit(page_size)
        if role:
            stmt = stmt.where(User.role == role)
        result = (await db.execute(stmt)).scalars().all()
        users = [
            UserListItem(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                role=u.role,
                status=u.status,
                is_active=u.is_active,
                login_attempts=u.login_attempts or 0,
                last_login=u.last_login.isoformat() if u.last_login else None,
                created_at=u.created_at.isoformat() if u.created_at else None,
            )
            for u in result
        ]
        return PaginatedUsers(users=users, total=total, page=page, page_size=page_size)

    @staticmethod
    async def toggle_user_active(db: AsyncSession, user_id: int) -> UserListItem:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = not user.is_active
        await db.commit()
        await db.refresh(user)
        db.add(ActivityLog(
            user_id=user_id,
            action="user_toggled",
            detail=f"User {'activated' if user.is_active else 'deactivated'}",
        ))
        await db.commit()
        return UserListItem(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            status=user.status,
            is_active=user.is_active,
            login_attempts=user.login_attempts or 0,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        )

    @staticmethod
    async def reset_user_password(db: AsyncSession, user_id: int, new_password: str) -> dict:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.hashed_password = get_password_hash(new_password)
        await db.commit()
        db.add(ActivityLog(
            user_id=user_id,
            action="password_reset",
            detail=f"Password reset by admin for {user.full_name}",
        ))
        await db.commit()
        return {"status": "password_reset", "user_id": user_id}

    # ── Approval Workflow ──────────────────────────────────
    @staticmethod
    async def approve_user(db: AsyncSession, user_id: int, admin_id: int) -> UserListItem:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.role == "admin":
            raise HTTPException(status_code=400, detail="Cannot modify admin status")
        user.status = "approved"
        await db.commit()
        await db.refresh(user)
        db.add(ActivityLog(
            user_id=admin_id,
            action="user_approved",
            detail=f"Admin approved {user.full_name} ({user.email})",
        ))
        await db.commit()
        return UserListItem(
            id=user.id, full_name=user.full_name, email=user.email,
            role=user.role, status=user.status, is_active=user.is_active,
            login_attempts=user.login_attempts or 0,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        )

    @staticmethod
    async def revoke_user(db: AsyncSession, user_id: int, admin_id: int) -> UserListItem:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.role == "admin":
            raise HTTPException(status_code=400, detail="Cannot revoke admin account")
        user.status = "revoked"
        await db.commit()
        await db.refresh(user)
        db.add(ActivityLog(
            user_id=admin_id,
            action="user_revoked",
            detail=f"Admin revoked {user.full_name} ({user.email})",
        ))
        await db.commit()
        return UserListItem(
            id=user.id, full_name=user.full_name, email=user.email,
            role=user.role, status=user.status, is_active=user.is_active,
            login_attempts=user.login_attempts or 0,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        )

    @staticmethod
    async def change_user_role(db: AsyncSession, user_id: int, new_role: str, admin_id: int) -> UserListItem:
        if new_role not in ("learner", "trainer"):
            raise HTTPException(status_code=400, detail="Role must be 'learner' or 'trainer'")
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.role == "admin":
            raise HTTPException(status_code=400, detail="Cannot change admin's role")
        old_role = user.role
        user.role = new_role
        await db.commit()
        await db.refresh(user)
        db.add(ActivityLog(
            user_id=admin_id,
            action="role_changed",
            detail=f"Changed {user.full_name} role from {old_role} to {new_role}",
        ))
        await db.commit()
        return UserListItem(
            id=user.id, full_name=user.full_name, email=user.email,
            role=user.role, status=user.status, is_active=user.is_active,
            login_attempts=user.login_attempts or 0,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        )
