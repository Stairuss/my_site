"""
Базовый абстрактный класс для всех процессоров приложения.
"""


from abc import ABC, abstractmethod

from app.schemas.base_response_schema import BaseResponseSchema


class BaseProcessor(ABC):
    """
    Абстрактный базовый класс для обработки данных.

    Все процессоры (ContactsProcessor, TerminalProcessor и т.д.)
    должны реализовывать метод execute().
    """

    @abstractmethod
    async def execute(self) -> BaseResponseSchema:
        """
        Запуск основного процесса обработки.

        Returns:
            BaseResponseSchema: Ответ, соответствующий схеме (обычно наследник BaseResponseSchema).
        """
        
        pass
