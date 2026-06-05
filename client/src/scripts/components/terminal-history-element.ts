/**
 * Компонент для создания DOM-элементов истории терминала.
 * Формирует строку с приглашением (режим, пользователь) и текстом команды/вывода.
 */


/**
 * Главная функция создания строки истории для терминала.
 * @param text - Текст команды или вывода (может содержать HTML).
 * @param promptMode - Текст режима (например, "[MATH]") – если указан, добавляется слева.
 * @param promptUser - Приглашение пользователя (например, "stairus@stairus:~$") – добавляется после режима.
 * @returns HTMLParagraphElement – готовый элемент для вставки в контейнер истории.
 */
export const createHistoryElement = (text: string, promptMode: string | null = null, promptUser: string | null = null): HTMLParagraphElement => {
    const parentClass = 'terminal__content-history';
    const historyElement = document.createElement('p');
    const spanText = createText(parentClass, text);

    if (promptMode) {
        const spanPromptMode = createPromptMode(parentClass, promptMode);
        historyElement.append(spanPromptMode);
    }

    if (promptUser) {
        const spanPromptUser = createPromptUser(parentClass, promptUser);
        historyElement.append(spanPromptUser);
    }

    historyElement.classList.add('terminal__content-history');
    historyElement.append(spanText);

    return historyElement;
}

/**
 * Создаёт span с классом для отображения режима терминала.
 * @param parentClass - Базовый класс (добавляется суффикс '-mode').
 * @param mode - Текст режима.
 * @returns HTMLSpanElement.
 */
const createPromptMode = (parentClass: string, mode: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.classList.add(`${parentClass}-mode`);
    span.textContent = mode;

    return span;
}

/**
 * Создаёт span с классом для отображения приглашения пользователя.
 * @param parentClass - Базовый класс (добавляется суффикс '-prompt').
 * @param promptUser - Текст приглашения.
 * @returns HTMLSpanElement.
 */
const createPromptUser = (parentClass: string, promptUser: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.classList.add(`${parentClass}-prompt`);
    span.textContent = promptUser;

    return span;
}

/**
 * Создаёт span с классом для текста команды/вывода (поддерживает HTML).
 * @param parentClass - Базовый класс (добавляется суффикс '-text').
 * @param text - Текст (может содержать HTML-теги).
 * @returns HTMLSpanElement.
 */
const createText = (parentClass: string, text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.classList.add(`${parentClass}-text`);
    span.innerHTML = text;

    return span;
}