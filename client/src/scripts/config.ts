/**
 * Глобальные настройки клиента.
 */


// Базовый URL API-сервера
export const API_URL = '/api/';

// Список всех доступных вкладок редактора
export const TABS = [
    'home',
    'about-me',
    'certificates',
    'projects',
    'contacts',
    'themes',
    'terminal',
] as const;
export type TabsType = typeof TABS[number];

// Доступные цветовые темы (совпадает со списком на бэкенде)
export const THEMES = [
    'dracula',
    'nord',
    'rosely-light',
    'night-owl',
    'light-owl',
    'rapture',
    'shades-of-purple',
    'github-dark',
    'calamity',
    'ayu-dark',
    'ayu-mirage',
] as const;
export type ThemesType = typeof THEMES[number];
export const DEFAULT_THEME: ThemesType = 'dracula';

// Направления сертификатов
export enum CERTIFICATE_DIRECTIONS {
    LAYOUT = 'layout',
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    PYTHON_1 = 'python-1',
    PYTHON_2 = 'python-2',
    PYTHON_ADVANCED = 'python-advanced',
    DJANGO = 'django',
};
export type CertificateDirectionsType = `${CERTIFICATE_DIRECTIONS}`;

// Команды терминала и их описания
export const TERMINAL_COMMANDS = [
    'exit',
    'clear',
    'theme',
    'math',
    'ai',
    'cat',
    'ttt',
    'help',
] as const;
export type TerminalCommandsType = typeof TERMINAL_COMMANDS[number];

export const COMMAND_DESCRIPTIONS: Record<TerminalCommandsType, string> = {
    exit: 'Вернуться в начало',
    clear: 'Отчистить терминал',
    ai: 'Начать диалог с ИИ',
    theme: 'Сменить цветовую тему',
    math: 'Режим математики',
    cat: 'Получить факт о котиках',
    ttt: 'Игра "крестики-нолики"',
    help: 'Показать список доступных команд',
};

// Режимы работы терминала (для маршрутизации)
export enum TERMINAL_MODES {
    THEME = 'THEME',
    MATH = 'MATH',
    AI = 'AI',
    CAT = 'CAT',
    TTT = 'TTT'
};



