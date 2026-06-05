"""
Dependencies для FastAPI: сессия БД и клиент AI.
"""

import logging
from typing import Annotated, Generator

from fastapi import Request, Depends

from openai import AsyncOpenAI

from sqlalchemy.orm import Session

from app.database.engine import SessionLocal


logger = logging.getLogger(__name__)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency для получения сессии базы данных.

    Автоматически управляет транзакцией:
    - При успешном выполнении эндпоинта делает commit.
    - При исключении делает rollback.
    - В любом случае закрывает сессию.

    Yields:
        Session: Активная сессия SQLAlchemy.

    Raises:
        Exception: Любое исключение, возникшее в обработчике, после rollback.
    """

    session_db: Session = SessionLocal()    
    try:
        logger.debug("Starting database session and transaction (Dependency)")
        yield session_db
        session_db.commit()
    except Exception:
        session_db.rollback()
        logger.error("Transaction 'engine' rolled back due to error (Dependency)")
        raise
    finally:        
        session_db.close()
        logger.debug("Database session closed (Dependency)")


SessionDep = Annotated[Session, Depends(get_session)]


def get_ai_client(request: Request) -> AsyncOpenAI:
    """
    Dependency для получения AI-клиента (Yandex GPT) из состояния приложения.

    Args:
        request (Request): FastAPI Request объект.

    Returns:
        AsyncOpenAI: Клиент для работы с API Yandex Cloud AI.
    """
    return request.app.state.ai_client


AIClientDep = Annotated[AsyncOpenAI, Depends(get_ai_client)]
