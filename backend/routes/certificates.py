from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.models.certificate import Certificate
from backend.models.user import User
from backend.models.course import Course

router = APIRouter()


# =========================================================
# 🔎 PUBLIC CERTIFICATE VERIFICATION
# =========================================================

@router.get("/verify/{verification_id}")
async def verify_certificate(
    verification_id: str,
    db: AsyncSession = Depends(get_db),
):

    stmt = (
        select(Certificate, User.full_name, Course.title)
        .join(User, User.id == Certificate.user_id)
        .join(Course, Course.id == Certificate.course_id)
        .where(Certificate.verification_id == verification_id)
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Invalid certificate")

    cert, student_name, course_title = row

    if cert.revoked:
        return {
            "valid": False,
            "reason": "Certificate revoked",
            "verification_id": verification_id,
        }

    return {
        "valid": True,
        "verification_id": cert.verification_id,
        "student_name": student_name,
        "course_title": course_title,
        "ai_mastery_score": cert.ai_mastery_score,
        "issued_at": cert.issued_at,
    }