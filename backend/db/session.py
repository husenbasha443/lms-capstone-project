from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.core.config import settings
from backend.db.base import Base


engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def seed_admin() -> None:
    """Create the default admin if no admin exists in the database."""
    from backend.models.user import User
    from backend.core.security import get_password_hash

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.role == "admin"))
        existing_admin = result.scalar_one_or_none()
        if existing_admin is None:
            admin = User(
                email="admin@ltc.com",
                full_name="admin",
                hashed_password=get_password_hash("Admin@2026"),
                role="admin",
                status="approved",
                is_active=True,
                login_attempts=0,
            )
            session.add(admin)
            await session.commit()
            print("[SEED] Default admin created: admin@ltc.com")
        else:
            print("[SEED] Admin already exists — skipping seed.")


async def init_db() -> None:
    # Import models so that metadata is populated
    from backend.models import user, course, activity_log, certificate, enrollment, chat_log  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed the single admin account
    await seed_admin()
