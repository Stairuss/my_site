/**
 * Модуль блока "profile-bar" (сайдбар профиля).
 * Управляет кнопками профиля в сайдбаре, переключает активную вкладку при клике.
 */


import { BaseModule } from '@scripts/modules/Base-module';
import { switchTab } from '@scripts/utils';


export class ProfileBarModule extends BaseModule {
    /**
     * Обеспечивает логику работы блока "profile-bar".
     * 
     * Создаёт экземпляр модуля "profile-bar".
     * Ищет элемент с классом ".sidebar__profile-bar" и инициализирует модуль.
     */
    constructor() {
        super('.sidebar__profile-bar');
        this.init();
    }

    /**  Привязывает обработчики событий в блока "profile-bar". */
    protected bindEvents(): void {
        this.attachTabsListeners('.sidebar__profile-bar-button');
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