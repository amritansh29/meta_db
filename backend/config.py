from pydantic import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    LLM_BACKEND: str = "openai"
    OPENAI_API_KEY: str = ""
    # Add more keys as needed

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
