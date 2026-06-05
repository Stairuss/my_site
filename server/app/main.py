"""
Главный модуль приложения FastAPI.

Конфигурация приложения: lifespan, middleware, роутеры, логирование,
создание таблиц БД.
"""

import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI

from openai import AsyncOpenAI

from app.config import YANDEX_CLOUD_FOLDER, YANDEX_CLOUD_API_KEY, LOG_DIR
from app.middleware import SessionMiddleware, HeadersMiddleware
from app.api import terminal_execute, contacts
from app.handlers import register_handlers
from app.logging_config import LOGGING_CONFIG

from app.database.engine import engine
from app.database.models import Base

LOG_DIR.mkdir(exist_ok=True)
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управляет жизненным циклом приложения.

    Args:
        app (FastAPI): Экземпляр приложения FastAPI.

    Yields:
        None: Передаёт управление в приложение.

    При запуске:
        - Инициализирует клиент Yandex Cloud AI (AsyncOpenAI).
        - Сохраняет его в app.state.ai_client.

    При завершении:
        - Закрывает клиент AI.
    """

    logger.info("Starting up the application...")
    app.state.ai_client = AsyncOpenAI(
        api_key=YANDEX_CLOUD_API_KEY,
        base_url="https://ai.api.cloud.yandex.net/v1",
        project=YANDEX_CLOUD_FOLDER,
    )
    yield
    logger.info("Shutting down the application...")
    await app.state.ai_client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(HeadersMiddleware)
app.add_middleware(SessionMiddleware)
register_handlers(app)
app.include_router(terminal_execute.router)
app.include_router(contacts.router)

Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting uvicorn server...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
    

