"""
Central configuration. All values are read from environment variables so the
same code runs in local development, Docker, and cloud deployments.
"""
import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()  # load a local .env file if present


class Settings:
    # ----- General -----
    APP_NAME: str = "AI Smart Laboratory Asset Management System"
    API_PREFIX: str = "/api"

    # Comma separated list of allowed CORS origins (frontend URLs)
    CORS_ORIGINS: list[str] = [
        o.strip() for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000",
        ).split(",") if o.strip()
    ]

    # ----- Auth -----
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))

    # ----- Storage backend -----
    # "local"  -> JSON files under ./data (works with zero setup)
    # "sheets" -> Google Sheets via a service account
    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local").lower()

    # ----- Google Sheets -----
    # The spreadsheet that holds one worksheet per module.
    GOOGLE_SPREADSHEET_ID: str = os.getenv("GOOGLE_SPREADSHEET_ID", "")
    # Path to the service-account JSON key file.
    GOOGLE_CREDENTIALS_FILE: str = os.getenv(
        "GOOGLE_CREDENTIALS_FILE", "service_account.json"
    )

    # ----- OpenAI (optional) -----
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    DATA_DIR: str = os.getenv("DATA_DIR", "data")


@lru_cache
def get_settings() -> "Settings":
    return Settings()
