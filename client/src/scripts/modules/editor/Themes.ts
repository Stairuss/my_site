/**
 * Модуль страницы "themes" (управление цветовыми схемами).
 * Отображает список доступных тем, позволяет переключать их и сохраняет выбор в localStorage.
 */


import '@style/blocks/_themes.scss'

import { BaseModule } from '@scripts/modules/Base-module';
import { ThemeManager, getElement } from '@scripts/utils';
import { THEMES } from "@scripts/config";
import type { ThemesType } from "@scripts/config";
import {ThemesNotFoundError} from '@scripts/errors';


export class ThemesModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "themes".
     * 
     * Создаёт экземпляр модуля тем.
     * Находит корневой элемент с id="themes" и инициализирует модуль.
     * @throws {HtmlElementNotFoundError} Если элемент не найден.
     */
    constructor() {
        super('themes', true);
        this.init();
    }

    /** Привязывает обработчики событий на вкладке "themes". */
    protected bindEvents(): void {
        this.SwitchTheme('.themes__button');
        this.setActiveThemeButton();
    }

    /**
     * Навешивает слушатели на кнопки смены темы.
     * @param selector - CSS-селектор кнопок.
     * @throws {ThemesNotFoundError} Если отсутствует data-атрибут темы или тема не найдена.
     */
    private SwitchTheme(selector: string): void {        
        const buttons = Array.from(document.querySelectorAll(selector))
            .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const theme = button.dataset.themeButton;
                if (!theme) {
                    throw new ThemesNotFoundError();
                }
                if (!THEMES.some((th) => th === theme)) {
                    throw new ThemesNotFoundError(theme);
                }
                ThemeManager.setTheme(theme as ThemesType);
                this.setActiveThemeButton(button);
            })
        })
    }

    /**
     * Устанавливает активную кнопку темы (меняет текст на "Активна" и добавляет класс).
     * @param button - Кнопка, которую нужно сделать активной. Если не передана, ищет по текущей теме из localStorage.
     */
    private setActiveThemeButton(button: HTMLButtonElement | null = null): void {        
        const old_button: HTMLButtonElement | null = this.rootElement.querySelector('.themes__button--is-active');
        if (old_button) {
            old_button.classList.remove('themes__button--is-active');
            old_button.textContent = 'Применить';
        }
        const new_button = button ?? <HTMLButtonElement>getElement(this.rootElement, `[data-theme-button="${ThemeManager.getTheme()}"]`);
        new_button.classList.add('themes__button--is-active');
        new_button.textContent = 'Активна';
    }
}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new ThemesModule();

