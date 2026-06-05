/**
 * Режим терминала для общения с ИИ (Yandex GPT).
 * Позволяет пользователю задавать вопросы и получать ответы от языковой модели.
 * Команды: exit, clear, help.
 */


import { TERMINAL_MODES } from '@scripts/config';
import { BaseMode } from '@scripts/terminal/modes/BaseMode';


type ComandsType = 'exit' | 'clear' | 'help';

export class AiMode extends BaseMode<ComandsType> {
    /**
     * Режим ИИ.
     * Отправляет сообщения пользователя на бэкенд и возвращает ответ ИИ модели.
     *
     * @property modeName - Название режима (TERMINAL_MODES.AI).
     * @property commands - Список доступных команд (базовые: exit, clear, help).
     * @property commandDescriptions - Описания команд (наследуются от BaseMode).
     */
    protected readonly modeName: TERMINAL_MODES = TERMINAL_MODES.AI;
    protected readonly commands: ComandsType[] = [
        ...BaseMode.baseCommands,
    ]
    protected commandDescriptions: Record<ComandsType, string> = {
        ...BaseMode.baseDescriptions,
    }

    constructor() {
        super();
    }

    /**
     * Инициализация режима: выводит приветственное сообщение и подсказку.
     * @returns Массив строк для вывода в терминал.
     */
    public init(): string[] {
        return [
            '🤖 Режим общения с ИИ.',
            'Просто напишите вопрос или фразу.',
            'Пример: «Расскажи шутку»',
            'Выход: <b>exit</b>',
        ]
    }

    /**
     * Обрабатывает ввод пользователя: если команда (exit, clear, help) — вызывает маршрутизацию,
     * иначе отправляет запрос на сервер и возвращает ответ.
     * @param inputData - Введённая строка.
     * @returns Массив строк для вывода в терминал.
     */
    public async execute(inputData: string): Promise<string[]> {
        if ((this.commands as readonly string[]).includes(inputData)) {
            return this.routeCommands(inputData as ComandsType);
        }
        const response = await this.sendRequest({ command: inputData, mode: this.modeName });
        return [response.output];
    }

    /**
     * Маршрутизирует базовые команды (help). Остальные команды (exit, clear) обрабатываются в TerminalEngine.
     * @param command - Команда (help).
     * @returns Массив строк для вывода.
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