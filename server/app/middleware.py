"""
Middleware для управления сессиями, CORS и заголовками.
"""

import secrets
from datetime import datetime, timezone
from enum import Enum
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response, status

from sqlalchemy import select

from app.database.models import Session
from app.database.engine import get_db_session
from app.config import ALLOWED_ORIGINS


logger = logging.getLogger(__name__)

class SessionMiddleware(BaseHTTPMiddleware):
    """
    Middleware для управления идентификатором сессии.

    Читает заголовок X-Session-Id, если отсутствует — генерирует новый.
    Сохраняет или обновляет last_accessed запись в БД (таблица sessions).
    Добавляет session_id в request.state.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)
        
        new_session_id = self.create_session_id()  
        session_id = request.headers.get("X-Session-Id") or new_session_id     

        with get_db_session() as db:
            stmt = select(Session).where(Session.session_key == session_id)
            session = db.scalars(stmt).one_or_none()

            if session is None:
                session = Session(session_key=new_session_id)
                session_id = new_session_id
                logger.debug(f"Created new session record for {session_id}")
                db.add(session)
            else:
                new_last_accessed = datetime.now(timezone.utc)
                session.last_accessed = new_last_accessed
                logger.debug(f"Updated last_accessed for session {session_id}")            

        request.state.session_id = session_id
        response = await call_next(request)
        return response
    
    def create_session_id(self) -> str:
        """
        Генерирует криптостойкий идентификатор сессии.

        Использует secrets.token_hex() для создания случайной строки
        шестнадцатеричных символов.

        Returns:
            str: Уникальный идентификатор сессии.
        """
        session_id = secrets.token_hex()
        logger.debug(f"Generated new session id: {session_id}")        
        return session_id
    

class HeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware для установки CORS-заголовков и заголовка X-Session-Id в ответ.

    Обрабатывает предварительные OPTIONS-запросы.
    """

    class CustomHeaders(Enum):
        SESSION_ID = "X-Session-Id"

    async def dispatch(self, request: Request, call_next):        
        if request.method == "OPTIONS":
            response = Response(status_code=status.HTTP_200_OK)
            origin = request.headers.get("origin")
            if origin in ALLOWED_ORIGINS:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = f"Content-Type, {self.CustomHeaders.SESSION_ID.value}"
            return response

        # Основной запрос
        response = await call_next(request)
        
        # Ваш существующий заголовок
        response.headers[self.CustomHeaders.SESSION_ID.value] = request.state.session_id
        
        # CORS-заголовки для обычных ответов
        origin = request.headers.get("origin")        
        if origin in ALLOWED_ORIGINS:            
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Expose-Headers"] = self.CustomHeaders.SESSION_ID.value
        
        return response



