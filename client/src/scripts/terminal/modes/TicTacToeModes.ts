/**
 * Режим терминала для игры "Крестики-нолики" против бота.
 * Управляет состояниями игры, отрисовывает поле, обрабатывает ходы пользователя.
 */


import { TERMINAL_MODES } from '@scripts/config';
import { BaseMode } from '@scripts/terminal/modes/BaseMode';
import { StateNotFoundError } from '@scripts/errors';


const state = ["init", "selected", "active", "victory", "defeat", 'draw'] as const;
type StateType = typeof state[number];

enum Symbols {
    CROSS = 'x',
    ZERO = 'o',
}

/**
 * Ответ сервера для игры "Крестики-нолики" после парсинга JSON.
 * @property state - Текущее состояние игры (init, selected, active, victory, defeat, draw).
 * @property message - Текстовое сообщение (ход, ошибка, результат).
 * @property board - Массив из 9 строк ('x', 'o', '-'), представляющий поле.
 */
interface IResponseOutput {
    state: StateType,
    message: string,
    board: string[],
}

type ComandsType = 'start' | 'restart' | 'exit' | 'clear' | 'help';

export class TicTacToeMode extends BaseMode<ComandsType> {
    /**
     * Режим "Крестики-нолики".
     * Взаимодействует с бэкендом, который хранит состояние игры, проверяет победу и делает ходы бота.
     *
     * @property modeName - Название режима (TERMINAL_MODES.TTT).
     * @property commands - Список команд: start, restart + базовые.
     * @property commandDescriptions - Описания команд.
     * @property currentState - Текущее состояние игры (init, selected, active, victory, defeat, draw).
     * @property logoGameShow - Флаг, показывать ли логотип TIC-TAC-TOE при первом входе в состояние selected.
     */
    protected readonly modeName: TERMINAL_MODES = TERMINAL_MODES.TTT
    protected readonly commands: ComandsType[] = [
        'start',
        'restart',
        ...BaseMode.baseCommands,
    ];
    protected commandDescriptions: Record<ComandsType, string> = {
        'start': 'Запуск игры.',
        'restart': 'Начать новую игру',
        ...BaseMode.baseDescriptions,
    }
    private currentState: StateType | null = null;
    private logoGameShow: boolean = false;

    constructor() {
        super();
    }

    /**
     * Инициализация режима: выводит приветственное сообщение и список действий.
     * @returns Массив строк для вывода в терминал.
     */
    public init(): string[] {
        return [
            '❌⭕ Режим "Крестики-нолики" активен.',
            'Начать игру: <b>start</b>',
            'Для выхода: <b>exit</b>',
            'Список команд: <b>help</b>'
        ];
    }

    /**
     * Основной метод выполнения: обрабатывает команды и отправляет запросы на сервер.
     * @param inputData - Введённая строка.
     * @returns Массив строк для вывода (сообщения, поле).
     */
    public async execute(inputData: string): Promise<string[]> {
        // Базовые команды (кроме start/restart)
        if ((this.commands as readonly string[]).includes(inputData) && inputData !== 'start' && inputData !== 'restart') {
            return this.routeCommands(inputData as ComandsType);
        }

        if (inputData === 'restart') {
            this.logoGameShow = false;
        }
        // Подготовка запроса (преобразование выбора стороны)
        const updateInputData = this.routeStateRequest(inputData);
        if (updateInputData) {
            inputData = updateInputData;
        }
        const response = await this.sendRequest({ command: inputData, mode: this.modeName });
        if (!response.success) {
            return [response.output]
        }

        try {
            const responseOutput: IResponseOutput = JSON.parse(response.output)
            this.setState(responseOutput.state)            
            return this.routeStateResponse(responseOutput);
        } catch (error) {
            if (error instanceof StateNotFoundError) {
                return [`${error}`]
            } else if (error instanceof SyntaxError) {
                return [`SyntaxError: ${response.output} не может быть преобразован в JSON`]
            } else {
                return ['Неизвестная ошибка обработки данных.']
            }
        }
    }

    /**
     * Устанавливает текущее состояние игры с проверкой валидности.
     * @param newState - Новое состояние.
     * @throws {StateNotFoundError} Если состояние неизвестно.
     */
    private setState(newState: StateType): void {
        if (!(state as readonly string[]).includes(newState)) {
            throw new StateNotFoundError(newState);
        }
        this.currentState = newState;
    }

    /**
     * Предварительная обработка команды перед отправкой на сервер (например, преобразование "1" → "x").
     * @param command - Исходная команда.
     * @returns Преобразованная команда или null.
     */
    private routeStateRequest(command: string): string | null {        
        let response = null;

        switch (this.currentState) {
            case 'selected':
                if (command === '1') {
                    response = Symbols.CROSS
                } else if (command === '2') {
                    response = Symbols.ZERO
                }
                break;
        }

        return response
    }

