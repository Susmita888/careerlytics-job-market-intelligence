from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./jobintel.db"
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:5173"
    use_embeddings: bool = False  # set USE_EMBEDDINGS=true after installing sentence-transformers
    embedding_model: str = "all-MiniLM-L6-v2"
    max_resume_mb: int = 5
    adzuna_app_id: str = ""
    adzuna_app_key: str = ""
    adzuna_country: str = "in"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
