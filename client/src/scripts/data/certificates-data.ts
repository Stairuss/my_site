/**
 * Данные сертификатов: изображения (jpg/webp, retina) и описания.
 */


import { CERTIFICATE_DIRECTIONS } from '@scripts/config';
import type { CertificateDirectionsType } from '@scripts/config';


/**
 * Пути к изображениям сертификата в разных форматах и разрешениях.
 */
interface ICertificateImages {
    jpg1x: string;   // JPG 1x
    jpg2x: string;   // JPG 2x (retina)
    webp1x: string;  // WebP 1x
    webp2x: string;  // WebP 2x (retina)
}

// Объект с путями к изображениям для каждого направления
const certificateImages: Record<CertificateDirectionsType, ICertificateImages> = {
    [CERTIFICATE_DIRECTIONS.LAYOUT]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-веб-верстка.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-веб-верстка@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-веб-верстка.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-веб-верстка@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.JAVASCRIPT]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-JavaScript.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-JavaScript@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-JavaScript.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-JavaScript@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.TYPESCRIPT]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-TypeScript.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-TypeScript@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-TypeScript.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-TypeScript@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_1]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-основы-Python-часть-1.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-основы-Python-часть-1@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-основы-Python-часть-1.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-основы-Python-часть-1@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_2]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-основы-Python-часть-2.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-основы-Python-часть-2@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-основы-Python-часть-2.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-основы-Python-часть-2@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_ADVANCED]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-Python-Advanced.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-Python-Advanced@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-Python-Advanced.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-Python-Advanced@2x.webp', import.meta.url).href
    },
    [CERTIFICATE_DIRECTIONS.DJANGO]: {
        jpg1x: new URL('@assets/images/certificates/jpg/1x/Сертификат-Django.jpg', import.meta.url).href,
        jpg2x: new URL('@assets/images/certificates/jpg/2x/Сертификат-Django@2x.jpg', import.meta.url).href,
        webp1x: new URL('@assets/images/certificates/webp/1x/Сертификат-Django.webp', import.meta.url).href,
        webp2x: new URL('@assets/images/certificates/webp/2x/Сертификат-Django@2x.webp', import.meta.url).href
    },
}

/**
 * Полные данные сертификата для отображения.
 */
export interface ICertificateData {
    title: string;               // Заголовок
    source: string;              // srcset для picture/source (webp)
    img: {
        src: string;             // обычное jpg
        srcset: string;          // retina jpg
    };
    alt: string;                 // alt текст
    description: string[];       // описание
}

/**
 * Словарь данных сертификатов по ключам направлений.
 */
