/**
 * Модуль вкладки "tabs-bar".
 * Управляет вкладками редактора, переключает активную вкладку при клике на кнопки.
 */


import { BaseModule } from '@scripts/modules/Base-module';
import { switchTab } from '@scripts/utils';


export class TabsBarModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "tabs-bar".
     * 
     * Создаёт экземпляр модуля "tabs-bar".
     * Ищет элемент с классом ".editor__tabs-bar" и инициализирует модуль.
     * @throws {HtmlElementNotFoundError} Если элемент не найден.
     */

    constructor() {
        super('.editor__tabs-bar');
        this.init();
    }

    /** Привязывает обработчики событий на вкладке "about-me". */
    protected bindEvents(): void {
        this.attachTabsListeners('.file-button');
    }

    /**
    * Навешивает слушатели на кнопки вкладок.
    * 
    * @param selector - CSS-селектор кнопок вкладок.
    */
    private attachTabsListeners(selector: string): void {
        const tabButtons = Array.from(this.rootElement.querySelectorAll(selector))
            .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                switchTab(button);
            });
        });
    }
}