/**
 * Режим терминала для получения случайных фактов о котиках.
 * Команда: "мяу" – получить случайный факт из предустановленного списка (или с бэкенда).
 * Также поддерживаются базовые команды: exit, clear, help.
 */


import { TERMINAL_MODES } from '@scripts/config';
import { BaseMode } from '@scripts/terminal/modes/BaseMode';


type ComandsType = 'мяу' | 'exit' | 'clear' | 'help';

export class CatMode extends BaseMode<ComandsType> {
    /**
     * Режим "Факты о котиках".
     * Отправляет команду "мяу" на сервер и возвращает случайный факт.
     *
     * @property modeName - Название режима (TERMINAL_MODES.CAT).
     * @property commands - Список доступных команд: "мяу" + базовые.
     * @property commandDescriptions - Описания команд.
     */
    protected readonly modeName: TERMINAL_MODES = TERMINAL_MODES.CAT
    protected readonly commands: ComandsType[] = [
        'мяу',
        ...BaseMode.baseCommands,
    ];
    protected commandDescriptions: Record<ComandsType, string> = {
        'мяу': 'Получить факт о котиках',
        ...BaseMode.baseDescriptions,
    }

    constructor() {
        super();
    }

    /**
     * Инициализация режима: выводит приветственное сообщение и инструкцию.
     * @returns Массив строк для вывода в терминал.
     */
    public init(): string[] {
        return [
            '🐱 Режим фактов о котиках активен.',
            'Введите команду: <b>"мяу"</b>, чтобы получить случайный факт',            
            'Для выхода: <b>exit</b>',   
            'Получить список команд: <b>help</b>'         
        ];
    }

    /**
     * Выполняет команду или отправляет запрос на сервер.
     * @param inputData - Введённая пользователем строка.
     * @returns Массив строк с ответом.
     */
    public async execute(inputData: string): Promise<string[]> {
        if ((this.commands as readonly string[]).includes(inputData) && inputData !== 'мяу') {
            return this.routeCommands(inputData as ComandsType);
        } else if (inputData === 'мяу') {
            const response = await this.sendRequest({ command: inputData, mode: this.modeName });
            return [response.output];
        }
        
        return ['🐱 Мяу? Я понимаю только «мяу». \n Напишите "мяу", чтобы получить факт о котиках!'];
    }

    /**
     * Маршрутизирует команды внутри режима (help).
     * @param command - Команда (ожидается 'help').
     * @returns Массив строк с результатом.
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
}