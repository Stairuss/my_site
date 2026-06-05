"""
Pydantic схемы для формы обратной связи.
"""


from pydantic import BaseModel

from app.schemas.base_response_schema import BaseResponseSchema


class ContactsIn(BaseModel):
    """
    Схема входных данных для отправки сообщения.

    Attributes:
        name (str): Имя отправителя (2-50 символов, буквы и пробелы).
        email (str): Email отправителя (валидный формат).
        message (str): Текст сообщения (10-1000 символов).
    """

    name: str
    email: str
    message: str


class ContactsOut(BaseResponseSchema):
    """
    Схема выходных данных после отправки сообщения.

    Наследует поля от BaseResponseSchema:
        success (bool): Успешность сохранения.
        output (str | int | float): Обычно сообщение об успехе.
        errorType (str | None): Тип ошибки при валидации.
    """

    pass
