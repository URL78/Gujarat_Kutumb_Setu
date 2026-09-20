import os
from dotenv import load_dotenv

# Load .env file if available
load_dotenv()

db_url = os.getenv("DATABASE_URL", "sqlite:///./parivar.db")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Gujarat Kutumb Setu")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gujarat-kutumb-setu-production-secret-key-2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    DATABASE_URL: str = db_url

settings = Settings()
