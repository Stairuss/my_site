"""
API роут для выполнения команд терминала.

Принимает команду и аргументы, передаёт в TerminalProcessor.
Ограничение частоты запросов: 20 в минуту.
"""

import logging

from fastapi import APIRouter, status, Depends, Request
from fastapi_throttle import RateLimiter

from app.tags import Tags
from app.schemas.terminal_schema import TerminalIn, TerminalOut
from app.services.terminal.TerminalProcessor import TerminalProcessor
from app.dependencies import AIClientDep, SessionDep

router = APIRouter(prefix="/api/terminal/execute", tags=[Tags.terminal])

# Лимит запросов (20 запросов в минуту)
limiter = RateLimiter(times=20, seconds=60)
logger = logging.getLogger(__name__)


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(limiter)],
    response_model=TerminalOut,
)
async def execute(
    request: Request, data: TerminalIn, ai_client: AIClientDep, db: SessionDep
) -> TerminalOut:
    """
    Обработка POST-запроса с командой терминала.
    Принимает TerminalIn и передает его в TerminalProcessor.

    Args:
        request (Request): Объект запроса FastAPI (содержит session_id в state).
        data (TerminalIn): Входные данные (команда и режим).
        ai_client (AIClientDep): Клиент для работы с AI (Yandex GPT).
        db (SessionDep): Сессия базы данных.

    Returns:
        TerminalOut: Результат выполнения команды.

    Raises:
        TerminalModeIsNotDefine: Если передан неподдерживаемый режим.
        TerminalCommandTooLong: Если команда превышает максимальную длину.
        TerminalOutputError: Если результат выполнения не удалось сериализовать.
        (Другие исключения обрабатываются глобальными обработчиками в handlers.py)

    Note:
        Лимит запросов — 20 в минуту.
    """

    logger.debug(
        f"Terminal request from session {request.state.session_id}, mode={data.mode}"
    )
    terminal_processor = TerminalProcessor(
        data, ai_client, request.state.session_id, db
    )
    result = await terminal_processor.execute()
    logger.debug(f"Terminal response prepared for session {request.state.session_id}")
    return result
