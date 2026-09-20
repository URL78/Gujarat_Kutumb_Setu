import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Family ID & Beneficiary Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-parivar-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Default SQLite fallback database URL for local execution; can be overridden by DATABASE_URL env var for PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./parivar.db"
    )

    class Config:
        case_sensitive = True

settings = Settings()
