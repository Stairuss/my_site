/**
 * Точка входа приложения.
 * Импортирует глобальные стили и инициализирует главный класс App
 * после загрузки DOM-дерева браузера.
 */


import '@style/index.scss';
import { App } from '@scripts/App';

document.addEventListener('DOMContentLoaded', () => {
    new App();
});