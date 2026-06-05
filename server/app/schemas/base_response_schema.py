"""
Базовая Pydantic-схема для всех HTTP-ответов API.
"""


from pydantic import BaseModel


class BaseResponseSchema(BaseModel):
    """
    Базовая схема ответа, наследуемая всеми ответами сервера.

    Attributes:
        success (bool): Флаг успешности операции. По умолчанию True.
        output (str | int | float): Основные данные ответа (сообщение, результат вычислений, строка состояния и т.д.).
        errorType (str | None): Тип ошибки (имя класса исключения) — заполняется только при success=False.
    """

    success: bool = True
    output: str | int | float
    errorType: str | None = None
