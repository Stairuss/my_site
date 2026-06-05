"""
Глобальные обработчики исключений для FastAPI.

Регистрирует обработчики для пользовательских исключений (контакты, терминал, игры, математика),
а также для ошибок OpenAI, валидации и необработанных исключений.
"""


import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException

import openai

from app.utils import error_response
from app.exceptions import (
    NameTooShortError,
    NameTooLongError,
    NameInvalidCharactersError,
    NameFormatError,
    EmailTooShortError,
    EmailTooLongError,
    EmailFormatError,
    MessageTooShortError,
    MessageTooLongError,
    TerminalModeIsNotDefine,
    TerminalOutputError,
    TerminalCommandTooLong,
    MathError,
    NumberTooHighError,
    MathExpressionError,
    StateNotFound,
)
from app.config import ALLOWED_ORIGINS


logger = logging.getLogger(__name__)


def register_handlers(app: FastAPI) -> None:
    """
    Регистрация глобальных exception handlers для FastAPI.

    Args:
        app (FastAPI): Экземпляр приложения FastAPI.
    """

    # ========== Contacts exceptions ==========

    @app.exception_handler(NameTooShortError)
    async def name_too_short_error_handler(
        request: Request, exc: NameTooShortError
    ) -> JSONResponse:
        """Обработчик "имя слишком короткое"."""
        
        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(NameTooLongError)
    async def name_too_long_error_handler(
        request: Request, exc: NameTooLongError
    ) -> JSONResponse:
        """Обработчик "имя слишком длинное"."""
        
        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(NameInvalidCharactersError)
    async def name_invalid_characters_error_handler(
        request: Request, exc: NameInvalidCharactersError
    ) -> JSONResponse:
        """Обработчик "имя содержит недопустимые символы"."""        
        
        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(NameFormatError)
    async def name_format_error_handler(
        request: Request, exc: NameFormatError
    ) -> JSONResponse:
        """Обработчик "неверный формат имени"."""
        
        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(EmailTooShortError)
    async def email_too_short_error_handler(
        request: Request, exc: EmailTooShortError
    ) -> JSONResponse:
        """Обработчик "почта слишком короткая"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(EmailTooLongError)
    async def email_too_long_error_handler(
        request: Request, exc: EmailTooLongError
    ) -> JSONResponse:
        """Обработчик "почта слишком длинная"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(EmailFormatError)
    async def email_format_error_handler(
        request: Request, exc: EmailFormatError
    ) -> JSONResponse:
        """Обработчик "неверный формат почты"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(MessageTooShortError)
    async def message_too_short_error_handler(
        request: Request, exc: MessageTooShortError
    ) -> JSONResponse:
        """Обработчик "сообщение слишком короткое"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(MessageTooLongError)
    async def message_too_long_error_handler(
        request: Request, exc: MessageTooLongError
    ) -> JSONResponse:
        """Обработчик "сообщение слишком длинное"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )
    

    # ========== Terminal exceptions ==========

    @app.exception_handler(TerminalModeIsNotDefine)
    async def terminal_mode_is_not_define_error_handler(
        request: Request, exc: TerminalModeIsNotDefine
    ) -> JSONResponse:
        """Обработчик "режим терминала не поддерживается"."""

        logger.error(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )
    
    @app.exception_handler(TerminalOutputError)
    async def terminal_output_error_handler(
        request: Request, exc: TerminalOutputError
    ) -> JSONResponse:
        """Обработчик "Некорректный вывод терминала"."""

        logger.exception(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            exc.__class__.__name__,
            str(exc),
        )
    
    @app.exception_handler(TerminalCommandTooLong)
    async def terminal_command_too_long_error_handler(
        request: Request, exc: TerminalCommandTooLong
    ) -> JSONResponse:
        """Обработчик "превышен лимит символов команды переданной в терминал"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    # === OpenAI exeptions ===

    @app.exception_handler(openai.RateLimitError)
    async def rate_limit_error_handler(
        request: Request, exc: openai.RateLimitError
    ) -> JSONResponse:
        """Обработчик "достигнут лимит запросов"."""
        
        logger.warning(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_429_TOO_MANY_REQUESTS,
            exc.__class__.__name__,
            "Достигнут лимит запросов.",
        )

    @app.exception_handler(openai.APIConnectionError)
    async def api_connection_error_handler(
        request: Request, exc: openai.APIConnectionError
    ) -> JSONResponse:
        """Обработчик "ошибка соединения с API"."""

        logger.exception(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            exc.__class__.__name__,
            "Сервис ИИ временно недоступен. Попробуйте позже.",
        )

    @app.exception_handler(openai.AuthenticationError)
    async def authentication_error_handler(
        request: Request, exc: openai.AuthenticationError
    ) -> JSONResponse:
        """Обработчик "ошибка аутентификации" (неверный API-ключ или folder_id)."""
        
        logger.error(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_401_UNAUTHORIZED,
            exc.__class__.__name__,
            "Ошибка авторизации в сервисе ИИ. Обратитесь к администратору.",
        )

    @app.exception_handler(openai.BadRequestError)
    async def bad_request_error_handler(
        request: Request, exc: openai.BadRequestError
    ) -> JSONResponse:
        """Обработчик "неверный запрос" (например, слишком длинное сообщение)."""
        
        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            "Некорректный запрос к ИИ. Возможно, сообщение слишком длинное или оно отсутствует.",
        )

    @app.exception_handler(openai.APIStatusError)
    async def api_status_error_handler(
        request: Request, exc: openai.APIStatusError
    ) -> JSONResponse:
        """Обработчик "ошибка API с HTTP-статусом 4xx/5xx" (общий случай)."""
        
        logger.exception(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            exc.__class__.__name__,
            f"Ошибка сервиса ИИ (HTTP {exc.status_code}). Попробуйте позже.",
        )

    @app.exception_handler(openai.APIError)
    async def api_error_handler(request: Request, exc: openai.APIError) -> JSONResponse:
        """Обработчик "общая ошибка API" (базовый класс для всех ошибок OpenAI)."""
        
        logger.exception(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            exc.__class__.__name__,
            "Внутренняя ошибка при обращении к ИИ. Попробуйте позже.",
        )

    # === Math exeptions ===

    @app.exception_handler(MathError)
    async def math_error_handler(request: Request, exc: MathError) -> JSONResponse:
        """Обработчик "неккоректное выражение"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(NumberTooHighError)
    async def number_too_hight_error_handler(
        request: Request, exc: NumberTooHighError
    ) -> JSONResponse:
        """Обработчик "число слишком большое"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )

    @app.exception_handler(MathExpressionError)
    async def math_expression_error_handler(
        request: Request, exc: MathExpressionError
    ) -> JSONResponse:
        """Обработчик "неизвестный оператор или операнд"."""

        logger.info(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_400_BAD_REQUEST,
            exc.__class__.__name__,
            str(exc),
        )
    
    # === TicTacToe exeptions ===

    @app.exception_handler(StateNotFound)
    async def state_not_found_error_handler(
        request: Request, exc: StateNotFound
    ) -> JSONResponse:
        """Обработчик "неизвестное состояние игрового процесса"."""

        logger.exception(f"{exc.__class__.__name__}: {exc}")
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            exc.__class__.__name__,
            str(exc),
        )
    

    # ========== Global exceptions ==========

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        """Обработчик "данные не прошли валидацию схемы" """

        logger.warning(f"{exc.__class__.__name__}: {exc}")
        # Передан неизвестный режим терминала
        if request.url.path == "/api/terminal/execute":
            raise TerminalModeIsNotDefine()
        
        return error_response(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "ValidationError",
            "Неверные данные запроса.",
        )


    @app.exception_handler(HTTPException)
    async def http_exeption_error_handler(request: Request, exc: HTTPException):
        """Обработчик "проблема с http запросом" """

        if exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            logger.warning("RateLimitError: Too many requests")

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "output": "Слишком много запросов. Попробуйте позже.",
                    "errorType": "RateLimitError",
                },
            )
        
        logger.error(f"HTTPException {exc.status_code}: {exc.detail}")
        return error_response(
            exc.status_code,
            "HTTPException",
            exc.detail,
        )

    @app.exception_handler(Exception)
    async def not_define_exeption_error_handler(request: Request, exc: Exception):
        """
        Обработчик "любая неизвестная ошибка" 

        Последний оплот обработки ошибок, когда ничего другое не сработало.
        """

        logger.exception("Unhandled exception")
        origin = request.headers.get("origin")
        headers = {}
        if origin in ALLOWED_ORIGINS:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"
            headers["Access-Control-Expose-Headers"] = "X-Session-Id"
        headers["X-Session-Id"] = getattr(request.state, "session_id", "")
       
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "output": "Внутренняя ошибка сервера.",
                "errorType": "NotDefineException",
            },
            headers=headers,
        )
