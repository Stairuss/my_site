/**
 * Модуль вкладки "about-me".
 * Отображает информацию о разработчике, технологиях и опыте.
 */


import '@style/blocks/_about-me.scss';
import { BaseModule } from '@scripts/modules/Base-module';


export class AboutMeModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "about-me".
     * 
     * Создаёт экземпляр модуля "about-me".
     * Ищет элемент с id="about-me" и инициализирует модуль.
     * @throws {HtmlElementNotFoundError} Если элемент не найден.
     */
    constructor() {
        super('about-me', true);
        this.init();
    }

    /** 
     * Привязывает обработчики событий на вкладке "about-me".
     * 
     * В данной вкладке нет интерактивных элементов, требующих привязки событий.
     */
    protected bindEvents(): void { }

}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new AboutMeModule();