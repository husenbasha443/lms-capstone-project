from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import verify_token
from backend.db.session import get_db
from backend.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = await db.get(User, int(user_id))
    if not user:
        raise credentials_exception

    # ── Enforce approval status ──
    if user.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status}. Contact the administrator.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated.",
        )

    return user


async def require_role(required_roles: list[str], user: User = Depends(get_current_user)) -> User:
    if user.role not in required_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user


async def get_trainer_user(user: User = Depends(get_current_user)) -> User:
    return await require_role(["trainer", "admin"], user)


async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    return await require_role(["admin"], user)
