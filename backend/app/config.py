import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration
    database_url: str
    postgres_user: str
    postgres_password: str
    postgres_db: str
    
    # Redis Configuration
    redis_url: str
    redis_host: str
    redis_port: int
    
    # API Configuration
    api_host: str
    api_port: int
    api_base_url: str
    
    # Frontend Configuration
    react_app_api_url: str
    react_app_host: str
    react_app_port: int
    
    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # LLM API Configuration
    openai_api_key: str
    llm_model: str = "gpt-3.5-turbo"
    
    # Email Configuration
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    email_from: str
    
    # File Upload Configuration
    max_file_size: int = 10485760  # 10MB
    upload_dir: str = "uploads"
    
    # Application Settings
    debug: bool = True
    environment: str = "development"
    secret_key: str
    
    # Scoring Configuration
    match_score_weight: float = 0.5
    ats_score_weight: float = 0.5
    shortlist_threshold: int = 80
    requalify_threshold: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
