/**
 * Режим терминала для математических вычислений.
 * Позволяет вычислять арифметические выражения с поддержкой операторов +, -, *, /, //, %, ** и скобок.
 * Команды: exit, clear, help.
 */


import { TERMINAL_MODES } from '@scripts/config';
import { BaseMode } from '@scripts/terminal/modes/BaseMode';


type ComandsType = 'exit' | 'clear' | 'help';

export class MathMode extends BaseMode<ComandsType> {
    /**
     * Режим "Математика".
     * Отправляет выражение на сервер для безопасного вычисления (через simpleeval).
     *
     * @property modeName - Название режима (TERMINAL_MODES.MATH).
     * @property commands - Список доступных команд (базовые: exit, clear, help).
     * @property commandDescriptions - Описания команд (наследуются от BaseMode).
     */
    protected readonly modeName: TERMINAL_MODES = TERMINAL_MODES.MATH;
    protected readonly commands: ComandsType[] = [
        ...BaseMode.baseCommands,
    ];
    protected commandDescriptions: Record<ComandsType, string> = {
        ...BaseMode.baseDescriptions,
    }

    constructor() {
        super();
    }

    /**
     * Инициализация режима: выводит приветственное сообщение и пример выражения.
     * @returns Массив строк для вывода в терминал.
     */
    public init(): string[] {
        return [
            '🧮 Режим математики активен.',
            'Доступные операции: +, -, *, /, //, %, ** и группировка ().',
            'Пример: 21 + 19 / 7 + (8 % 3) ** 9',
            'Для выхода: <b>exit</b>',
        ];
    }

    /**
     * Выполняет команду или отправляет выражение на сервер для вычисления.
     * @param inputData - Введённая пользователем строка (команда или выражение).
     * @returns Массив строк с результатом вычисления или сообщением об ошибке.
     */
    public async execute(inputData: string): Promise<string[]> {
        if ((this.commands as readonly string[]).includes(inputData)) {
            return this.routeCommands(inputData as ComandsType);
        }

        const response = await this.sendRequest({ command: inputData, mode: this.modeName });
        return [response.output];
    }

    /**
     * Маршрутизирует команды внутри режима (help).
     * @param command - Команда (ожидается 'help').
     * @returns Массив строк с результатом.
     */
    protected routeCommands(command: ComandsType): string[] {
        // Маршутизация команд
        let result: string[] = [];
        switch (command) {
            case 'help':
                result = this.helpCommand();
                break;
        }

        return result;
    }
}