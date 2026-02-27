from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.models.user import User
from backend.models.activity_log import ActivityLog
from backend.schemas.user import UserCreate, UserOut, Token


class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, payload: UserCreate) -> UserOut:
        # ── Block admin registration ──
        if payload.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin registration is not allowed. Contact the platform administrator.",
            )

        # ── Check duplicate email ──
        existing = await db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        # ── Create user with status=pending ──
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
            role=payload.role,
            status="pending",
            is_active=True,
            login_attempts=0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Log registration activity
        db.add(ActivityLog(
            user_id=user.id,
            action="user_registered",
            detail=f"{user.full_name} registered as {user.role} (pending approval)",
        ))
        await db.commit()

        return UserOut.model_validate(user)

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str, ip_address: str | None = None) -> Token:
        # ── Find user first to track login attempts ──
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # ── Increment login attempts ──
        user.login_attempts = (user.login_attempts or 0) + 1
        await db.commit()

        # ── Verify password ──
        if not verify_password(password, user.hashed_password):
            db.add(ActivityLog(
                user_id=user.id,
                action="login_failed",
                detail=f"Failed login attempt #{user.login_attempts}",
                ip_address=ip_address,
            ))
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # ── Check approval status ──
        if user.status == "pending":
            db.add(ActivityLog(
                user_id=user.id,
                action="login_blocked",
                detail="Login blocked — account pending approval",
                ip_address=ip_address,
            ))
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending admin approval. Please wait for approval before logging in.",
            )

        if user.status == "revoked":
            db.add(ActivityLog(
                user_id=user.id,
                action="login_blocked",
                detail="Login blocked — account revoked",
                ip_address=ip_address,
            ))
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been revoked. Contact the administrator.",
            )

        # ── Check active status ──
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Contact the administrator.",
            )

        # ── Success — update last_login, reset login attempts ──
        user.last_login = datetime.now(timezone.utc)
        user.login_attempts = 0
        await db.commit()

        # Log successful login
        db.add(ActivityLog(
            user_id=user.id,
            action="login_success",
            detail=f"{user.full_name} logged in",
            ip_address=ip_address,
        ))
        await db.commit()

        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)

    @staticmethod
    async def change_password(
        db: AsyncSession, user_id: int, current_password: str, new_password: str
    ) -> dict:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        user.hashed_password = get_password_hash(new_password)
        await db.commit()

        db.add(ActivityLog(
            user_id=user.id,
            action="password_changed",
            detail=f"{user.full_name} changed their password",
        ))
        await db.commit()

        return {"status": "password_changed"}

    @staticmethod
    async def update_profile(
        db: AsyncSession, user_id: int, full_name: str | None, email: str | None
    ) -> UserOut:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if email and email != user.email:
            existing = await db.execute(select(User).where(User.email == email))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email already in use")
            user.email = email

        if full_name:
            user.full_name = full_name

        await db.commit()
        await db.refresh(user)

        db.add(ActivityLog(
            user_id=user.id,
            action="profile_updated",
            detail=f"{user.full_name} updated their profile",
        ))
        await db.commit()

        return UserOut.model_validate(user)