    /**
     * Обрабатывает ответ сервера в зависимости от текущего состояния.
     * @param responseOutput - Распарсенный ответ сервера.
     * @returns Массив строк для вывода.
     */
    private routeStateResponse(responseOutput: IResponseOutput): string[] {
        let response: string[];

        switch (this.currentState) {
            case 'init':
                response = this.stateInitHandler(responseOutput);
                break

            case 'selected':
                response = this.stateSelectedHandler(responseOutput);
                break;

            case 'active':
                response = this.stateActiveHandler(responseOutput);
                break;

            case 'victory':
                response = this.stateVictoryHandler(responseOutput);
                break;
            
            case 'defeat':
                response = this.stateDefeatHandler(responseOutput);
                break;
            
            case 'draw':
                response = this.stateDrawHandler(responseOutput);
                break;

            default:
                throw new StateNotFoundError()
        }
        return response;
    }

    /**
     * Маршрутизирует базовые команды (help).
     * @param command - Команда (help).
     * @returns Массив строк.
     */
    protected routeCommands(command: ComandsType): string[] {        
        let result: string[] = [];
        switch (command) {
            case 'help':
                result = this.helpCommand();
                break;
        }

        return result;
    }

    /**
     * Отрисовывает игровое поле в виде ASCII-схемы.
     * @param board - Массив из 9 символов ('x', 'o', '-').
     * @returns Строка с отформатированным полем.
     */
    private renderBoard(board: string[]): string {
        const cells = board.map(cell => {
            if (cell === 'x') return 'X';
            if (cell === 'o') return 'O';
            return ' ';
        });

        const boardString = `
   a   b   c
 ┌───┬───┬───┐
1│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
 ├───┼───┼───┤
2│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
 ├───┼───┼───┤
3│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
 └───┴───┴───┘
    `;

        return boardString
    }

    /**
     * Обрабатывает ответ в состоянии init (начало игры).
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк для вывода.
     */
    private stateInitHandler(responseOutput: IResponseOutput): string[] {
        return [responseOutput.message];
    }

    /**
     * Обрабатывает ответ в состоянии selected (выбор стороны).
     * При первом вызове показывает логотип TIC-TAC-TOE, затем только сообщение.
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк для вывода.
     */
    private stateSelectedHandler(responseOutput: IResponseOutput): string[] {
        if (!this.logoGameShow) {
            this.logoGameShow = true;

            return [
                ' ',
                ' ',
                ' ',
                ' ',
                '┌─────────────────────────────────────┐',
                '<pre>│            TIC-TAC-TOE              │</pre>',
                '└─────────────────────────────────────┘',
                ' ',
                ' ',
                ' ',
                ' ',
                responseOutput.message,
                'Введите номер:',
                '1. Крестики',
                '2. Нолики',
            ];
        } else {
            return [
                `${responseOutput.message}`,
                'Введите номер:',
                '1. Крестики',
                '2. Нолики',
            ]
        }

    }

    /**
     * Обрабатывает ответ в состоянии active (ход игрока).
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк с сообщением и отрисованным полем.
     */
    private stateActiveHandler(responseOutput: IResponseOutput): string[] {
        const board = responseOutput.board;        

        return [
            responseOutput.message || '',
            `<pre>${this.renderBoard(board)}</pre>`
        ];
    }

    /**
     * Обрабатывает ответ в состоянии victory (победа игрока).
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк с сообщением и финальным полем.
     */
    private stateVictoryHandler(responseOutput: IResponseOutput): string[] {
        const board = responseOutput.board;        

        return [
            responseOutput.message || '',
            `<pre>${this.renderBoard(board)}</pre>`
        ];
    }

    /**
     * Обрабатывает ответ в состоянии defeat (поражение игрока).
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк с сообщением и финальным полем.
     */
    private stateDefeatHandler(responseOutput: IResponseOutput): string[] {
        const board = responseOutput.board;        

        return [
            responseOutput.message || '',
            `<pre>${this.renderBoard(board)}</pre>`
        ];
    }

    /**
     * Обрабатывает ответ в состоянии draw (ничья).
     * @param responseOutput - Ответ сервера.
     * @returns Массив строк с сообщением и финальным полем.
     */
    private stateDrawHandler(responseOutput: IResponseOutput): string[] {
        const board = responseOutput.board;        

        return [
            responseOutput.message || '',
            `<pre>${this.renderBoard(board)}</pre>`
        ];
    }
}