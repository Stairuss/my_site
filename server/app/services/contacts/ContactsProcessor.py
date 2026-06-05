"""
Обработчик формы обратной связи: валидация и сохранение сообщения в БД.
"""


import logging
import re
from typing import Literal

from app.schemas.contacts_schema import ContactsIn, ContactsOut
from app.services.BaseProcessor import BaseProcessor
from app.exceptions import (
    NameTooShortError,
    NameTooLongError,
    NameInvalidCharactersError,
    NameFormatError,
    EmailTooShortError,
    EmailTooLongError,
    EmailFormatError,
    MessageTooShortError,
    MessageTooLongError,
)
from app.dependencies import SessionDep
from app.database.models import Contact


logger = logging.getLogger(__name__)


class ContactsProcessor(BaseProcessor):
    """
    Процессор для обработки данных из формы обратной связи.

    Выполняет валидацию имени, email и сообщения, затем сохраняет запись в БД.
    """

    def __init__(self, data: ContactsIn, db: SessionDep) -> None:
        """
        Инициализация процессора.

        Args:
            data (ContactsIn): Входные данные (имя, email, сообщение).
            db (SessionDep): Сессия базы данных.
        """

        self.name = data.name
        self.email = data.email
        self.message = data.message
        self.db = db
        logger.debug(f"{self.__class__.__name__} initialized.")

    async def execute(self) -> ContactsOut:
        """
        Основной метод обработки: валидация и сохранение.

        Returns:
            ContactsOut: Успешный ответ с сообщением.

        Raises:
            Соответствующие исключения из модуля exceptions при ошибках валидации.
        """

        logger.debug(f"Starting contact processor for {self.email}")
        self.validate_name()
        self.validate_email()
        self.validate_message()
        self.add_contact()
        logger.info(f"Contact from {self.email} saved successfully")

        return ContactsOut(success=True, output="Данные сохранены.")

    def add_contact(self) -> None:
        """
        Сохраняет сообщение в таблицу contacts.
        """

        contact = Contact(name=self.name, email=self.email, message=self.message)
        self.db.add(contact)
        self.db.commit()
        logger.debug(f"Contact id={contact.id} committed")

    def validate_name(self) -> Literal[True]:
        """
        Валидация имени.

        Правила:
            - Длина: 2–50 символов после обрезки пробелов.
            - Только буквы (кириллица/латиница) и пробелы.
            - Нормализация: одиночные пробелы между словами.

        Returns:
            True, если имя корректно.

        Raises:
            NameTooShortError: менее 2 символов.
            NameTooLongError: более 50 символов.
            NameInvalidCharactersError: недопустимые символы.
            NameFormatError: неправильный формат (например, пустое или только пробелы).
        """

        value = self.name.strip()
        if len(value) < 2:
            raise NameTooShortError()
        if len(value) > 50:
            raise NameTooLongError()
        if re.search(r"[^a-zа-яё\s]", value, re.IGNORECASE):
            raise NameInvalidCharactersError()
        normalized = re.sub(r"\s{2,}", " ", value).strip()
        if not re.fullmatch(r"([a-zа-яё]{2,}\s?)+", normalized, re.IGNORECASE):
            raise NameFormatError()  
              
        logger.debug("Name validation passed.")
        return True

    def validate_email(self) -> Literal[True]:
        """
        Валидация email.

        Правила:
            - Длина: 5–100 символов.
            - Формат: стандартный email (содержит @, домен и т.д.).

        Returns:
            True, если email корректен.

        Raises:
            EmailTooShortError: менее 5 символов.
            EmailTooLongError: более 100 символов.
            EmailFormatError: неверный формат.
        """

        value = self.email.strip()
        if len(value) < 5:
            raise EmailTooShortError()
        if len(value) > 100:
            raise EmailTooLongError()
        if not re.fullmatch(
            r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$", value
        ):
            raise EmailFormatError()
        
        logger.debug("Email validation passed.")
        return True

    def validate_message(self) -> Literal[True]:
        """
        Валидация сообщения.

        Правила:
            - Длина: 10–1000 символов.

        Returns:
            True, если сообщение корректно.

        Raises:
            MessageTooShortError: менее 10 символов.
            MessageTooLongError: более 1000 символов.
        """

        value = self.message.strip()
        if len(value) < 10:
            raise MessageTooShortError()
        if len(value) > 1000:
            raise MessageTooLongError()
        
        logger.debug("Message validation passed.")
        return True
