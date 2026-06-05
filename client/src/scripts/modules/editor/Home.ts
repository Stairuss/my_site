/**
 * Модуль домашней вкладки "home". Представляет стартовую страницу сайта.
 * Отображает приветствие, фото, ссылки и кнопки для переключения на другие вкладки.
 */


import '@style/blocks/_home.scss';
import { BaseModule } from '@scripts/modules/Base-module';
import { switchTab } from '@scripts/utils';


export class HomeModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "home".
     * 
     * Создаёт экземпляр модуля домашней вкладки.
     * Ищет элемент с id="home" и инициализирует модуль.
     * @throws {HtmlElementNotFoundError} Если элемент не найден.
     */
    constructor() {
        super('home', true);

        this.init();
    }

    /** Привязывает обработчики событий на вкладке "home". */
    protected bindEvents(): void {
        this.attachTabsListeners('.home__button');
    }

    /**
     * Навешивает слушатели на кнопки переключения вкладок.
     * @param selector - CSS-селектор кнопок внутри корневого элемента.
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