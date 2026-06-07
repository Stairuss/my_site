/**
 * Утилиты для работы с DOM, темами, сессиями и переключением вкладок.
 */

import { HtmlElementNotFoundError } from '@scripts/errors';
import type { TabsType, ThemesType } from '@scripts/config';
import { TABS, THEMES, DEFAULT_THEME } from '@scripts/config';


/**
 * Поиск HTML-элемента по селектору или по ID или по тегу.
 * @param root - Корневой элемент или документ.
 * @param selector - Селектор, ID или имя тега.
 * @param byTag - Если true, ищет по имени тега.
 * @returns Найденный элемент.
 * @throws {HtmlElementNotFoundError} Если элемент не найден.
 */
export const getElement = <T extends Element>(root: Element | Document, selector: string, byTag: boolean = false): T => {
    let el;
    if (byTag) {
        el = root.getElementsByTagName(selector)[0];
    } else if (root instanceof Document) {
        el = selector[0] === '.' || selector[0] === '[' ? root.querySelector(selector) : root.getElementById(selector);
    } else {
        el = root.querySelector(selector);
    }
    if (!el) {
        throw new HtmlElementNotFoundError(selector);
    }

    return el as T;
};

/**
 * Динамический импорт модуля редактора по имени вкладки.
 * @param tabName - Имя вкладки TabsType.
 */
export const importModules = async (tabName: TabsType): Promise<void> => {
    switch (tabName) {
        case 'about-me':
            await import('@scripts/modules/editor/About-me');
            break;

        case 'certificates':
            await import('@scripts/modules/editor/Certificates');
            break;

        case 'projects':
            await import('@scripts/modules/editor/Projects');
            break;

        case 'contacts':
            await import('@scripts/modules/editor/Contacts');
            break;

        case 'themes':
            await import('@scripts/modules/editor/Themes');
            break;

        case 'terminal':
            await import('@scripts/modules/editor/Terminal');
            break;
    }
}

/**
 * Переключение активной вкладки редактора.
 * @param btn - Кнопка, по которой кликнули (содержит data-tab).
 */
export const switchTab = async (btn: HTMLButtonElement): Promise<void> => {
    const tabName = btn.dataset.tab;
    if (!tabName || !TABS.some(tab => tab === tabName)) return;

    const tabActiveClass = 'editor__content--is-active';
    const buttonActivClass = 'file-button--is-active';

    const oldTab = <HTMLElement>getElement(document, `.${tabActiveClass}`);
    if (oldTab.id == tabName) return;

    const newTab = <HTMLElement>getElement(document, tabName);

    const oldTabButton = document.querySelector(`.${buttonActivClass}`);
    if (oldTabButton) {
        oldTabButton.classList.remove(buttonActivClass);
    }

    const newTabButton = document.getElementById(`tab-button-${tabName}`);
    if (newTabButton) {
        newTabButton.classList.add(buttonActivClass);
    }

    await importModules(tabName as TabsType);

    oldTab.classList.remove(tabActiveClass);
    newTab.classList.add(tabActiveClass);
};

export class ToggleOverlay {
    /**
     * Управление затемняющим оверлеем (используется при открытии карточек сертификатов и т.п.).
     * 
     * @property overlay - HTML элемент.
     */
    static overlay: HTMLDivElement | null = document.querySelector('.overlay');

    /** Открыть оверлей. */
    static openOverlay(): void {
        if (!ToggleOverlay.overlay || ToggleOverlay.overlay.classList.contains('overlay--is-active')) return;
        ToggleOverlay.overlay.classList.add('overlay--is-active');
    }

    /** Закрыть оверлей. */
    static closeOverlay(): void {
        if (!ToggleOverlay.overlay || !ToggleOverlay.overlay.classList.contains('overlay--is-active')) return;
        ToggleOverlay.overlay.classList.remove('overlay--is-active');
    }
}

export class ThemeManager {
    /**
     * Управление цветовыми темами (localStorage + data-атрибут на html).
     */

    /** Получить текущую тему из localStorage или вернуть DEFAULT_THEME. */
    static getTheme(): ThemesType {
        let theme = localStorage.getItem('theme') || DEFAULT_THEME;
        if (!THEMES.some((th) => th === theme)) {
            theme = DEFAULT_THEME;
        }

        return theme as ThemesType;
    }

    /** Установить тему на странице и сохранить в localStorage. */
    static setTheme(new_theme: ThemesType): void {
        const htmlEl = document.documentElement as HTMLElement;
        const current_theme = ThemeManager.getTheme();

        if (new_theme !== current_theme) {
            localStorage.setItem('theme', new_theme);
        }
        htmlEl.dataset.theme = new_theme;
    }
}

/**
 * Проверяет, является ли строка числом (целым или дробным).
 * 
 * @param str - Строка для проверки.
 * @returns {boolean} `true`, если строка является числом, иначе `false`.
 */
export const isNumeric = (str: string): boolean => {
    return /^-?\d+(\.\d+)?$/.test(str.trim());
};

export class HeaderManager {
    /**
     * Управление HTTP-заголовками (Content-Type, X-Session-Id).
     */

    /** Сформировать заголовки для запроса, добавив sessionId из localStorage. */
    static buildHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let sessionId = localStorage.getItem('sessionId');
        if (sessionId && !/^[A-Za-z0-9]+$/.test(sessionId)) {
            localStorage.removeItem('sessionId');
            sessionId = null;
        }
        if (sessionId) {
            headers.append('X-Session-Id', sessionId);
        }

        return headers
    }

    /** Извлечь X-Session-Id из ответа и сохранить в localStorage. */
    static saveSessionId(response: Response): void {
        const sessionId = response.headers.get('x-session-id');
        sessionId && localStorage.setItem('sessionId', sessionId);
    }
}



