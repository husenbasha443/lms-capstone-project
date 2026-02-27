from __future__ import annotations

import os
import shutil
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

from fastapi import UploadFile
from loguru import logger

from backend.core.config import settings


# ─── Abstract base ───────────────────────────────────────────────────────────

class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file: UploadFile, category: str) -> str:
        """Save a file and return its accessible path/URL string."""
        ...


# ─── Local storage ────────────────────────────────────────────────────────────

class LocalStorageBackend(StorageBackend):
    BASE_DIR = Path("backend/uploads")

    def _get_target_dir(self, category: str) -> Path:
        target_dir = self.BASE_DIR / category
        target_dir.mkdir(parents=True, exist_ok=True)
        return target_dir

    async def save(self, file: UploadFile, category: str) -> str:
        target_dir = self._get_target_dir(category)
        ext = Path(file.filename).suffix if file.filename else ""
        filename = f"{uuid.uuid4()}{ext}"
        target_path = target_dir / filename

        try:
            with target_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            relative_path = f"uploads/{category}/{filename}"
            logger.info(f"[LocalStorage] Saved {file.filename} → {relative_path}")
            return relative_path
        except Exception as e:
            logger.error(f"[LocalStorage] Failed to save file: {e}")
            raise


# ─── Cloudinary storage ───────────────────────────────────────────────────────

class CloudinaryStorageBackend(StorageBackend):
    def __init__(self) -> None:
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
            )
            self._uploader = cloudinary.uploader
        except ImportError:
            raise RuntimeError(
                "cloudinary package is not installed. "
                "Run: pip install cloudinary"
            )

    async def save(self, file: UploadFile, category: str) -> str:
        try:
            content = await file.read()
            result = self._uploader.upload(
                content,
                folder=f"lms/{category}",
                resource_type="auto",
            )
            url: str = result["secure_url"]
            logger.info(f"[CloudinaryStorage] Uploaded {file.filename} → {url}")
            return url
        except Exception as e:
            logger.error(f"[CloudinaryStorage] Failed to upload file: {e}")
            raise


# ─── FileService facade ───────────────────────────────────────────────────────

def _get_storage_backend() -> StorageBackend:
    if settings.storage_type == "cloud":
        return CloudinaryStorageBackend()
    return LocalStorageBackend()


class FileService:
    """
    Public facade used throughout the app.
    Delegates to the correct StorageBackend based on settings.storage_type.
    Default: local  →  saves files under backend/uploads/<category>/
    Cloud:          →  uploads to Cloudinary (set STORAGE_TYPE=cloud in .env)
    """

    # Keep BASE_DIR for backward compat (used in media route for serving)
    BASE_DIR = Path("backend/uploads")

    @classmethod
    def _get_target_dir(cls, category: str) -> Path:
        """Legacy helper — only meaningful for local storage."""
        target_dir = cls.BASE_DIR / category
        target_dir.mkdir(parents=True, exist_ok=True)
        return target_dir

    @classmethod
    async def save_upload_file(cls, file: UploadFile, category: str) -> str:
        """
        Save an uploaded file and return its path or URL.
        The backend is chosen via STORAGE_TYPE env var (local | cloud).
        """
        backend = _get_storage_backend()
        return await backend.save(file, category)
