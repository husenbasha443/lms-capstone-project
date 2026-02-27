from __future__ import annotations

import os
import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from backend.models.certificate import Certificate
from backend.models.user import User
from backend.models.course import Course


MEDIA_CERT_PATH = "backend/media/certificates"


class CertificateService:

    # ==============================
    # AUTO ISSUE + PDF GENERATION
    # ==============================
    @staticmethod
    async def issue_certificate(
        db: AsyncSession,
        user_id: int,
        course_id: int,
        ai_mastery_score: float | None = None,
    ) -> Certificate:

        # 1️⃣ Prevent duplicate certificate
        stmt = select(Certificate).where(
            Certificate.user_id == user_id,
            Certificate.course_id == course_id,
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            return existing

        # 2️⃣ Fetch user & course
        user = await db.get(User, user_id)
        course = await db.get(Course, course_id)

        if not user or not course:
            raise HTTPException(status_code=404, detail="User or Course not found")

        # 3️⃣ Generate verification ID
        verification_id = uuid.uuid4().hex[:12].upper()
        file_name = f"cert_{verification_id}.pdf"
        os.makedirs(MEDIA_CERT_PATH, exist_ok=True)
        file_path = os.path.join(MEDIA_CERT_PATH, file_name)

        # 4️⃣ Generate PDF
        CertificateService._generate_pdf(
            file_path=file_path,
            user_name=user.full_name,
            course_title=course.title,
            verification_id=verification_id,
            ai_mastery_score=ai_mastery_score,
        )

        # 5️⃣ Save DB record
        cert = Certificate(
            user_id=user_id,
            course_id=course_id,
            certificate_url=f"certificates/{file_name}",
            verification_id=verification_id,
            ai_mastery_score=ai_mastery_score,
        )

        db.add(cert)
        await db.commit()
        await db.refresh(cert)

        return cert

    # ==============================
    # PDF GENERATION
    # ==============================
    @staticmethod
    def _generate_pdf(
        file_path: str,
        user_name: str,
        course_title: str,
        verification_id: str,
        ai_mastery_score: float | None,
    ):
        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4

        c.setFont("Helvetica-Bold", 30)
        c.drawCentredString(width / 2, height - 120, "Certificate of Completion")

        c.setFont("Helvetica", 18)
        c.drawCentredString(width / 2, height - 200, "This certifies that")

        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(width / 2, height - 240, user_name)

        c.setFont("Helvetica", 18)
        c.drawCentredString(width / 2, height - 290, "has successfully completed")

        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(width / 2, height - 330, course_title)

        if ai_mastery_score:
            c.setFont("Helvetica", 16)
            c.drawCentredString(
                width / 2,
                height - 380,
                f"AI Mastery Score: {round(ai_mastery_score, 2)}%"
            )

        c.setFont("Helvetica", 14)
        c.drawCentredString(
            width / 2,
            height - 420,
            f"Issued on {datetime.utcnow().strftime('%d %B %Y')}"
        )

        c.setFont("Helvetica-Oblique", 10)
        c.drawCentredString(
            width / 2,
            height - 460,
            f"Verification ID: {verification_id}"
        )

        c.save()

    # ==============================
    # LIST (ADMIN PANEL)
    # ==============================
    @staticmethod
    async def list_certificates(
        db: AsyncSession, page: int = 1, page_size: int = 20
    ) -> dict:

        total = (await db.execute(select(func.count(Certificate.id)))).scalar() or 0

        offset = (page - 1) * page_size

        stmt = (
            select(
                Certificate.id,
                Certificate.verification_id,
                Certificate.ai_mastery_score,
                Certificate.issued_at,
                Certificate.revoked,
                Certificate.certificate_url,
                User.full_name.label("student_name"),
                User.email.label("student_email"),
                Course.title.label("course_title"),
            )
            .join(User, User.id == Certificate.user_id)
            .join(Course, Course.id == Certificate.course_id)
            .order_by(desc(Certificate.issued_at))
            .offset(offset)
            .limit(page_size)
        )

        rows = (await db.execute(stmt)).all()

        items = [
            {
                "id": r.id,
                "verification_id": r.verification_id,
                "ai_mastery_score": r.ai_mastery_score,
                "issued_at": r.issued_at.isoformat() if r.issued_at else None,
                "revoked": r.revoked,
                "certificate_url": r.certificate_url,
                "student_name": r.student_name,
                "student_email": r.student_email,
                "course_title": r.course_title,
            }
            for r in rows
        ]

        return {
            "certificates": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    # ==============================
    # REVOKE
    # ==============================
    @staticmethod
    async def revoke(db: AsyncSession, cert_id: int) -> dict:

        cert = await db.get(Certificate, cert_id)

        if not cert:
            raise HTTPException(status_code=404, detail="Certificate not found")

        cert.revoked = True
        await db.commit()

        return {"status": "revoked", "id": cert_id}