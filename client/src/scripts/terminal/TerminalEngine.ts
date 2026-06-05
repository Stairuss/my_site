/**
 * Ядро терминала: обработка ввода / вывода, маршрутизация команд, управление режимами, вывод истории.
 * Связывает UI с бизнес-логикой режимов (Math, AI, Cat, TicTacToe, Themes).
 */


import { TERMINAL_COMMANDS, COMMAND_DESCRIPTIONS } from '@scripts/config';
import { type TerminalCommandsType, TERMINAL_MODES } from '@scripts/config';
import { createHistoryElement } from '@components/terminal-history-element';
import { BaseMode } from '@scripts/terminal/modes/BaseMode';
import { ThemesMode } from '@scripts/terminal/modes/ThemesMode';
import { MathMode } from '@scripts/terminal/modes/MathMode';
import { AiMode } from '@scripts/terminal/modes/AiMode';
import { CatMode } from '@scripts/terminal/modes/CatFactsMode';
import { TicTacToeMode } from '@scripts/terminal/modes/TicTacToeModes';
import { TerminalCommandTooLongError } from '@scripts/errors';


export class TerminalEngine {
    /**
     * Движок терминала.
     * Управляет вводом команд, выводом результата, отображением истории, переключением режимов.
     *
     * @property DEFAULT_COMMANDS - Список команд, которые не требуют активного режима и обрабатываются на уровне ядра (clear, exit).
     * @property workspace - Контейнер с прокруткой (всё содержимое терминала).
     * @property historyContainer - Блок, куда добавляются строки истории.
     * @property inputContainer - Контейнер строки ввода (может скрываться во время загрузки).
     * @property input - Поле ввода команд.
     * @property promptUser - Элемент с именем пользователя (например, "stairus@stairus:~$").
     * @property promptMode - Элемент для отображения текущего режима (например, "[AI]").
     * @property loader - Спиннер загрузки.
     * @property instanceMode - Текущий активный режим (Math, AI, Cat и т.д.) или null.
     * @property maxLengthCommand - Максимальная длина команды (200 символов).
     */
    private readonly DEFAULT_COMMANDS = ['clear', 'exit'] as const satisfies readonly TerminalCommandsType[];
    private workspace: HTMLElement;
    private historyContainer: HTMLDivElement;
    private inputContainer: HTMLDivElement;
    private input: HTMLInputElement;
    private promptUser: HTMLSpanElement;
    private promptMode: HTMLSpanElement;
    private loader: HTMLSpanElement;
    private instanceMode: BaseMode | null = null;
    private maxLengthCommand = 200;

    /**
     * Создаёт экземпляр движка терминала.
     * Инициализирует все DOM-элемы терминала, выводит приветственное сообщение.
     * 
     * @param workspace - Контейнер с прокруткой (всё содержимое терминала).
     * @param historyContainer - Блок, куда добавляются строки истории.
     * @param inputContainer - Контейнер строки ввода (может скрываться во время загрузки).
     * @param input - Поле ввода команд.
     * @param promptUser - Элемент с именем пользователя (например, "stairus@stairus:~$").
     * @param promptMode - Элемент для отображения текущего режима (например, "[AI]").
     * @param loader - Спиннер загрузки.
     */
    constructor(workspace: HTMLElement, historyContainer: HTMLDivElement, inputContainer: HTMLDivElement, input: HTMLInputElement, promptUser: HTMLSpanElement, promptMode: HTMLSpanElement, loader: HTMLSpanElement) {
        this.workspace = workspace;
        this.historyContainer = historyContainer;
        this.inputContainer = inputContainer;
        this.input = input;
        this.promptMode = promptMode;
        this.promptUser = promptUser;
        this.loader = loader;

        this.createHistory({ outputData: 'Добро пожаловать в мое портфолио! 🎉', isCommand: false });
        this.createHistory({ outputData: 'Введите "help" для просмотра доступных команд.', isCommand: false });
        this.promptUser.textContent = 'stairus@stairus:~$';
        this.init();
    }

    /** Инициализация движка. */
    private init(): void {
        this.bindEvents();
    }

    /** Привязывает обработчики событий (ввод с клавиатуры). */
    private bindEvents(): void {
        this.attachInputListeners();
    }

    /**
     * Сбрасывает состояние терминала к начальному.
     * Очищает историю команд, поле ввода, сбрасывает активный режим и приглашение.
     * Вызывается при закрытии терминала, чтобы при повторном открытии состояние было чистым.
     */
    public reset(): void {
        this.historyContainer.textContent = '';
        this.input.value = '';
        this.instanceMode = null;
        this.promptMode.textContent = '';
    }

    /**
     * Обработчик нажатия Enter: валидация, нормализация, вызов маршрутизации или передача команды в активный режим.
     */
    private async attachInputListeners(): Promise<void> {
        this.input.addEventListener('keydown', async (event) => {
            if (event.key != 'Enter') return;
            try {
                this.validateInputValue();
            } catch (error) {
                if (error instanceof TerminalCommandTooLongError) {
                    this.createHistory({ outputData: `${error.name}: ${error.message}` });
                    return;
                }
            }

            this.normalizeInputValue();

            if ((this.DEFAULT_COMMANDS as readonly string[]).includes(this.input.value)) {
                this.routeCommands(this.input.value as TerminalCommandsType);
            } else if (this.instanceMode) {
                const inputValue = this.input.value;
                this.createHistory({});
                this.inputContainer.classList.add('terminal__content-input-container--hidden');
                this.loader.classList.add('loader--is-active');
                const messages = await this.instanceMode.execute(inputValue);
                this.loader.classList.remove('loader--is-active');
                this.inputContainer.classList.remove('terminal__content-input-container--hidden');
                this.createManyHistorys(messages, false);
            } else {
                const command = this.command_exists();
                if (!command) {
                    return;
                };
                this.createHistory({});
                this.routeCommands(command);
            }
        })
    }

