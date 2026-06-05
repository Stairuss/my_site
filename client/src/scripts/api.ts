/**
 * API-клиент для взаимодействия с бэкендом.
 * Содержит интерфейсы запросов/ответов.
 */


import { TERMINAL_MODES } from '@scripts/config';


/* ========== Request Interfaces ========== */

/**
 * Базовый запрос для режимов терминала.
 * @property command - Введённая пользователем команда.
 * @property mode - Режим работы терминала TERMINAL_MODES.
 */
export interface IRequestMode {
    readonly command: string;
    readonly mode: TERMINAL_MODES;
}

/**
 * Запрос для формы обратной связи.
 * @property name - Имя отправителя.
 * @property email - Email отправителя.
 * @property message - Текст сообщения.
 */
export interface IRequestContacts {
    readonly name: string;
    readonly email: string;
    readonly message: string;
}


/* ========== Response Interfaces ========== */

/**
 * Базовый ответ сервера (успех/ошибка).
 * @property success - Флаг успешности операции.
 * @property output - Текстовый результат (сообщение, данные).
 * @property errorType - Тип ошибки (если success === false).
 */
export interface IResponse {
    success: boolean;
    output: string;
    errorType?: string
}

