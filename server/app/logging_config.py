"""
Конфигурация логирования для приложения.

Используется RotatingFileHandler для записи всех логов в all.log
и ошибок в errors.log. Также логи выводятся в консоль.
Формат: время - имя логгера - уровень - файл:строка - сообщение.
"""

from app.config import LOG_DIR


LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            'datefmt' : '%d-%m-%Y %H:%M:%S'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',  
            'formatter': 'default',
            'stream': 'ext://sys.stdout',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'filename': LOG_DIR / 'all.log',            
            'backupCount': 7,
            'maxBytes': 5 * 1024 * 1024,
            'encoding': 'utf-8',
        },
        'file_errors': {
        'class': 'logging.handlers.RotatingFileHandler',
        'level': 'ERROR',
        'formatter': 'default',
        'filename': LOG_DIR / 'errors.log',
        'maxBytes': 5*1024*1024,
        'backupCount': 5,
        'encoding': 'utf-8',
    },
    },
    
    'root': {
        'handlers': ['console', 'file', 'file_errors'],
        'level': 'DEBUG',
    }
}