    /**
     * Маршрутизирует команду верхнего уровня к соответствующему обработчику.
     * @param command - Команда из списка TerminalCommandsType.
     */
    private routeCommands(command: TerminalCommandsType): void {
        switch (command) {
            case 'exit':
                this.exitCommand();
                break;

            case 'clear':
                this.clearCommand();
                break;

            case 'ai':
                this.aiCommand();
                break;

            case 'theme':
                this.themeCommand();
                break;

            case 'math':
                this.mathCommand();
                break;

            case 'cat':
                this.catCommand();
                break;

            case 'ttt':
                this.ticTacToeCommand();
                break;

            case 'help':
                this.helpCommand();
                break;
        }
    }

    /** Удаляет лишние пробелы в начале и конце введённой команды. */
    private normalizeInputValue(): void {
        this.input.value = this.input.value.trim();
    }

    /**
     * Проверяет длину команды и выбрасывает исключение, если превышен лимит.
     * @throws {TerminalCommandTooLongError} Если длина команды больше maxLengthCommand.
     */
    private validateInputValue(): void {
        if (this.input.value.length > this.maxLengthCommand) {
            throw new TerminalCommandTooLongError(this.maxLengthCommand);
        }
    }

    /**
     * Добавляет одну запись в историю терминала.
     * @param options - Параметры записи:
     *   - outputData: текст вывода (если null, вывод не добавляется).
     *   - isCommand: если true, добавляется строка с введённой командой.
     *   - isClearInput: если true, поле ввода очищается после добавления.
     */
    private createHistory({ outputData = null, isCommand = true, isClearInput = true }: { outputData?: string | null, isCommand?: boolean, isClearInput?: boolean }): void {
        if (isCommand) {
            const historyCommand = createHistoryElement(this.input.value, this.promptMode.textContent, this.promptUser.textContent);
            this.historyContainer.append(historyCommand);
        }
        if (outputData) {
            const historyOutput = createHistoryElement(outputData);
            this.historyContainer.append(historyOutput);
        }
        if (isClearInput) {
            this.input.value = '';
        }
        this.workspace.scrollTop = this.workspace.scrollHeight;
    }

    /**
     * Добавляет массив сообщений в историю.
     * @param messages - Массив строк для вывода.
     * @param isCommand - Если true, каждое сообщение форматируется как команда, иначе как обычный вывод.
     */
    private createManyHistorys(messages: string[], isCommand: boolean = true): void {
        if (isCommand) {
            messages.forEach((message) => this.createHistory({ outputData: message }));
        } else {
            messages.forEach((message) => this.createHistory({ outputData: message, isCommand: false }));
        }
    }

    /**
     * Проверяет, существует ли введённая команда в списке TERMINAL_COMMANDS.
     * @returns Команду, если она существует, иначе false.
     */
    private command_exists(): TerminalCommandsType | false {
        const value = this.input.value;
        if (TERMINAL_COMMANDS.some((command) => command === value)) {
            return value as TerminalCommandsType;
        }
        this.createHistory({ outputData: `Команда '${value}' не найдена` });
        return false;
    }

    /**
     * Обработчик команды exit: выходит из активного режима, сбрасывает режим.
     */
    private exitCommand(): void {
        this.createHistory({});
        this.instanceMode = null;
        this.promptMode.textContent = '';
    }

    /**
     * Обработчик команды clear: очищает всю историю терминала.
     */
    private clearCommand(): void {
        this.historyContainer.textContent = '';
        this.input.value = '';
    }

    /**
     * Обработчик команды ai: запускает режим общения с ИИ.
     */
    private aiCommand(): void {
        this.promptMode.textContent = `[${TERMINAL_MODES.AI}]`;
        this.instanceMode = new AiMode();
        const messages = this.instanceMode.init();
        this.createManyHistorys(messages, false);
    }

    /**
     * Обработчик команды theme: запускает режим выбора цветовой темы.
     */
    private themeCommand(): void {
        this.promptMode.textContent = `[${TERMINAL_MODES.THEME}]`;
        this.instanceMode = new ThemesMode();
        const messages = this.instanceMode.init();
        this.createManyHistorys(messages, false);
    }

    /**
     * Обработчик команды math: запускает режим калькулятора.
     */
    private mathCommand(): void {
        this.promptMode.textContent = `[${TERMINAL_MODES.MATH}]`;
        this.instanceMode = new MathMode();
        const messages = this.instanceMode.init();
        this.createManyHistorys(messages, false);
    }

    /**
     * Обработчик команды cat: запускает режим случайных фактов о котиках.
     */
    private catCommand(): void {
        this.promptMode.textContent = `[${TERMINAL_MODES.CAT}]`;
        this.instanceMode = new CatMode();
        const messages = this.instanceMode.init();
        this.createManyHistorys(messages, false);
    }

    /**
     * Обработчик команды ttt: запускает режим игры "Крестики-нолики".
     */
    private ticTacToeCommand(): void {
        this.promptMode.textContent = `[${TERMINAL_MODES.TTT}]`;
        this.instanceMode = new TicTacToeMode();
        const messages = this.instanceMode.init();
        this.createManyHistorys(messages, false);

    }

    /**
     * Обработчик команды help: выводит список всех доступных команд и их описания.
     */
    private helpCommand(): void {
        this.createHistory({ outputData: '--------------------------', isCommand: false });
        Object.entries(COMMAND_DESCRIPTIONS).forEach(([command, description]) => {
            this.createHistory({ outputData: `<b>${command}</b>: ${description}`, isCommand: false });
        });
        this.createHistory({ outputData: '--------------------------', isCommand: false });
    }
}