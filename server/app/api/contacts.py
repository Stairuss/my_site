"""
API роут для формы обратной связи.

Позволяет отправлять сообщения (имя, email, текст) в БД.
"""

import logging

from fastapi import APIRouter, status, Depends, Request

from fastapi_throttle import RateLimiter

from app.tags import Tags
from app.schemas.contacts_schema import ContactsIn, ContactsOut
from app.services.contacts.ContactsProcessor import ContactsProcessor
from app.dependencies import SessionDep


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contacts", tags=[Tags.contacts])

# Лимит запросов (3 запроса в минуту)
limiter = RateLimiter(times=3, seconds=60)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(limiter)],
    response_model=ContactsOut,
)
async def execute(request: Request, data: ContactsIn, db: SessionDep) -> ContactsOut:
    """
    Обработка POST-запроса на отправку сообщения из формы обратной связи.
    Принимает ContactsIn и передает его в ContactsProcessor.

    Args:
        request (Request): FastAPI Request объект.
        data (ContactsIn): Валидированные данные формы (name, email, message).
        db (SessionDep): Сессия базы данных (зависимость).

    Returns:
        ContactsOut: Объект ответа с success=True и output="Сообщение об успехе".

    Raises:
        (Глобальные обработчики в handlers.py перехватывают исключения от ContactsProcessor):
            - NameTooShortError / NameTooLongError / NameInvalidCharactersError / NameFormatError
            - EmailTooShortError / EmailTooLongError / EmailFormatError
            - MessageTooShortError / MessageTooLongError
            - Любые ошибки БД.

    Note:
        Статус ответа 201 Created при успешном сохранении.
        При превышении лимита (3 запроса/мин) вернётся 429 Too Many Requests.
    """

    logger.debug(
        f"Contacts request from session {request.state.session_id}, email: {data.email}"
    )
    contacts_processor = ContactsProcessor(data, db)
    result = await contacts_processor.execute()
    logger.debug(f"Contacts response prepared for session {request.state.session_id}.")
    return result
