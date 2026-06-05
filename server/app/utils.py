"""
Вспомогательные утилиты для API: 
    - Формирование ответов об ошибках.
    - Получение объектов сессий из БД.
"""


from fastapi.responses import JSONResponse

from sqlalchemy import select
from sqlalchemy.orm import Session as SQLAlchemySession

from app.database.models import Session


def error_response(
    status_code: int, error_type: str, error_message: str
) -> JSONResponse:
    """
    Сформировать стандартизированный JSON-ответ при возникновении ошибки.

    Args:
        status_code (int): HTTP статус-код.
        error_type (str): Тип ошибки (имя класса исключения).
        error_message (str): Человекочитаемое сообщение об ошибке.

    Returns:
        JSONResponse: Ответ с полями success, output, errorType.
    """

    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "output": error_message,
            "errorType": error_type,
        },
    )


def get_session(session_id: str, db: SQLAlchemySession) -> Session:
    """
    Получить объект сессии из БД по session_key.

    Args:
        session_id (str): Уникальный ключ сессии (X-Session-Id).
        db (SQLAlchemySession): Активная сессия SQLAlchemy.

    Returns:
        Session: Объект модели Session.

    Raises:
        sqlalchemy.exc.NoResultFound: Если сессия с таким session_id не найдена.
    """

    stmt = select(Session).where(Session.session_key == session_id)
    return db.scalars(stmt).one()
