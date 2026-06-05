/**
 * Кастомные классы ошибок для клиентской части.
 * Разделены на общие ошибки, ошибки сертификатов, тем и терминала.
 */


// ========== Общие ошибки ==========

export class GeneralError extends Error {
    /** Базовый класс общих ошибок */
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class HtmlElementNotFoundError extends GeneralError {
    /** 
     * HTML элемент не найден по селектору
     * 
     * @param selector - CSS-селектор элемента, который не был найден
     */
    public readonly selector: string;

    constructor(selector: string) {
        super(`HTML селектор не найден: \`${selector}\``);
        this.selector = selector;
    }
}


// ========== Ошибки сертификатов ==========

class CertificatesError extends Error {
    /** Базовый класс ошибок сертификатов */
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class CertificatesDirectionNotFoundError extends CertificatesError {
    /** 
     * Направление сертификата не найдено.
     * 
     * @param direction - название направления (опционально)
     */
    constructor(direction: string | null = null) {
        super(direction
            ? `Направление сертификата не найдено: "${direction}"`
            : `Направление сертификата не найдено.`);
    }
}


// ========== Ошибки цветовых тем ==========

class ThemesError extends Error {
    /** Базовый класс ошибок цветовых тем */
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ThemesNotFoundError extends ThemesError {
    /** 
     * Ошибка: цветовая тема не найдена 
     * 
     *  @param theme - название темы (опционально)
     */
    constructor(theme: string | null = null) {
        super(theme
            ? `Цветовая тема не найдена: "${theme}."`
            : `Цветовая тема не найдена.`);
    }
}


// ========== Ошибки терминала ==========

class TerminalError extends Error {
    /** Базовый класс ошибок терминала */
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class TerminalCommandTooLongError extends TerminalError {
    /** 
     * Ошибка: команда терминала превышает максимальную длину
     * 
     * @param maxLength - максимально допустимая длина команды (опционально)
     */
    constructor(maxLength: number | null = null) {
        super(maxLength
            ? `Команда слишком длинная. Лимит символов: <b>${maxLength}</b>`
            : `cКоманда слишком длинная. Превышен лимит символов.`);
    }
}

export class StateNotFoundError extends TerminalError {
    /** 
     * Ошибка: получено неизвестное состояние игры
     * 
     * @param state - неизвестное состояние (опционально)
     */
    constructor(state: string | null = null) {
        super(state
            ? `Получено неизвестное состояние игры: "${state}". Обратитесь к администратору"`
            : `Получено неизвестное состояние игры. Обратитесь к администратору`);
    }
}

