/**
 * Компонент модального окна для отображения сертификата.
 * Создаёт HTML-структуру: кнопка закрытия, картинка (picture с webp/jpg), заголовок и описание.
 */


import type { ICertificateData } from '@data/certificates-data';


/**
 * Главная функция создания окна сертификата.
 * @param parentClass - CSS-класс для элементов окна (обычно 'certificate-window').
 * @param data - Данные сертификата (изображения, заголовок, описание).
 * @returns HTMLDivElement - готовое окно.
 */
export const createCertificateWindow = (parentClass: string, data: ICertificateData): HTMLDivElement => {
    const certificateWindow = document.createElement('div');
    certificateWindow.classList.add(parentClass);

    certificateWindow.append(
        createCloseButton(parentClass),
        createContentWindow(parentClass, data),
    )

    return certificateWindow;
}

/**
 * Создаёт блок контента внутри окна сертификата.
 * @param parentClass - CSS-класс для элементов окна (обычно 'certificate-window').
 * @param data - Данные сертификата (изображения, заголовок, описание).
 * @returns HTMLDivElement - контейнер с содержимым (изображение и группа описания).
 */
const createContentWindow = (parentClass: string, data: ICertificateData): HTMLDivElement => {
    const contentWindow = document.createElement('div');
    contentWindow.classList.add(`${parentClass}-content`);

    contentWindow.append(
        createPicture(parentClass, data),
        createDescriptionGroup(parentClass, data),
    )

    return contentWindow;
}

const crossIconPath = new URL('@assets/sprite.svg#cross-icon', import.meta.url).href;
/**
 * Создаёт кнопку закрытия окна.
 * @param parentClass - Базовый класс для элемента (добавляется суффикс '-close').
 * @returns HTMLButtonElement.
 */
const createCloseButton = (parentClass: string): HTMLButtonElement => {
    const button = document.createElement('button');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    button.classList.add(`${parentClass}-close`);
    svg.classList.add(`${parentClass}-close-icon`);

    button.setAttribute('aria-label', 'Закрыть окно');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', crossIconPath);

    button.append(svg);
    svg.append(use);

    return button
}

/**
 * Создаёт элемент <picture> с WebP или JPG версиями сертификата.
 * @param parentClass - Базовый класс.
 * @param data - Данные сертификата.
 * @returns HTMLPictureElement.
 */
const createPicture = (parentClass: string, data: ICertificateData): HTMLPictureElement => {
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    const img = document.createElement('img');

    source.className = `${parentClass}-source`;
    img.className = `${parentClass}-img`;

    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', data.source);
    img.setAttribute('width', '650');
    img.setAttribute('height', '950');
    img.setAttribute('src', data.img.src);
    img.setAttribute('srcset', data.img.srcset);
    img.setAttribute('loading', 'lazy');
    img.setAttribute('alt', data.alt);

    picture.append(source, img);

    return picture;
}

/**
 * Создаёт группу с заголовком и списком описаний.
 * @param parentClass - Базовый класс.
 * @param data - Данные сертификата.
 * @returns HTMLDivElement.
 */
const createDescriptionGroup = (parentClass: string, data: ICertificateData): HTMLDivElement => {
    const div = document.createElement('div');
    const title = document.createElement('h4');

    div.classList.add(`${parentClass}-description-group`);
    title.classList.add(`${parentClass}-title`, 'title-content', 'title-content--small');

    title.textContent = data.title;

    div.append(title);
    data.description.forEach((desc) => div.append(createDescription(parentClass, desc)));

    return div;
}

/**
 * Создаёт параграф описания.
 * @param parentClass - Базовый класс.
 * @param text - Текст описания.
 * @returns HTMLParagraphElement.
 */
const createDescription = (parentClass: string, text: string): HTMLParagraphElement => {
    const p = document.createElement('p');
    p.classList.add(`${parentClass}-description`);
    p.innerHTML = text;

    return p;
}



