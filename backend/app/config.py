from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartEvent API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "smartevent_jwt_secret_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./smartevent.db"
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
    QR_DIR: str = os.path.join(STATIC_DIR, "qr_codes")

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(settings.QR_DIR, exist_ok=True)
