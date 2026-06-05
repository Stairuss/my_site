"""
Процесс режима общения с ИИ (Yandex GPT).

Управляет диалогами: создаёт новую беседу при первом обращении,
отправляет запросы к Yandex Cloud API и возвращает ответ.
"""


import logging
from typing import Any

from openai import AsyncOpenAI, APIError

from sqlalchemy.orm import Session as SQLAlchemySession

from app.config import YANDEX_CLOUD_FOLDER, YANDEX_CLOUD_MODEL
from app.services.terminal.processes.BaseProcess import BaseProcess
from app.database.models import AIConversation
from app.utils import get_session


logger = logging.getLogger(__name__)


class AiProcess(BaseProcess):
    """
    Обработчик команд в режиме ИИ.

    Для каждой сессии (session_id) создаёт/использует conversation_id
    и отправляет сообщения в Yandex GPT.
    """
     
    def __init__(
        self,
        command: str,
        ai_client: AsyncOpenAI,
        session_id: str,
        db: SQLAlchemySession,
    ) -> None:
        """
        Инициализация процесса режима ИИ.

        Args:
            command (str): Вопрос или реплика пользователя.
            ai_client (AsyncOpenAI): Клиент Yandex Cloud AI.
            session_id (str): Идентификатор сессии (X-Session-Id).
            db (SQLAlchemySession): Сессия базы данных.
        """

        self.command = command
        self.ai_client = ai_client
        self.session = get_session(session_id, db)
        self.db = db
        logger.debug(f"{self.__class__.__name__}  initialized for session {session_id}")

    async def _ensure_conversation(self) -> Any:
        """
        Создаёт новую беседу в Yandex Cloud.

        Returns:
            Any: Объект ответа API с полем conversation_id.

        Raises:
            APIError: При ошибке создания беседы.
        """

        logger.debug("Creating new conversation with Yandex Cloud")
        return await self.ai_client.conversations.create()

    async def execute(self) -> str:
        """
        Отправляет команду в ИИ и возвращает ответ.

        Returns:
            str: Текстовый ответ от модели Yandex GPT.

        Raises:
            APIError: При ошибке запроса к API (пробрасывается выше).
        """

        ai_conversation = await self.get_conversation()
        logger.debug(f"Sending message to AI, conversation_id={ai_conversation.conversation_id}")
        try:
            response = await self.ai_client.responses.create(
                model=f"gpt://{YANDEX_CLOUD_FOLDER}/{YANDEX_CLOUD_MODEL}",
                conversation=ai_conversation.conversation_id,
                input=self.command,
                temperature=0.3,
                max_output_tokens=500,
            )
            logger.debug("Received AI response successfully")
            return response.output_text
        except APIError as exc:   
            logger.error(f"AI API error: {exc}")         
            raise

    async def get_conversation(self) -> AIConversation:
        """
        Получает существующий AIConversation для текущей сессии или создаёт новый.

        Returns:
            AIConversation: Объект из БД, связанный с сессией.

        Note:
            Если диалог создаётся впервые, запись добавляется в БД и коммитится.
        """

        ai_conversation = self.session.ai_conversation
        if ai_conversation is None:
            logger.debug("No existing conversation found, creating new one")
            conv = await self._ensure_conversation()
            ai_conversation = AIConversation(
                conversation_id=conv.id, session_id=self.session.id
            )
            self.db.add(ai_conversation)            
            logger.info(f"Created new AIConversation id={conv.id} for session {self.session.id}")
        else:
            logger.debug(f"Using existing conversation {ai_conversation.conversation_id}")

        return ai_conversation
