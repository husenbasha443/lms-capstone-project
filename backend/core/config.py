from functools import lru_cache
from typing import Optional
from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"
    log_level: str = "INFO"

    database_url: str

    azure_openai_endpoint: AnyUrl
    azure_openai_key: str
    azure_openai_deployment: str
    azure_openai_embedding_deployment: str

    azure_speech_key: str
    azure_speech_region: str

    chroma_db_dir: str = "/data/chroma"
    chroma_collection_name: str = "ltc_lessons"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Storage configuration
    storage_type: str = "local"  # "local" | "cloud"

    # Cloudinary (optional — used when storage_type=cloud)
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]


settings = get_settings()