export const certificatesData: Record<CertificateDirectionsType, ICertificateData> = {
    [CERTIFICATE_DIRECTIONS.LAYOUT]: {
        title: 'Веб верстка',
        source: `${certificateImages.layout.webp1x}, ${certificateImages.layout.webp2x}`,
        img: {
            src: `${certificateImages.layout.jpg1x}`,
            srcset: `${certificateImages.layout.jpg2x}`,
        },
        alt: 'Сертификат по веб-верстке',
        description: [
            '<b>HTML5</b>: семантическая разметка, доступность.',
            '<b>CSS3/SCSS</b>: препроцессоры, методология БЭМ, переменные, миксины, вложенность.',
            '<b>Адаптивная и резиновая вёрстка</b>: Flexbox, Grid, медиа-запросы, retina-графика, desktop-first.',
            '<b>Оптимизация</b>: ускорение загрузки (Lighthouse), сжатие изображений, минификация кода.',
            '<b>Кроссбраузерность</b>: поддержка разных браузеров, использование вендорных префиксов.',
            '<b>Вёрстка по макетам</b>: Figma, Pixso, PixelPerfect, точное соответствие дизайну.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.JAVASCRIPT]: {
        title: 'JavaScript',
        source: `${certificateImages.javascript.webp1x}, ${certificateImages.javascript.webp2x}`,
        img: {
            src: `${certificateImages.javascript.jpg1x}`,
            srcset: `${certificateImages.javascript.jpg2x}`,
        },
        alt: 'Сертификат по JavaScript',
        description: [
            '<b>Основы языка</b>: переменные, типы данных, условные операторы, циклы, функции.',
            '<b>Работа с DOM</b>: манипуляция элементами, обработка событий, работа с формами.',
            '<b>Объекты и массивы</b>: методы итерации, деструктуризация, spread/rest, встроенные функции.',
            '<b>Хранилище данных</b>: localStorage, sessionStorage, cookies.',
            '<b>Асинхронность</b>: Event Loop, промисы, async/await, работа с сервером (fetch, API).',
            '<b>Модули и классы</b>: ES6+ модули, ООП (классы, наследование).',
            '<b>Обработка ошибок</b>: try/catch, кастомные исключения.',
            '<b>Инструменты</b>: использование сторонних библиотек, отладка.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.TYPESCRIPT]: {
        title: 'TypeScript',
        source: `${certificateImages.typescript.webp1x}, ${certificateImages.typescript.webp2x}`,
        img: {
            src: certificateImages.typescript.jpg1x,
            srcset: certificateImages.typescript.jpg2x,
        },
        alt: 'Сертификат по TypeScript',
        description: [
            '<b>Основы TypeScript</b>: типы, интерфейсы, утилитарные типы.',
            '<b>Классы ООП</b> и наследование в TypeScript.',
            '<b>Дженерики (Generics)</b> – создание переиспользуемых компонентов.',
            '<b>Строгая типизация</b> кода и проверка ошибок на этапе компиляции.',
            '<b>Сборка проектов</b>: Vite, настройка tsconfig.json.',
            '<b>Работа с Node.js и npm</b> в TypeScript-проектах.',
            '<b>Основы тестирования</b> TypeScript-кода.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_1]: {
        title: 'Основы Python 1/2',
        source: `${certificateImages['python-1'].webp1x}, ${certificateImages['python-1'].webp2x}`,
        img: {
            src: `${certificateImages['python-1'].jpg1x}`,
            srcset: `${certificateImages['python-1'].jpg2x}`,
        },
        alt: 'Основы Python часть 1',
        description: [
            '<b>Основы Python</b>: переменные, типы данных (int, float, str).',
            '<b>Условные операторы</b>: if-elif-else, ветвления.',
            '<b>Циклы</b>: while, for (со счётчиком, вложенные, работа со строками).',
            '<b>Функции</b>: параметры, возвращаемые значения.',
            '<b>Числа с плавающей точкой</b> (float) и операции.',
            '<b>Выражения и операторы</b>, приоритет выполнения.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_2]: {
        title: 'Основы Python 2/2',
        source: `${certificateImages['python-2'].webp1x}, ${certificateImages['python-2'].webp2x}`,
        img: {
            src: `${certificateImages['python-2'].jpg1x}`,
            srcset: `${certificateImages['python-2'].webp2x}`,
        },
        alt: 'Основы Python часть 2',
        description: [
            '<b>Коллекции</b>: списки, словари, множества, кортежи; методы работы с ними.',
            '<b>List comprehensions</b> и работа с данными.',
            '<b>Функции</b>: рекурсия, lambda, декораторы (базовый и продвинутый уровни).',
            '<b>Работа с файлами</b>: чтение, запись, обработка исключений (try/except).',
            '<b>Основы ООП</b>: классы, наследование, инкапсуляция, полиморфизм.',
            '<b>Итераторы и генераторы</b>, создание собственных итераторов.',
            '<b>Модули и библиотеки</b>: импорт, установка, использование (в т.ч. для работы с данными).',
            '<b>Создание Telegram-ботов</b>: основы, API, обработка сообщений.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.PYTHON_ADVANCED]: {
        title: 'Python Advanced',
        source: `${certificateImages['python-advanced'].webp1x}, ${certificateImages['python-advanced'].webp2x}`,
        img: {
            src: `${certificateImages['python-advanced'].jpg1x}`,
            srcset: `${certificateImages['python-advanced'].jpg2x}`,
        },
        alt: 'Сертификат по Python Advanced',
        description: [
            '<b>Веб-фреймворки</b>: Flask (MVC, шаблоны), FastAPI (асинхронность, документация).',
            '<b>Базы данных</b>: PostgreSQL, SQLAlchemy ORM (модели, отношения, миграции).',
            '<b>Асинхронность и многозадачность</b>: multiprocessing, threading, asyncio, FastAPI.',
            '<b>Контейнеризация и деплой</b>: Docker, деплой на Linux, CI/CD (основы культуры CI, автоматический деплой).',
            '<b>Системы контроля версий</b>: Git (репозитории, ветки, merge requests).',
            '<b>Безопасность</b>, логирование (logger), обработка ошибок.',
            '<b>Тестирование</b>: Pytest, Mock, линтеры.',
            '<b>Документация API</b>: стандарты, инструменты (Swagger/OpenAPI).',
            '<b>Очереди задач</b>, основы дебаггинга и профилирования.'
        ]
    },
    [CERTIFICATE_DIRECTIONS.DJANGO]: {
        title: 'Django',
        source: `${certificateImages.django.webp1x}, ${certificateImages.django.webp2x}`,
        img: {
            src: `${certificateImages.django.jpg1x}`,
            srcset: `${certificateImages.django.jpg2x}`,
        },
        alt: 'Сертификат по Django',
        description: [
            '<b>Модели и базы данных</b>: проектирование моделей, связи, миграции.',
            '<b>Административный интерфейс</b>: настройка админки, кастомизация.',
            '<b>Обработка запросов</b>: Class-Based Views, функции-обработчики, middleware.',
            '<b>Формы и валидация</b>: создание форм, обработка данных, валидация.',
            '<b>Аутентификация и авторизация</b>: пользователи, права доступа, регистрация.',
            '<b>Django REST Framework (DRF)</b>: создание REST API, сериализаторы, документация.',
            '<b>Тестирование</b>: написание тестов, Mock, покрытие.',
            '<b>Работа с файлами</b>: загрузка, обработка, хранение.',
            '<b>Локализация и интернационализация</b>: перевод интерфейса, поддержка языков.',
            '<b>Оптимизация</b>: кэширование, эффективная работа с БД, профилирование, логирование.',
            '<b>Экспорт/импорт данных</b>, работа с фикстурами.',
            '<b>Деплой и командная разработка</b>: развертывание на Linux, Git, CI/CD основы.'
        ]
    },
}


