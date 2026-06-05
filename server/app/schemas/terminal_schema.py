"""
Pydantic схемы для взаимодействия с терминалом.
"""


from pydantic import BaseModel

from app.schemas.base_response_schema import BaseResponseSchema
from app.config import TerminalModes


class TerminalIn(BaseModel):
    """
    Схема входных данных для команды терминала.

    Attributes:
        command (str): Текст команды, введённой пользователем.
        mode (TerminalModes): Режим работы терминала (MATH, AI, CAT, TTT).
    """

    command: str
    mode: TerminalModes


class TerminalOut(BaseResponseSchema):
    """
    Схема выходных данных терминала.

    Наследует поля от BaseResponseSchema:
        success (bool): Успешность выполнения команды.
        output (str | int | float): Результат выполнения команды.
        errorType (str | None): Тип ошибки, если success=False.
    """
