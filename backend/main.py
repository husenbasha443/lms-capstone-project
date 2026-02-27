import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routes import certificates

from backend.core.config import settings
from backend.core.logging_config import configure_logging
from backend.db.session import init_db
from backend.routes import admin, auth, courses, learning, trainer, uploads, chat, media


configure_logging()

app = FastAPI(
    title="LTC AI Learning & Knowledge Intelligence Platform",
    version="1.0.0",
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# STATIC FILES (🔥 IMPORTANT)
# -----------------------------
# This will serve:
# uploads/videos/...
# uploads/audio/...
# uploads/pdfs/...
# at URL:
# http://localhost:8000/media/...
app.mount("/media", StaticFiles(directory="backend/uploads"), name="media")


# -----------------------------
# STARTUP
# -----------------------------
@app.on_event("startup")
async def on_startup() -> None:
    await init_db()


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "environment": settings.environment}


# -----------------------------
# ROUTERS
# -----------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api", tags=["courses"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(trainer.router, prefix="/api/trainer", tags=["trainer"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(media.router, prefix="/api", tags=["media"])
app.include_router(certificates.router,prefix="/api/certificates",tags=["certificates"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)