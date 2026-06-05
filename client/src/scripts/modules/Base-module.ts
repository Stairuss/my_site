/**
 * Базовый модуль для всех модулей приложения.
 * Обеспечивает поиск корневого элемента и инициализацию событий.
 */


import { HtmlElementNotFoundError } from '@scripts/errors';


export abstract class BaseModule {
    /**
     * Базовый класс для всех модулей приложения.
     * Обеспечивает общую логику работы с DOM-элементами.
     *
     * @property rootElement - Корневой DOM-элемент модуля.
     */
    protected readonly rootElement: HTMLElement;

    /**
     * Создаёт экземпляр модуля.
     * @param selector - CSS-селектор или ID элемента.
     * @param isId - Если true, ищет элемент по ID, иначе по селектору.
     * @throws {HtmlElementNotFoundError} Если элемент не найден или не является HTMLElement.
     */
    constructor (selector: string, isId: boolean = false) { 
        const el = isId ? document.getElementById(selector) : document.querySelector(selector);        
        if (!el || !(el instanceof HTMLElement)) {
            throw new HtmlElementNotFoundError(selector);
        }
        this.rootElement = el;       
    }

    /** Инициализация модуля. */
    protected init(): void {
        this.bindEvents();
    }

    /** Абстрактный метод для привязки обработчиков событий. */
    protected abstract bindEvents(): void;
}