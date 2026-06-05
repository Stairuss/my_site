"""
Теги для группировки эндпоинтов в документации FastAPI.
"""


from enum import Enum


class Tags(Enum):
    """Список доступных тегов для API."""

    terminal = "terminal"
    contacts = "contacts"
