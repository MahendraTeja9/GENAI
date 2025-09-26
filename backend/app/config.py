import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "postgresql://postgres:Maahi123@localhost:5432/genai_hiring"
    postgres_user: str = "postgres"
    postgres_password: str = "Maahi123"
    postgres_db: str = "genai_hiring"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    # API Configuration
    api_host: str = "localhost"
    api_port: int = 8000
    api_base_url: str = "http://localhost:8000"
    
    # JWT Configuration
    jwt_secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # LLM API Configuration
    openai_api_key: str = "sk-ijkl1234ijkl1234ijkl1234ijkl1234ijkl1234"
    llm_model: str = "gpt-3.5-turbo"
    
    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = "Mahendra"
    smtp_password: str = "Maahi#123"
    email_from: str = "mahendratejak9@gmail.com"
    
    # File Upload Configuration
    max_file_size: int = 10485760  # 10MB
    upload_dir: str = "uploads"
    
    # Application Settings
    debug: bool = True
    environment: str = "development"
    secret_key: str = "your-super-secret-key-change-this-in-production"
    
    # Scoring Configuration
    match_score_weight: float = 0.5
    ats_score_weight: float = 0.5
    shortlist_threshold: int = 80
    requalify_threshold: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
