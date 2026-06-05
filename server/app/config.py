"""
Конфигурация приложения.

Содержит настройки: терминал, CORS, база данных, Yandex Cloud AI, логирование.
"""


import os
from enum import Enum
from pathlib import Path


# ========== Terminal ==========
class TerminalModes(str, Enum):
    """Режимы работы терминала."""

    MATH = "MATH"
    AI = "AI"
    CAT = "CAT"
    TTT = "TTT"


# ========== Network ==========
ALLOWED_ORIGINS = [
    # Для локальной разработки
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://localhost:8080",
    # Для продакшена (домен)
    "https://stairus-projects.ru",
    "https://www.stairus-projects.ru",
    "http://stairus-projects.ru",
    "http://www.stairus-projects.ru",
]


# ========== Database ==========
DB_DIALECT = os.getenv("DB_DIALECT")
DB_DRIVER = os.getenv("DB_DRIVER")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DATABASE_URL = (
    f"{DB_DIALECT}+{DB_DRIVER}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)


# ========== OpenAI ==========
YANDEX_CLOUD_FOLDER = os.getenv('YANDEX_CLOUD_FOLDER') 
YANDEX_CLOUD_API_KEY = os.getenv('YANDEX_CLOUD_API_KEY')
YANDEX_CLOUD_MODEL = os.getenv('YANDEX_CLOUD_MODEL')


# ========== Loging ==========
LOG_DIR = Path(__file__).parent / 'logs'



