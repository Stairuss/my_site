"""
Базовый абстрактный класс для всех процессов команд терминала.

Каждый процесс (Math, AI, Cat, TicTacToe) должен реализовать метод execute().
"""


from abc import ABC, abstractmethod


class BaseProcess(ABC):
    """
    Абстрактный класс, задающий интерфейс для обработки команд в терминале.
    """

    @abstractmethod
    async def execute(self) -> str | int | float:
        """
        Выполнить команду и вернуть результат.

        Returns:
            str | int | float: Результат обработки команды.
                - Для Math: число.
                - Для AI, Cat, TTT: строка.
        """
        pass
