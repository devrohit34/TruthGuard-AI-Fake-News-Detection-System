"""Configuration for TruthGuard Flask API."""
import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("JWT_SECRET", "jwt-dev-secret"))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Database
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "truthguard")
    DB_BACKEND = os.getenv("DB_BACKEND", "sqlite").lower()
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "truthguard.db"))

    # BERT Model
    MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model", "fake_news_bert"))
    MAX_LEN = 256
    BATCH_SIZE = 16
    JSON_SORT_KEYS = False
