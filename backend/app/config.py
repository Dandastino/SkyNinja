from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://skyninja:password@localhost:5432/skyninja")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    jwt_secret: str = os.getenv("JWT_SECRET", "your-jwt-secret-here")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Keys
    skyscanner_api_key: Optional[str] = os.getenv("SKYSCANNER_API_KEY")
    exchange_rate_api_key: Optional[str] = os.getenv("EXCHANGE_RATE_API_KEY")
    
    # NordVPN
    nordvpn_token: Optional[str] = os.getenv("NORDVPN_TOKEN")
    nordvpn_connect: Optional[str] = os.getenv("NORDVPN_CONNECT")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # External APIs
    skyscanner_base_url: str = "https://partners.api.skyscanner.net/apiservices"
    exchange_rate_base_url: str = "https://api.exchangerate-api.com/v4"
    
    # CORS
    allowed_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"


settings = Settings()
