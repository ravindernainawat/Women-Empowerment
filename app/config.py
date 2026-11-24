"""
Application configuration for WEIS backend.
Loads settings from environment variables / a local .env file.
"""

from typing import Union
import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Database ---------------------------------------------------
    # Format: mysql+pymysql://<user>:<password>@<host>:<port>/<db_name>
    DATABASE_URL: str = "mysql+pymysql://weis_user:changeme@localhost:3306/weis_db"

    # --- App ----------------------------------------------------------
    APP_NAME: str = "WEIS API"
    ENV: str = "development"          # development | staging | production
    DEBUG: bool = True

    # --- Security -------------------------------------------------------
    SECRET_KEY: str = "replace-this-with-a-strong-random-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # --- CORS -------------------------------------------------------
    CORS_ORIGINS: Union[list[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            return [i.strip() for i in v_stripped.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
