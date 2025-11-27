"""
Application configuration using Pydantic Settings.
Loads from environment variables and .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Database
    database_url: str = "postgresql://kotoba_user:kotoba_pass@localhost:5432/kotoba_dojo"
    
    # API
    secret_key: str = "dev-secret-key-change-in-production"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # App Settings (REQ-6: Daily Limits)
    default_new_per_day: int = 15
    default_review_per_day: int = 200
    tz_default: str = "UTC"
    
    # Debug
    debug: bool = True


settings = Settings()
