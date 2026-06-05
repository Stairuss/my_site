"""
Модели базы данных SQLAlchemy.

Содержит описание таблиц: 
    - Contact (форма обратной связи).
    - Session (сессии).
    - AIConversation (история диалогов с ИИ).
    - TicTacToeGame (состояния игры).
"""

from datetime import datetime

from sqlalchemy.orm import DeclarativeBase, Mapped
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, func, ForeignKey


class Base(DeclarativeBase):
    """Базовый класс для всех моделей."""

    pass


class Contact(Base):
    """
    Таблица для хранения сообщений из формы обратной связи.

    Fields:
    - id (int, pk): Уникальный идентификатор сообщения.
    - name (str[50]): Имя отправителя.
    - email (str[100]): Email отправителя.
    - message (str[1000]): Текст сообщения.
    - created_at (datetime): Дата и время создания (UTC).
    """

    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Session(Base):
    """
    Таблица пользовательских сессий.

    Fields:
    - id (int, pk): Уникальный идентификатор сессии в БД.
    - session_key (str[100], unique): Идентификатор сессии (X-Session-Id).
    - last_accessed (datetime): Время последней активности (UTC).
    - created_at (datetime): Дата и время создания сессии (UTC).

    Relationships:
    - ai_conversation (AIConversation): Связь 1:1 с диалогом ИИ (через session_id).
    - tic_tac_toe_games (TicTacToeGame): Связь 1:1 с игрой в крестики-нолики.
    """

    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    session_key: Mapped[str] = mapped_column(String(100), unique=True)
    last_accessed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    ai_conversation: Mapped["AIConversation"] = relationship(
        "AIConversation", back_populates="session"
    )
    tic_tac_toe_games: Mapped["TicTacToeGame"] = relationship(
        "TicTacToeGame", back_populates="session"
    )


class AIConversation(Base):
    """
    Таблица для хранения идентификаторов диалогов с ИИ (Yandex GPT).

    Fields:
    - id (int, pk): Уникальный идентификатор записи.
    - session_id (int, fk -> sessions.id): Внешний ключ на сессию пользователя.
    - conversation_id (str[100]): Идентификатор диалога в Yandex Cloud.
    - created_at (datetime): Дата и время создания диалога (UTC).

    Relationships:
    - session (Session): Обратная связь к сессии (Session.ai_conversation).
    """

    __tablename__ = "ai_conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    conversation_id: Mapped[str] = mapped_column(String(100), nullable=False)
    session: Mapped["Session"] = relationship(
        "Session", back_populates="ai_conversation"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TicTacToeGame(Base):
    """
    Таблица для хранения состояния игры «Крестики-нолики».

    Fields:
    - id (int, pk): Уникальный идентификатор записи.
    - session_id (int, fk -> sessions.id): Внешний ключ на сессию пользователя.
    - user_symbol (str[1]): Символ пользователя ('X' или 'O'), может быть NULL до выбора.
    - bot_symbol (str[1]): Символ бота (противоположный), может быть NULL.
    - game_state (str[10]): Состояние игры (init, selected, active, victory, defeat, draw).
    - board (str[9]): Строка из 9 символов (X, O, -) — игровое поле.
    - last_accessed (datetime): Время последнего хода (UTC).
    - created_at (datetime): Дата и время создания игры (UTC).

    Relationships:
    - session (Session): Обратная связь к сессии (Session.tic_tac_toe_games).
    """

    __tablename__ = "tic_tac_toe_games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )    
    user_symbol: Mapped[str] = mapped_column(String(1), nullable=True)
    bot_symbol: Mapped[str] = mapped_column(String(1), nullable=True)
    game_state: Mapped[str] = mapped_column(String(10), default="init", nullable=False)
    board: Mapped[str] = mapped_column(String(9), nullable=True)    
    session: Mapped["Session"] = relationship(
        "Session", back_populates="tic_tac_toe_games"
    )
    last_accessed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
