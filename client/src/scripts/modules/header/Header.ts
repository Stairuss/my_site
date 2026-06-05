/**
 * Модуль блока "header" (шапка).
 * Управляет меню в шапке, открывает окно терминала при клике на кнопку.
 */

import { BaseModule } from '@scripts/modules/Base-module';
import { getElement, importModules } from '@scripts/utils';


export class HeaderModule extends BaseModule {
    /**
     * Обеспечивает логику работы блока "header".
     * 
     * Создаёт экземпляр модуля "header".
     * Ищет элемент с id="header" и инициализирует модуль.
     */
    constructor() {
        super('header');
        this.init();
    }

    /**  Привязывает обработчики событий в блока "header". */
    protected bindEvents(): void {
        this.openTerminal('.header__menu-button-terminal');
    }

    /**
     * Открывает окно терминала при клике на кнопку.
     * 
     * Динамически импортирует модуль терминала и добавляет активный класс.
     * @param selector - CSS-селектор кнопки терминала.
     */
    private async openTerminal(selector: string): Promise<void> {
        const button = <HTMLButtonElement>getElement(this.rootElement, selector);
        button.addEventListener('click', async () => {
            const terminal = <HTMLElement>getElement(document, 'terminal');
            await importModules('terminal');
            const activeClass = 'terminal--is-active'
            if (terminal.classList.contains(activeClass)) return;

            terminal.classList.add(activeClass);
        })
    }
}

