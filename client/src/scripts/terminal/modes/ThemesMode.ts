/**
 * Режим терминала для переключения цветовых тем сайта.
 * Позволяет просмотреть список тем и выбрать тему по номеру.
 */


import { BaseMode } from '@scripts/terminal/modes/BaseMode';
import { THEMES, TERMINAL_MODES } from "@scripts/config";
import type { ThemesType } from "@scripts/config";
import { ThemeManager, isNumeric, getElement } from '@scripts/utils';


type ComandsType = 'list' | 'exit' | 'clear' | 'help' ;

export class ThemesMode extends BaseMode<ComandsType> {
    /**
     * Режим управления цветовыми темами.
     * Отображает доступные темы, позволяет выбрать тему по номеру и применяет её на всей странице.
     *
     * @property modeName - Название режима (TERMINAL_MODES.THEME).
     * @property commands - Список команд: list + базовые.
     * @property commandDescriptions - Описания команд.
     * @property themeColors - Объект с цветами для предпросмотра названий тем.
     * @property themeList - Сгенерированный список тем с цветными названиями.
     */
    protected readonly modeName: TERMINAL_MODES = TERMINAL_MODES.THEME;
    protected readonly commands: ComandsType[] = [
        'list',
        ...BaseMode.baseCommands,
    ];
    protected commandDescriptions: Record<ComandsType, string> = {
        'list': 'Вывести список цветовых тем',
        ...BaseMode.baseDescriptions,
    }
    private readonly themeColors: Record<ThemesType, string> = {
        'dracula': '#94527e',
        'nord': '#88c0d0',
        'rosely-light': '#b565a7',
        'night-owl': '#d6deeb',
        'light-owl': '#403f53',
        'rapture': '#6cefc4',
        'shades-of-purple': '#fad000',
        'github-dark': '#f9826c',
        'calamity': '#bc5c7d',
        'ayu-dark': '#e6b450',
        'ayu-mirage': '#ffcc66',
    }
    private themeList: string[] = [];

    constructor() {
        super();
        this.themeList = this.generateThemesList();
    }

    /**
     * Инициализация режима: выводит приветствие и список доступных тем.
     * @returns Массив строк для вывода в терминал.
     */
    public init(): string[] {
        return [
            '🎨 Режим выбора цветовых тем активен.',
            'Введите номер темы из списка ниже.',
            'Для выхода: <b>exit</b>',  
            'Помощь: <b>help</b>',          
            ...this.themeList
        ];
    }

    /**
     * Выполняет команду: обрабатывает ввод номера темы или команды list/help.
     * @param inputData - Введённая строка (номер или команда).
     * @returns Массив строк с результатом.
     */
    public async execute(inputData: string): Promise<string[]> {
        if ((this.commands as readonly string[]).includes(inputData)) {
            return this.routeCommands(inputData as ComandsType);
        }

        const themeNumber = Number(inputData) - 1;        
        if (!isNumeric(inputData) || themeNumber > THEMES.length - 1 || themeNumber < 0) {
            return [
                'Неверный номер темы, попробуйте еще раз',
            ]
        }
        
        const theme = THEMES[themeNumber];
        this.switchTheme(theme);

        return [`Тема ${theme} применена!`];
    }

    /**
     * Генерирует список тем с цветным оформлением названий.
     * @returns Массив строк вида "1. <span style="color: ...">dracula</span>".
     */
    private generateThemesList(): string[] {        
        const themeColors: string[] = [];
        let i = 1;
        for (let [theme, color] of Object.entries(this.themeColors)) {
            themeColors.push(`${i}. <span style="color: ${color}">${theme}</span>`);
            i += 1;
        }

        return themeColors;
    }   

    /**
     * Маршрутизирует команды внутри режима (list, help).
     * @param command - Команда.
     * @returns Массив строк.
     */
    protected routeCommands(command: ComandsType): string[] {        
        let result: string[] = [];        
        switch (command) {
            case 'list':
                result = this.themeList;
                break;
            case 'help':
                result = this.helpCommand();
                break;
        }

        return result
    }

    /**
     * Применяет выбранную тему: обновляет страницу и синхронизирует активную кнопку на вкладке Themes.
     * @param theme - Имя темы.
     */
    private switchTheme(theme: ThemesType):void {
        const old_button: HTMLButtonElement | null = document.querySelector('.themes__button--is-active');
        if (old_button) {
            old_button.classList.remove('themes__button--is-active');
            old_button.textContent = 'Применить';
        }        
        ThemeManager.setTheme(theme);        
        const new_button = <HTMLButtonElement>getElement(document, `[data-theme-button="${ThemeManager.getTheme()}"]`);
        new_button.classList.add('themes__button--is-active');
        new_button.textContent = 'Активна';
    }
}
