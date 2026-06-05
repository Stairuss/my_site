"""
Основной процессор команд терминала.

Маршрутизирует команды в соответствующие процессы (Math, AI, Cat, TicTacToe)
в зависимости от режима (mode). Выполняет валидацию длины команды.
"""


import logging
from typing import Literal

from sqlalchemy.orm import Session

from openai import AsyncOpenAI

from app.config import TerminalModes
from app.exceptions import TerminalModeIsNotDefine, TerminalOutputError, TerminalCommandTooLong
from app.schemas.terminal_schema import TerminalIn, TerminalOut
from app.services.BaseProcessor import BaseProcessor
from app.services.terminal.processes.BaseProcess import BaseProcess
from app.services.terminal.processes.MathProcess import MathProcess
from app.services.terminal.processes.AiProcess import AiProcess
from app.services.terminal.processes.CatProcess import CatProcess
from app.services.terminal.processes.TicTacToeProcess import TicTacToeProcess


logger = logging.getLogger(__name__)


class TerminalProcessor(BaseProcessor):
    """
    Процессор команд терминала.

    Атрибуты:
        _process (BaseProcess | None): Выбранный процесс для текущей команды.
        max_length_command (int): Максимально допустимая длина команды (200 символов).
    """

    _process: BaseProcess | None = None
    max_length_command = 200

    def __init__(
        self, data: TerminalIn, ai_model: AsyncOpenAI, session_id: str, db: Session
    ) -> None:
        """
        Инициализирует процессор терминала.

        Args:
            data (TerminalIn): Входные данные (команда и режим).
            ai_model (AsyncOpenAI): Клиент AI (Yandex GPT).
            session_id (str): Идентификатор сессии.
            db (Session): Сессия базы данных.
        """
        
        self.validate_command(data.command)
        self.command = self.normalize_command(data.command)
        self.mode = data.mode
        self.ai_model = ai_model
        self.session_id = session_id
        self.db = db
        logger.debug(f"{self.__class__.__name__} initialized for mode {self.mode}, command: {self.command}")

    def route_commands(self) -> None:
        """
        Маршрутизирует команду в соответствующий процесс в зависимости от режима.

        Raises:
            TerminalModeIsNotDefine: Если передан неподдерживаемый режим.
        """

        logger.debug(f"Routing command for mode: {self.mode}")
        match self.mode:
            case TerminalModes.MATH:
                self._process = MathProcess(self.command)
            case TerminalModes.AI:
                self._process = AiProcess(
                    self.command, self.ai_model, self.session_id, self.db
                )
            case TerminalModes.CAT:
                self._process = CatProcess(self.command)
            case TerminalModes.TTT:
                self._process = TicTacToeProcess(self.command, self.session_id, self.db)
            case _:
                logger.error(f"Unsupported mode: {self.mode}")
                raise TerminalModeIsNotDefine(self.mode)

    async def execute(self) -> TerminalOut:
        """
        Выполняет команду: маршрутизирует и возвращает результат.

        Returns:
            TerminalOut: Ответ терминала с флагом success и output.

        Raises:
            TerminalOutputError: Если результат не удалось упаковать в схему TerminalOut.
        """

        if self._process is None:
            self.route_commands()
            if self._process is None:
                raise RuntimeError("Режим не инициализирован после маршрутизации.")       

        logger.debug(f"Start executing command with process {self._process.__class__.__name__}")
        result = await self._process.execute()
        logger.debug(f"Process {self._process.__class__.__name__} result: {result[:100] if isinstance(result, str) else result}")
        
        try:
            terminal_output = TerminalOut(success=True, output=result)
        except Exception as exc:
            raise TerminalOutputError()         
        
        return terminal_output

    def normalize_command(self, command: str) -> str:
        """
        Нормализует команду: удаляет пробелы по краям и приводит к нижнему регистру.

        Args:
            command (str): Исходная команда.

        Returns:
            str: Нормализованная команда.
        """

        return command.strip().lower()
    
    def validate_command(self, command: str) -> Literal[True]:
        """
        Проверяет длину команды.

        Args:
            command (str): Команда для проверки.

        Returns:
            bool: True, если длина команды не превышает max_length_command.

        Raises:
            TerminalCommandTooLong: Если команда длиннее max_length_command.
        """

        if len(command) > self.max_length_command:
            raise TerminalCommandTooLong(self.max_length_command)
        
        return True
