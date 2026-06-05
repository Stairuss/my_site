"""
Пользовательские исключения для приложения.

Разделены на группы:
- Contacts (форма обратной связи)
- Terminal (общие ошибки терминала)
- Math (калькулятор)
- TicTacToe (игра крестики-нолики)
"""


# ========== Contacts exceptions ==========

class ContactsError(Exception):
    """Базовый класс ошибок формы обратной связи."""
    pass


class NameTooShortError(ContactsError):
    """Имя слишком короткое (менее 2 символов)."""

    def __str__(self) -> str:
        return "Имя: минимум 2 символа."


class NameTooLongError(ContactsError):
    """Имя слишком длинное (более 50 символов)."""

    def __str__(self) -> str:
        return "Имя: максимум 50 символов."


class NameInvalidCharactersError(ContactsError):
    """Имя содержит недопустимые символы."""

    def __str__(self) -> str:
        return "Имя: только буквы (кириллица/латиница) и пробелы."


class NameFormatError(ContactsError):
    """Неверный формат имени (например, пустое или только пробелы)."""

    def __str__(self) -> str:
        return "Имя: неверный формат (пример: Александр)."


class EmailTooShortError(ContactsError):
    """Email слишком короткий (менее 5 символов)."""

    def __str__(self) -> str:
        return "Почта: минимум 5 символов."


class EmailTooLongError(ContactsError):
    """Email слишком длинный (более 100 символов)."""

    def __str__(self) -> str:
        return "Почта: максимум 100 символов."


class EmailFormatError(ContactsError):
    """Неверный формат email (отсутствует @, домен и т.д.)."""

    def __str__(self) -> str:
        return "Почта: неверный формат (пример: yourmail@mail.ru)"


class MessageTooShortError(ContactsError):
    """Сообщение слишком короткое (менее 10 символов)."""

    def __str__(self) -> str:
        return "Сообщение: минимум 10 символов."


class MessageTooLongError(ContactsError):
    """Сообщение слишком длинное (более 1000 символов)."""

    def __str__(self) -> str:
        return "Сообщение: максимум 1000 символов."


# ========== Terminal exceptions ==========

class TerminalError(Exception):
    """Базовый класс ошибок терминала."""

    pass


class TerminalModeIsNotDefine(TerminalError):
    """Запрошенный режим терминала не поддерживается."""

    def __init__(self, mode_name: str | None = None) -> None:
        self.mode_name = mode_name

    def __str__(self) -> str:
        if self.mode_name is not None:
            return f"Режим: {self.mode_name} не поддерживается."
        return "Режим не поддерживается. Для выхода введите: exit "
    

class TerminalOutputError(TerminalError):
    """Вывод терминала не соответствует ожидаемой Pydantic схеме."""   

    def __str__(self) -> str:        
        return f"Вывод терминала не соответствует pydantic схеме."
    

class TerminalCommandTooLong(TerminalError):
    """Команда, переданная в терминал, превышает максимальную длину."""

    def __init__(self, max_length: int | None) -> None:
        self.max_length = max_length

    def __str__(self) -> str:
        if self.max_length is not None:
            return f'Команда слишком длинная. Лимит символов: {self.max_length}.'        
        return f'Команда слишком длинная. Превышен лимит символов'  


# === Math exeptions ===

class MathError(TerminalError):
    """Базовый класс ошибок процеса MathProcess."""

    def __str__(self) -> str:
        return "Введеное выражение неккоректно."


class NumberTooHighError(MathError):
    """Число в выражении превышает допустимый лимит."""

    def __str__(self) -> str:
        return "Это выражение сломает даже мой калькулятор. Давай без фанатизма 😉"


class MathExpressionError(MathError):
    """Неизвестный оператор или операнд в выражении."""

    def __init__(self, value: str, expression: str) -> None:
        self.value = value
        self.expression = expression

    def __str__(self) -> str:
        return f"'{self.value}' не определено для выражения '{self.expression}'"
    

# === TicTacToe exeptions ===

class TTTError(TerminalError):
    """Базовый класс ошибок процеса TicTacToeProcess."""

    def __str__(self) -> str:
        return "Ошибка игрового процесса."
    

class StateNotFound(TTTError):
    """ Неизвестное состояние игры. """

    def __init__(self, state: str | None = None ) -> None:
        self.state = state        

    def __str__(self) -> str:
        if self.state is not None:
            return f"Состояние игры: '{self.state}' не поддерживается."
        return "Состояние игры не поддерживается. "