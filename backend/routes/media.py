from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os
from backend.dependencies import get_current_user
from backend.models.user import User

router = APIRouter()

BASE_UPLOAD_DIR = Path("backend/uploads")

@router.get("/media/{file_path:path}")
async def get_media_file(
    file_path: str,
    current_user: User = Depends(get_current_user)
):
    """
    Serve uploaded media files (videos/pdfs) securely.
    Requires authentication.
    """
    # Sanitize path to prevent directory traversal
    safe_path = os.path.normpath(file_path)
    if safe_path.startswith("..") or safe_path.startswith("/"):
         raise HTTPException(status_code=403, detail="Invalid file path")

    full_path = BASE_UPLOAD_DIR / safe_path
    
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(full_path)
