/**
 * Модуль вкладки "projects".
 * Отображает карточки проектов (интернет-магазин, Twitter-клон, сайт-портфолио).
 * (В текущей версии содержимое не реализовано, но заглушка присутствует.)
 */


import '@style/blocks/_projects.scss';
import { BaseModule } from '@scripts/modules/Base-module';


export class ProjectsModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "projects".
     * 
     * Создаёт экземпляр модуля "projects".
     * Ищет элемент с id="projects" и инициализирует модуль.
     */
    constructor() {
        super('projects', true);

        this.init();
    }

    /** 
     * Привязывает обработчики событий на вкладке "projects".
     * 
     * В данной вкладке нет интерактивных элементов, требующих привязки событий.
     */
    protected bindEvents(): void {}
   
}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new ProjectsModule();