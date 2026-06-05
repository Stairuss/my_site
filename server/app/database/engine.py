"""
Движок базы данных и управление сессиями.

Предоставляет SQLAlchemy engine, фабрику сессий и контекстный менеджер
для работы с БД с автоматической обработкой транзакций.
"""

import logging
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import DATABASE_URL


logger = logging.getLogger(__name__)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(engine)


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Контекстный менеджер для получения сессии БД.

    Использование:
        with get_db_session() as db:
            # работа с БД

    Управляет транзакцией автоматически:
    - При успешном выходе из блока: commit
    - При исключении: rollback и повторное возбуждение исключения
    - Всегда закрывает сессию.

    Yields:
        Session: Сессия SQLAlchemy.

    Raises:
        Exception: Любое исключение, возникшее внутри блока (после rollback).
    """

    session_db: Session = SessionLocal()
    session_db.begin()
    try:
        logger.debug("Starting database session and transaction")
        yield session_db
        session_db.commit()
    except Exception:
        session_db.rollback()
        logger.error("Transaction 'engine' rolled back due to error")
        raise
    finally:        
        session_db.close()
        logger.debug("Database session closed")
