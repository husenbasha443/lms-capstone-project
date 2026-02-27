from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


UserRole = Literal["learner", "trainer", "admin"]
UserStatus = Literal["pending", "approved", "revoked"]


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = "learner"


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: UserRole


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
