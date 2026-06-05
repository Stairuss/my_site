"""
Процесс для режима математических вычислений.

Использует библиотеку simpleeval для безопасного вычисления выражений.
"""

import logging

from simpleeval import simple_eval, NumberTooHigh, NameNotDefined  # type: ignore[import-untyped]

from app.services.terminal.processes.BaseProcess import BaseProcess
from app.exceptions import MathError, NumberTooHighError, MathExpressionError


logger = logging.getLogger(__name__)

class MathProcess(BaseProcess):
    """
    Обработчик математических выражений.

    Вычисляет арифметические выражения, переданные пользователем.
    Поддерживает +, -, *, /, //, %, ** и скобки.
    """

    def __init__(self, command: str) -> None:
        """
        Инициализация процесса.

        Args:
            command (str): Математическое выражение (например, "2+2").
        """

        self.command = command
        logger.debug(f"MathProcess initialized with command: {command}")

    async def execute(self) -> int | float:
        """
        Вычисляет выражение и возвращает результат.

        Returns:
            int | float: Результат вычисления.

        Raises:
            NumberTooHighError: Если результат слишком большой (более 4300 цифр) или simpleeval выбрасывает NumberTooHigh.
            MathExpressionError: Если в выражении использовано неизвестное имя (например, переменная).
            MathError: При любой другой ошибке вычисления.
        """

        logger.debug(f"Evaluating math expression: {self.command}")
        try:
            result = simple_eval(self.command)
            if isinstance(result, int):
                try:
                    digit_count = len(str(result))
                except ValueError:
                    logger.warning("Failed to get digit count, assuming too high")
                    raise NumberTooHighError()
                if digit_count > 4300: 
                    logger.info(f"Result has {digit_count} digits, exceeds limit 4300")                   
                    raise NumberTooHighError()
            logger.debug(f"Math result: {result}")
            return result
        except NumberTooHigh:
            logger.info("NumberTooHigh from simpleeval")
            raise NumberTooHighError()
        except NameNotDefined as exc:
            logger.warning(f"NameNotDefined: {exc.name} in expression {exc.expression}")
            raise MathExpressionError(exc.name, exc.expression)
        except Exception as exc:
            logger.error(f"Unexpected error in MathProcess: {exc}")
            raise MathError()
