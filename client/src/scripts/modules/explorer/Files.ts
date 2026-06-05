/**
 * Модуль блока "explorer" (проводник).
 * Управляет списком файлов в проводнике, переключает открытое/закрытое состояние.
 */


import { BaseModule } from '@scripts/modules/Base-module';
import { switchTab, getElement } from '@scripts/utils';


export class FilesModule extends BaseModule {
    /**
     * Обеспечивает логику работы блока "explorer".
     * 
     * Создаёт экземпляр модуля "explorer".
     * Ищет элемент с классом ".explorer" и инициализирует модуль.
     */

    constructor() {
        super('.explorer');
        this.init();
    }

    /**  Привязывает обработчики событий в блока "explorer". */
    protected bindEvents(): void {
        this.attachTabsListeners('.file-button');
        this.toggleFileList()
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

    /**  Переключает открытое/закрытое состояние списка файлов. */
    private toggleFileList() {
        const button = <HTMLButtonElement>getElement(this.rootElement, '.explorer__toggle-button');
        const arrowIcon = <SVGSVGElement>getElement(this.rootElement, '.explorer__toggle-icon');
        const fileList = <SVGSVGElement>getElement(this.rootElement, '.explorer__files');

        button.addEventListener('click', () => {
            if (arrowIcon.classList.contains('explorer__toggle-icon--close')) {
                arrowIcon.classList.remove('explorer__toggle-icon--close');
                fileList.classList.remove('explorer__files--hidden');
            } else {
                arrowIcon.classList.add('explorer__toggle-icon--close');
                if (!fileList.classList.contains('explorer__files--hidden')) {
                    fileList.classList.add('explorer__files--hidden');
                }
            }
        })

    }
}