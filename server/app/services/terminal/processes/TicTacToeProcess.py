"""
Процесс для игры «Крестики-нолики» в терминале.

Управляет состоянием игры, ходами бота и пользователя, проверкой победы/ничьи.
"""

import logging
from enum import Enum
import json
import random
from typing import cast

from sqlalchemy.orm import Session as SQLAlchemySession

from app.services.terminal.processes.BaseProcess import BaseProcess
from app.utils import get_session
from app.database.models import TicTacToeGame
from app.exceptions import StateNotFound


logger = logging.getLogger(__name__)


class TicTacToeProcess(BaseProcess):
    """
    Игра «Крестики-нолики» (бот играет за противоположную сторону).

    Состояния: 
        - init (выбор стороны) 
        - selected (выбор стороны) 
        - active (игра)
        - victory/defeat/draw (окончание). 
    Бот использует простые стратегии:
    победный ход → блокировка → центр → угол → случайная клетка.
    """

    class State(Enum):
        INIT = "init"
        SELECTED = "selected"
        ACTIVE = "active"
        VICTORY = "victory"
        DEFEAT = "defeat"
        DRAW = 'draw'

    class GameMessage(Enum):
        DRAW = "🤝 Ничья! Сыграем ещё? Напишите <b>restart</b>."
        DRAW_PREVIOUS = "🤝 Прошлая игра закончилась ничьей. Введите <b>restart</b>, чтобы начать новую."
        VICTORY = "🏆 Вы победили! Введите <b>restart</b>."
        VICTORY_PREVIOUS = "🏆 В прошлой игре вы победили. Напишите <b>restart</b> для новой партии."
        DEFEAT = "😿 Вы проиграли :( Введите <b>restart</b>."
        DEFEAT_PREVIOUS = "😿 В прошлой игре вы проиграли. Напишите <b>restart</b>, чтобы взять реванш."

    class Commands(Enum):
        START = "start"
        RESTART = "restart"

    class Symbols(Enum):
        CROSS = "x"
        ZERO = "o"
        EMPTY = "-"

    class Players(Enum):
        BOT = "bot"
        USER = "user"   

    class UserMoveOptions(Enum):
        a1 = 0
        b1 = 1
        c1 = 2
        a2 = 3
        b2 = 4
        c2 = 5
        a3 = 6
        b3 = 7
        c3 = 8             

    winning_combinations = [
        # горизонтали
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        # вертикали
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        # диагонали
        [0, 4, 8],
        [2, 4, 6],
    ] 

    def __init__(self, command: str, session_id: str, db: SQLAlchemySession) -> None:
        """
        Инициализация процесса.

        Args:
            command (str): Команда пользователя (start, restart, координата).
            session_id (str): Идентификатор сессии.
            db (SQLAlchemySession): Сессия базы данных.
        """
        self.command = command
        self.session = get_session(session_id, db)
        self.db = db
        self.game = self.get_game()
        self.isBotTurn = False
        logger.debug(f"{self.__class__.__name__} initialized for session {self.session.session_key}")

    async def execute(self) -> str:
        """
        Основной метод выполнения: обрабатывает restart или маршрутизирует по состоянию.

        Returns:
            str: JSON-строка с полями state, message, board.
        """

        if self.command == self.Commands.RESTART.value:
           logger.info(f"Restarting game for session {self.session.session_key}")
           return self.restart_game()
        
        return self.route_state()

    def route_state(self) -> str:
        """
        Маршрутизация в зависимости от текущего состояния игры.

        Returns:
            str: JSON-ответ.

        Raises:
            StateNotFound: Если состояние игры неизвестно.
        """

        response = None
        match self.game.game_state:
            case self.State.INIT.value:
                response = self.state_init_handler()
            case self.State.SELECTED.value:
                response = self.state_selected_handler()
            case self.State.ACTIVE.value:
                response = self.state_active_handler()
            case self.State.VICTORY.value:
                response = self.state_victory_handler()
            case self.State.DEFEAT.value:
                response = self.state_defeat_handler()
            case self.State.DRAW.value:
                response = self.state_draw_handler()
            case _:
                raise StateNotFound(self.game.game_state)

        return response
    
    def restart_game(self):
        """Сбрасывает игру и переводит в состояние INIT."""

        self.game.user_symbol = None
        self.game.bot_symbol = None
        self.game.game_state = self.State.INIT.value
        self.game.board = None        
        self.command = self.Commands.START.value
        logger.debug(f"Game state reset to INIT for session {self.session.session_key}")
        return self.state_init_handler()

    def get_game(self) -> TicTacToeGame:
        """
        Получает текущую игру для сессии или создаёт новую.

        Returns:
            TicTacToeGame: Объект игры.
        """

        game = self.session.tic_tac_toe_games
        if game is None:
            game = TicTacToeGame(
                session_id=self.session.id, game_state=self.State.INIT.value
            )
            self.db.add(game)
            logger.info(f"Created new TicTacToeGame for session {self.session.session_key}")
        else:
            logger.debug(f"Existing game found, id={game.id}")

        return game

    def get_or_create_board(self, isString: bool = False) -> str | list[str]:
        """
        Возвращает доску в виде списка или строки.

        Args:
            is_string (bool): Если True, возвращает строку из 9 символов иначе список.

        Returns:
            list | str: Доска.
        """
        
        if self.game.board is None:
            board = [self.Symbols.EMPTY.value] * 9
        else:
            board = [self.game.board[i] for i in range(9)]

        return "".join(board) if isString else board

    def build_response(self, message: str | None, board: None | list = None) -> str:
        """
        Формирует JSON-ответ для фронтенда.

        Args:
            message (str | None): Текст сообщения.
            board (list | None): Доска (список из 9 символов).

        Returns:
            str: JSON-строка.
        """

        return json.dumps(
            {
                "state": self.game.game_state,
                "message": message,
                "board": board,
            },
            ensure_ascii=False,
        )

    def state_init_handler(self) -> str:
        """Обрабатывает состояние INIT (ожидание команды start)."""

        if self.command != self.Commands.START.value:
            logger.debug(f"Invalid command in INIT: {self.command}")
            return self.build_response(
                f'⚠️ Команды "<b>{self.command}</b>" не существует. Введите <b>start</b>, чтобы начать игру.'
            )
        
        self.game.game_state = self.State.SELECTED.value    
        logger.debug(f"State changed to SELECTED for session {self.session.session_key}")    
        return self.build_response(f'Выберите сторону: {self.getRedX()} или {self.getGreenO()}')

    def state_selected_handler(self) -> str:
        """Обрабатывает состояние SELECTED (выбор стороны)."""

        if self.command not in [symbol.value for symbol in self.Symbols]:
            logger.debug(f"Invalid symbol choice: {self.command}")
            return self.build_response(
                f'⚠️ Неизвестная команда: <b>{self.command}</b>. Выберите сторону: {self.getRedX()} или {self.getGreenO()}.'
            )

        self.game.user_symbol = self.command
        self.game.bot_symbol = (
            self.Symbols.CROSS.value
            if self.command == self.Symbols.ZERO.value
            else self.Symbols.ZERO.value
        )
        self.game.board = cast(str, self.get_or_create_board(True))
        self.game.game_state = self.State.ACTIVE.value
        logger.info(f"User chose {self.command}, bot is {self.game.bot_symbol}")

        board = cast(list[str], self.get_or_create_board() )       
        if self.game.user_symbol == self.Symbols.ZERO.value:
            self.isBotTurn = True
            self.bot_move(board)
            return self.build_response(f"🎮 Начало игры! Вы играете за {self.getGreenO()}. Бот уже сделал ход. Теперь ваш ход. Пример: <b>b2</b>", board)                

        return self.build_response(f"🎮 Начало игры! Вы играете за {self.getRedX()}. Ваш ход. Пример: <b>b2</b>", board) 

    def state_active_handler(self) -> str:        
        """Обрабатывает активную игру (ход пользователя, затем бота)."""

        board = cast(list[str], self.get_or_create_board())
        result_user_move = self.user_move(board)
        if result_user_move is not None:
            # Ошибка пользователя (неправильная клетка или занята)
            logger.debug(f"User move error: {result_user_move}")
            return self.build_response(result_user_move, board)        
        
        # Ход пользователя успешен, теперь ход бота
        result_bot_move = self.bot_move(board)
        return self.build_response(result_bot_move, board)
    
    def state_victory_handler(self) -> str:
        """Обрабатывает состояние победы пользователя (предыдущая игра)."""

        board = cast(list[str], self.get_or_create_board())
        return self.build_response(self.GameMessage.VICTORY_PREVIOUS.value, board)
    
    def state_defeat_handler(self) -> str:
        """Обрабатывает состояние поражения пользователя (предыдущая игра)."""

        board = cast(list[str], self.get_or_create_board())
        return self.build_response(self.GameMessage.DEFEAT_PREVIOUS.value, board)
    
    def state_draw_handler(self) -> str:
        """Обрабатывает состояние ничьи (предыдущая игра)."""
        
        board = cast(list[str], self.get_or_create_board())
        return self.build_response(self.GameMessage.DRAW_PREVIOUS.value, board) 

    def bot_move(self, board: list) -> str | None:
        """
        Логика хода бота.

        Args:
            board (list): Текущее состояние доски.

        Returns:
            str | None: Сообщение о победе/поражении/ничье, если игра закончилась, иначе None.
        """

        if not self.isBotTurn:
            return None        

        # Проверка на победителя (может быть уже после хода пользователя)
        if self.check_winner(board):
            self.isBotTurn = False
            if self.game.game_state == self.State.DEFEAT.value:
                return self.GameMessage.DEFEAT.value
            elif self.game.game_state == self.State.VICTORY.value:
                return self.GameMessage.VICTORY.value
        
        # Проверка на ничью
        if self.check_draw(board):
            self.isBotTurn = False
            return self.GameMessage.DRAW.value

        # Победный ход бота
        if self.make_winning_move(board):
            self.isBotTurn = False
            return self.GameMessage.DEFEAT.value

        # Блокировка победы пользователя
        if self.make_blocking_move(board):
            self.isBotTurn = False
            if self.check_winner(board):
                if self.game.game_state == self.State.DEFEAT.value:
                    return self.GameMessage.DEFEAT.value
                elif self.game.game_state == self.State.VICTORY.value:
                    return self.GameMessage.VICTORY.value               
            
            return None

        # Занять центр
        if self.make_center_move(board):
            self.isBotTurn = False
            return None

        # Занять углы
        if self.make_corner_move(board):
            self.isBotTurn = False
            return None

        # Ход в случайную свободную ячейку
        self.make_random_move(board)
        self.isBotTurn = False

        # Повторная проверка ничьи после хода бота
        if self.check_draw(board):
            self.isBotTurn = False
            return self.GameMessage.DRAW.value             

        return None
        
    def check_winner(self, board: list) -> bool:
        """
        Проверяет, есть ли победитель, и устанавливает game_state.

        Returns:
            bool: True, если есть победитель иначе  False.
        """

        bot_winner = False
        user_winner = False

        for combo in self.winning_combinations:
            bot_winner = all(board[i] == self.game.bot_symbol for i in combo)
            user_winner = all(board[i] == self.game.user_symbol for i in combo)
            if bot_winner or user_winner:
                break

        if bot_winner:
            self.game.game_state = self.State.DEFEAT.value
            logger.info("Bot wins")
            return True
        elif user_winner:
            self.game.game_state = self.State.VICTORY.value
            logger.info("User wins")
            return True        

        return False
    
    def check_draw(self, board: list) -> bool:
        """
        Проверяет ничью (нет пустых клеток).

        Returns:
            bool: True, если ничья иначе False.
        """

        if self.Symbols.EMPTY.value not in board:
            self.game.game_state = self.State.DRAW.value
            logger.info("Game is draw")
            return True
        
        return False

    def make_winning_move(self, board: list) -> bool:
        """Бот делает победный ход, если есть возможность."""      

        for combo in self.winning_combinations:
            bot_symbols_count = 0
            empty_symbol_index = None
            for i in combo:
                if board[i] == self.game.bot_symbol:
                    bot_symbols_count += 1
                elif board[i] == self.Symbols.EMPTY.value:
                    if empty_symbol_index is not None:
                        break
                    empty_symbol_index = i
            else:
                if bot_symbols_count == 2 and empty_symbol_index is not None:
                    board[empty_symbol_index] = self.game.bot_symbol
                    self.game.board = "".join(board)
                    self.game.game_state = self.State.DEFEAT.value                    
                    logger.debug("Bot winning move at index", empty_symbol_index)

                    return True

        return False

    def make_blocking_move(self, board: list) -> bool:
        """Блокирует победный ход пользователя."""      

        for combo in self.winning_combinations:
            user_symbols_count = 0
            empty_symbol_index = None

            for i in combo:
                if board[i] == self.game.user_symbol:
                    user_symbols_count += 1
                elif board[i] == self.Symbols.EMPTY.value:
                    if empty_symbol_index is not None:
                        break
                    empty_symbol_index = i
            else:
                if user_symbols_count == 2 and empty_symbol_index is not None:
                    board[empty_symbol_index] = self.game.bot_symbol
                    self.game.board = "".join(board)
                    logger.debug("Bot blocking move at index", empty_symbol_index)

                    return True
        return False

    def make_center_move(self, board: list) -> bool:
        """Занять центр, если свободен."""       

        center_index = 4
        if board[center_index] == self.Symbols.EMPTY.value:
            board[center_index] = self.game.bot_symbol
            self.game.board = "".join(board)
            logger.debug("Bot takes center")

            return True
        return False

    def make_corner_move(self, board: list) -> bool:
        """Занять любой свободный угол."""      

        corner_index = [0, 2, 6, 8]
        free_cells_index = []

        for i in range(len(corner_index)):
            if board[corner_index[i]] == self.Symbols.EMPTY.value:
                free_cells_index.append(corner_index[i])

        if len(free_cells_index) == 0:
            return False

        board[random.choice(free_cells_index)] = self.game.bot_symbol
        self.game.board = "".join(board)
        logger.debug("Bot takes corner")

        return True

    def make_random_move(self, board: list) -> bool:
        """Случайный ход в любую свободную клетку."""       
        
        free_cells_index = []

        for i in range(len(board)):
            if board[i] == self.Symbols.EMPTY.value:
                free_cells_index.append(i)

        if len(free_cells_index) == 0:
            self.game.game_state = self.State.DRAW.value
            return False
        
        board[random.choice(free_cells_index)] = self.game.bot_symbol
        self.game.board = "".join(board)  
        logger.debug("Bot random move")      

        return True

    def user_move(self, board: list) -> None | str:
        """
        Обрабатывает ход пользователя.

        Returns:
            str | None: Текст ошибки, если ход недопустим, иначе None.
        """

        if self.command not in [cell.name for cell in self.UserMoveOptions]:
            return f'Ячейки: {self.command} не существует.'            
        elif board[self.UserMoveOptions[self.command].value] != self.Symbols.EMPTY.value:
            return f'Ячйка: {self.command} уже занята, выберите другю.'            
        
        board[self.UserMoveOptions[self.command].value] = self.game.user_symbol
        self.isBotTurn = True
        logger.debug(f"User move at {self.command}")

        return None
    
    def getRedX(self) -> str:
        """Возвращает красный крестик (HTML)."""

        return f'<span style="color:#e74c3c"><b>X</b></span>'
    
    def getGreenO(self) -> str:
        """Возвращает зелёный нолик (HTML)."""

        return f'<span style="color:#2ecc71"><b>O</b></span>'
