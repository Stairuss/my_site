/**
 * Базовый абстрактный класс для всех режимов терминала TERMINAL_MODES.
 * Предоставляет общие методы: отправка запросов на сервер, команды help/exit/clear,
 * маршрутизацию команд.
 */


import { COMMAND_DESCRIPTIONS, TERMINAL_MODES, API_URL } from "@scripts/config";
import { type TerminalCommandsType } from '@scripts/config';
import type { IRequestMode, IResponse } from '@scripts/api';
import { HeaderManager } from '@scripts/utils';


export abstract class BaseMode<TCommand extends string = string> {
    /**
     * Базовый абстрактный класс для всех режимов терминала.
     * Предоставляет общие методы: отправка запросов на сервер, обработка команд help, exit, clear,
     * а также определяет интерфейс для инициализации, выполнения команд и маршрутизации.
     *
     * @property baseCommands - Базовые команды, доступные во всех режимах (exit, clear, help).
     * @property baseDescriptions - Описания базовых команд.
     * @property modeUrl - URL для отправки запросов к API терминала.
     * @property modeName - Название режима (MATH, AI, CAT, TTT, THEME).
     * @property commands - Список специфических команд для данного режима (без базовых).
     * @property commandDescriptions - Описания специфических команд.
     */
    protected static baseCommands = ['exit', 'clear', 'help'] as const satisfies readonly TerminalCommandsType[];
    protected static baseDescriptions: Record<typeof BaseMode.baseCommands[number], string> = {
        exit: COMMAND_DESCRIPTIONS.exit,
        clear: COMMAND_DESCRIPTIONS.clear,
        help: COMMAND_DESCRIPTIONS.help,
    };
    protected readonly modeUrl: string = `${API_URL}terminal/execute`;
    protected abstract readonly modeName: TERMINAL_MODES;
    protected abstract commands: readonly TCommand[];
    protected abstract commandDescriptions: Record<TCommand, string>;

    /**
     * Активация режима: возвращает массив строк приветствия/подсказок.
     * @returns Массив строк для вывода в терминал при входе в режим.
     */
    public abstract init(): string[];

    /**
     * Обрабатывает введённую пользователем команду и возвращает результат.
     * @param inputData - Введённая строка (команда или данные).
     * @returns Массив строк для вывода в терминал.
     */
    public abstract execute(inputData: string): Promise<string[]>;

    /**
     * Маршрутизирует команду внутри режима (не включает базовые команды baseCommands).
     * @param command - Команда (без базовых).
     * @returns Массив строк для вывода.
     */
    protected abstract routeCommands(command: TCommand): string[];

    /**
     * Отправляет запрос на сервер для выполнения команды в данном режиме.
     * @param data - Данные запроса (команда и режим).
     * @returns Ответ сервера, преобразованный в IResponse.
     */
    protected async sendRequest(data: IRequestMode): Promise<IResponse> {
        const response: IResponse = await fetch(this.modeUrl, {
            method: 'POST',
            headers: HeaderManager.buildHeaders(),
            body: JSON.stringify(data),
        })
            .then(async (res) => {
                HeaderManager.saveSessionId(res);
                const response: IResponse = await res.json();
                if (!response.success) {
                    return { success: false, output: `${response.errorType}: ${response.output}` };
                }
                return response
            })
            .catch(() => {
                return { success: false, output: 'Что-то пошло не так. Введите: <b>exit</b> для выхода.' };
            })

        return response;
    }

    /**
     * Обработчик команды help: возвращает список доступных специфических команд текущего режима с описаниями.
     * @returns Массив строк с форматированным списком команд.
     */
    protected helpCommand(): string[] {
        const result: string[] = [];
        result.push('--------------------------');
        Object.entries(this.commandDescriptions)
            .forEach(([command, description]) => {
                result.push(`<b>${command}:</b> ${description}`);
            });
        result.push('--------------------------');

        return result;
    }
}