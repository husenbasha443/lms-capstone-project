from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


# ── Stats ──────────────────────────────────────────────
class RoleCount(BaseModel):
    role: str
    count: int

class RecentUser(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: Optional[str] = None

class TopCourse(BaseModel):
    id: int
    title: str
    enrolled_count: int
    avg_completion: float

class AdminStats(BaseModel):
    total_users: int
    total_courses: int
    total_modules: int
    total_lessons: int
    avg_completion_rate: float
    active_users: int
    processed_lessons: int
    unprocessed_lessons: int
    role_distribution: list[RoleCount]
    recent_users: list[RecentUser]
    top_courses: list[TopCourse]


# ── Users ──────────────────────────────────────────────
class UserListItem(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    status: str = "approved"
    is_active: bool
    login_attempts: int = 0
    last_login: Optional[str] = None
    created_at: Optional[str] = None

class PaginatedUsers(BaseModel):
    users: list[UserListItem]
    total: int
    page: int
    page_size: int

class ChangeRoleRequest(BaseModel):
    role: str  # learner | trainer


# ── Activity Log ───────────────────────────────────────
class ActivityLogOut(BaseModel):
    id: int
    action: str
    detail: Optional[str] = None
    related_course_id: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None


# ── Certificates ───────────────────────────────────────
class CertificateOut(BaseModel):
    id: int
    verification_id: str
    ai_mastery_score: Optional[float] = None
    issued_at: Optional[str] = None
    revoked: bool
    certificate_url: Optional[str] = None
    student_name: str
    student_email: str
    course_title: str

class PaginatedCertificates(BaseModel):
    certificates: list[CertificateOut]
    total: int
    page: int
    page_size: int


# ── Analytics ──────────────────────────────────────────
class CourseCompletionStat(BaseModel):
    id: int
    name: str
    completion: float
    students: int

class DifficultTopic(BaseModel):
    topic: str
    difficulty: float
    attempts: int

class EnrollmentTrend(BaseModel):
    month: str
    users: int


# ── Course management ─────────────────────────────────
class CourseCreateAdmin(BaseModel):
    title: str
    description: Optional[str] = None

class CourseUpdateAdmin(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class ModuleCreateAdmin(BaseModel):
    title: str
    order_index: int = 0


# ── Export ─────────────────────────────────────────────
class ExportRequest(BaseModel):
    type: str  # users | courses | activities


# ── Reset Password ────────────────────────────────────
class ResetPasswordAdmin(BaseModel):
    new_password: str
