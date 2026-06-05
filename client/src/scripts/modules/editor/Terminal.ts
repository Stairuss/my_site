/**
 * Модуль терминала (окно, вкладки, изменение размера, закрытие).
 * Управляет UI терминала: отображение, ресайз, фокус, переключение вкладок.
 * При создании инициализирует TerminalEngine для обработки команд.
 */


import '@style/blocks/_terminal.scss';
import { BaseModule } from '@scripts/modules/Base-module';
import { getElement } from '@scripts/utils';
import { TerminalEngine } from '@scripts/terminal/TerminalEngine';


const screenFullIcon = new URL('@assets/sprite.svg#screen-full-icon', import.meta.url).href;
const screenNormalIcon = new URL('@assets/sprite.svg#screen-normal-icon', import.meta.url).href;

export class TerminalModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "terminal".
     *      
     * Модуль терминала.
     * Управляет отображением, изменением размера, закрытием, фокусом, вкладками.
     *
     * @property resizeHandle - Элемент для изменения высоты.
     * @property MIN_HEIGHT - Минимальная высота терминала (200px).
     * @property MAX_HEIGHT - Максимальная высота терминала (1225px).
     * @property workspace - Рабочая область терминала.
     * @property historyContainer - Контейнер для истории команд.
     * @property inputContainer - Контейнер для строки ввода.
     * @property input - Поле ввода команд.
     * @property promptUser - Элемент с именем пользователя в приглашении.
     * @property promptMode - Элемент с текущим режимом в приглашении.
     * @property loader - Элемент загрузчика (спиннер).
     * @property terminalEngine - Обьект запущенного движка терминала..
     */
    private readonly resizeHandle: HTMLDivElement;
    private readonly MIN_HEIGHT = 200;
    private readonly MAX_HEIGHT = 1225;
    private workspace: HTMLElement;
    private historyContainer: HTMLDivElement;
    private inputContainer: HTMLDivElement;
    private input: HTMLInputElement;
    private promptUser: HTMLSpanElement;
    private promptMode: HTMLSpanElement;
    private loader: HTMLSpanElement;
    private terminalEngine: TerminalEngine;

    /**
     * Создаёт экземпляр модуля терминала.
     * Находит корневой элемент с id="terminal", инициализирует TerminalEngine и подготавливает UI.
     * @throws {HtmlElementNotFoundError} Если какой-либо элемент не найден.
     */
    constructor() {
        super('terminal', true);
        this.resizeHandle = <HTMLDivElement>getElement(this.rootElement, '.terminal__resize-handle');
        this.workspace = <HTMLElement>getElement(this.rootElement, '.terminal__workspace');
        this.historyContainer = <HTMLDivElement>getElement(this.rootElement, '.terminal__content-history-container');
        this.inputContainer = <HTMLDivElement>getElement(this.rootElement, '.terminal__content-input-container');
        this.input = <HTMLInputElement>getElement(document, 'terminal-input');
        this.promptUser = <HTMLSpanElement>getElement(document, 'terminal-user');
        this.promptMode = <HTMLSpanElement>getElement(document, 'terminal-mode')
        this.loader = <HTMLSpanElement>getElement(this.rootElement, '.loader');

        // Создаём ядро терминала, передавая ему DOM-элементы для управления выводом и вводом
        this.terminalEngine = new TerminalEngine(
            this.workspace,
            this.historyContainer,
            this.inputContainer,
            this.input,
            this.promptUser,
            this.promptMode,
            this.loader,
        );

        this.init();
    }

    /** Привязывает обработчики событий на "terminal". */
    protected bindEvents(): void {
        this.closeTerminal();
        this.toggleTerminalHeight();
        this.resizeTerminalWindow();
        this.switchTab('.terminal__tabs-button');
        this.focusInputOnWorkspaceClick();
    }

    /**
     * Обработчик изменения размера терминала (перетаскивание за ручку).
     * Реализует задержку активации, движение мыши с ограничением min/max высоты.
     */
    private resizeTerminalWindow(): void {
        const activeClass = 'terminal__resize-handle--is-active';
        let isActive = false;
        let isGrabbing = false;
        let startY: number | null = null;
        let startHeight: number = 400;
        let activeTimer: ReturnType<typeof setTimeout> | null = null;

        const resize = (event: MouseEvent) => {
            if (!isGrabbing || startY === null) return;

            // Предотвращаем выделение текста во время ресайза
            event.preventDefault();

            let newHeight: number;

            if (startY > event.clientY) {
                // Курсор движется вверх - увеличиваем окно
                const diff = startY - event.clientY;
                newHeight = startHeight + diff;
            } else {
                // Курсор движется вниз - уменьшаем окно
                const diff = event.clientY - startY;
                newHeight = startHeight - diff;
            }

            // Ограничиваем минимальную и максимальную высоту
            newHeight = Math.max(this.MIN_HEIGHT, Math.min(this.MAX_HEIGHT, newHeight));
            this.rootElement.style.height = `${newHeight}px`;
        };

        const stopResize = () => {
            if (!isGrabbing) return;

            isGrabbing = false;
            startY = null;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);

            // Убираем курсор для всего документа
            document.body.classList.remove('resizing-cursor');
        };

        const startResize = (event: MouseEvent) => {
            if (!isActive) return;

            event.preventDefault();
            isGrabbing = true;
            startY = event.clientY;
            startHeight = this.rootElement.offsetHeight;

            // Добавляем курсор для всего документа во время ресайза
            document.body.classList.add('resizing-cursor');

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        };

        // Mouseover с задержкой
        this.resizeHandle.addEventListener('mouseover', () => {
            activeTimer = setTimeout(() => {
                this.resizeHandle.classList.add(activeClass);
                isActive = true;
            }, 100);
        });

        // Mouseout с очисткой
        this.resizeHandle.addEventListener('mouseout', () => {
            if (activeTimer) {
                clearTimeout(activeTimer);
                activeTimer = null;
            }

            if (isActive) {
                isActive = false;
                this.resizeHandle.classList.remove(activeClass);
            }

            // Если ресайз был активен - принудительно останавливаем
            if (isGrabbing) {
                stopResize();
            }
        });

        // Обработчики для ресайза
        this.resizeHandle.addEventListener('mousedown', startResize);

        // Предотвращаем перетаскивание handle как изображения
        this.resizeHandle.addEventListener('dragstart', (e) => e.preventDefault());
    }

    /** Переключает режим полной/нормальной высоты терминала (кнопка в правом углу терминала). */
    private toggleTerminalHeight(): void {
        const maxHeightClass = 'terminal--max-height';
        const buttons = Array.from(this.rootElement.querySelectorAll('.terminal__button--toggle-size'))
            .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);

        buttons.forEach((button) => {
            const use = <SVGUseElement>getElement(button, 'use', true);
            button.addEventListener('click', () => {
                if (!this.rootElement.classList.contains(maxHeightClass)) {
                    this.rootElement.classList.add(maxHeightClass);
                    use.setAttribute('href', screenNormalIcon);
                } else {
                    this.rootElement.classList.remove(maxHeightClass);
                    use.setAttribute('href', screenFullIcon);
                }
            })
        })
    }

    /** Закрывает терминал (удаляет класс активности, очищает историю и поле ввода). */
    private closeTerminal(): void {
        const buttons = Array.from(this.rootElement.querySelectorAll('.terminal__button--close'))
            .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                this.rootElement.classList.remove('terminal--is-active');
                this.terminalEngine.reset();
                this.historyContainer.textContent = '';
                this.input.value = '';
            })
        })
    }

    /**
     * Переключает вкладки внутри терминала (например, "Проблемы", "Терминал" и т.п.).
     * @param selector - CSS-селектор кнопок вкладок.
     */
    private switchTab(selector: string): void {
        const buttons = Array.from(this.rootElement.querySelectorAll(selector))
            .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.terminalTab as string;
                if (!tabName) return;

                const tabActiveClass = 'terminal__content--is-active';
                const buttonActivClass = 'terminal__tabs-button--is-active';

                const oldTab = <HTMLDivElement>getElement(this.rootElement, `.${tabActiveClass}`);
                if (oldTab.id == tabName) return;

                const newTab = <HTMLDivElement>getElement(document, tabName);

                const oldTabButton = document.querySelector(`.${buttonActivClass}`);
                if (oldTabButton) {
                    oldTabButton.classList.remove(buttonActivClass);
                }

                button.classList.add(buttonActivClass)

                oldTab.classList.remove(tabActiveClass);
                newTab.classList.add(tabActiveClass);
            })
        })
    }

    /** Устанавливает фокус на поле ввода при клике на рабочую область терминала. */
    private focusInputOnWorkspaceClick(): void {
        const workspace = <HTMLDivElement>getElement(this.rootElement, '.terminal__workspace');
        workspace.addEventListener('click', () => {
            this.input.focus();
        })
    }
}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new TerminalModule();


