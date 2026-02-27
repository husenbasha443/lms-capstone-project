from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.schemas.user import UserCreate, UserOut, Token, ChangePassword, ProfileUpdate
from backend.services.auth_service import AuthService
from backend.services.activity_log_service import ActivityLogService
from backend.dependencies import get_current_user
from backend.models.user import User


router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> UserOut:
    return await AuthService.register_user(db, payload)


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    ip = request.client.host if request.client else None
    return await AuthService.login(db, form_data.username, form_data.password, ip_address=ip)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    payload: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService.change_password(
        db, current_user.id, payload.current_password, payload.new_password
    )


@router.put("/profile", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    return await AuthService.update_profile(
        db, current_user.id, payload.full_name, payload.email
    )


@router.get("/activity")
async def get_my_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ActivityLogService.get_user_activity(db, current_user.id)
