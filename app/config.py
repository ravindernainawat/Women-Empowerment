"""
Application configuration for WEIS backend.
Loads settings from environment variables / a local .env file.
"""

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

    # --- CORS -------------------------------------------------------
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
