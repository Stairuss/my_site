/**
 * Модуль вкладки "contacts" (форма обратной связи).
 * Валидация полей (имя, email, сообщение), отправка на сервер,
 * отображение состояний отправки (ожидание, успех, ошибка).
 */


import '@style/blocks/_contacts.scss';
import { BaseModule } from '@scripts/modules/Base-module';
import { getElement, HeaderManager } from '@scripts/utils';
import type { IRequestContacts, IResponse } from '@scripts/api';
import { API_URL } from "@scripts/config";


const crossIconPath = new URL('@assets/sprite.svg#cross-icon', import.meta.url).href;
const checkMarkIconPath = new URL('@assets/sprite.svg#check-mark-icon', import.meta.url).href;

export class ContactsModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "contacts" .     
     * Обрабатывает отправку формы, валидирует данные и показывает ошибки.
     *
     * @property contactsUrl - URL для отправки данных формы.
     * @property form - DOM-элемент формы.
     * @property nameField - Поле ввода имени.
     * @property nameError - Элемент для вывода ошибки имени.
     * @property emailField - Поле ввода email.
     * @property emailError - Элемент для вывода ошибки email.
     * @property messageField - Поле ввода сообщения.
     * @property messageError - Элемент для вывода ошибки сообщения.
     * @property errorClass - CSS-класс для подсветки поля с ошибкой.
     * @property pendingStartTime - Время (timestamp) начала отправки формы, используется для минимальной задержки отображения спиннера (2 секунды).
     */
    private readonly contactsUrl: string = `${API_URL}contacts`;
    private readonly form: HTMLFormElement;
    private readonly nameField: HTMLInputElement;
    private readonly nameError: HTMLParagraphElement;
    private readonly emailField: HTMLInputElement;
    private readonly emailError: HTMLParagraphElement;
    private readonly messageField: HTMLTextAreaElement;
    private readonly messageError: HTMLParagraphElement;
    private readonly errorClass = 'contacts__input--is-error';
    private pendingStartTime: number | null = null;

    /**
     * Создаёт экземпляр модуля контактов.
     * Находит все необходимые DOM-элементы и инициализирует модуль.
     * @throws {HtmlElementNotFoundError} Если какой-либо элемент не найден.
     */
    constructor() {
        super('contacts', true);
        this.form = <HTMLFormElement>getElement(this.rootElement, '.contacts__form');
        this.nameField = <HTMLInputElement>getElement(document, 'contacts-name');
        this.nameError = <HTMLParagraphElement>getElement(document, 'contacts-name-error');
        this.emailField = <HTMLInputElement>getElement(document, 'contacts-email');
        this.emailError = <HTMLParagraphElement>getElement(document, 'contacts-email-error');
        this.messageField = <HTMLTextAreaElement>getElement(document, 'contacts-message');
        this.messageError = <HTMLParagraphElement>getElement(document, 'contacts-message-error');

        this.init();
    }

    /** Привязывает обработчики событий на вкладке "contacts". */
    protected bindEvents(): void {
        this.submitForm();
        this.attachFieldsListeners();
    }

    /** Обработка отправки формы: валидация, отправка fetch, обработка ответа. */
    private submitForm() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            const resultValidation = [
                this.nameValidation(),
                this.emailValidation(),
                this.messageValidation()
            ];

            const isValid = resultValidation.every((res) => res);
            if (!isValid) return;

            const formData = new FormData(this.form)
            const data: IRequestContacts = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                message: formData.get('message') as string,
            }

            this.formStateSwitch('pending');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            fetch(this.contactsUrl, {
                method: 'POST',
                headers: HeaderManager.buildHeaders(),
                body: JSON.stringify(data),
                signal: controller.signal,
            })
                .then((res) => {
                    clearTimeout(timeoutId);
                    HeaderManager.saveSessionId(res);
                    return res.json()
                })
                .then((data: IResponse) => {
                    if (data.success) {
                        this.formStateSwitch('success');
                    } else {
                        data.output ? this.formStateSwitch('error', data.output) : this.formStateSwitch('error');
                    }
                })
                .catch((err: Error) => {
                    clearTimeout(timeoutId);
                    if (err.name === 'AbortError') {
                        this.formStateSwitch('error', 'Время ожидания ответа истекло.');
                    } else {
                        this.formStateSwitch('error');
                    }
                })
        })
    }

    /** Навешивает слушатели input на поля, чтобы убирать ошибки по мере исправления. */
    private attachFieldsListeners() {
        this.nameField.addEventListener('input', () => {
            if (!this.nameField.classList.contains(this.errorClass) || !this.nameValidation()) return;

            this.nameField.classList.remove(this.errorClass);
            this.nameError.textContent = '';

        });

        this.emailField.addEventListener('input', () => {
            if (!this.emailField.classList.contains(this.errorClass) || !this.emailValidation()) return;

            this.emailField.classList.remove(this.errorClass);
            this.emailError.textContent = '';

        });

        this.messageField.addEventListener('input', () => {
            if (!this.messageField.classList.contains(this.errorClass) || !this.messageValidation()) return;

            this.messageField.classList.remove(this.errorClass);
            this.messageError.textContent = '';

        });
    }

    /**
    * Переключает состояние формы обратной связи.
    * 
    * - `'pending'` – показывает спиннер (загрузка) и запоминает время начала.
    * - `'success'` / `'error'` – откладывает отображение результата, чтобы спиннер был виден **минимум 1 секунду**.
    *   Если ответ пришёл раньше, результат появится через оставшееся время; если позже – сразу.    * 
    * 
    * После отображения результата (успех/ошибка) он автоматически скрывается через 7 секунд.
    * 
    * @param state - Состояние: `'pending'`, `'success'`, `'error'` или `'none'`.
    * @param errorMessage - Текст ошибки (обязателен для `state === 'error'`, иначе подставляется стандартное сообщение).
    */
    private formStateSwitch(state: 'pending' | 'success' | 'error', errorMessage: string | null = null): void {
        const pendingClass = 'contacts__form--is-pending';
        const successClass = 'contacts__form--is-success';
        const errorClass = 'contacts__form--is-error';

        const feedbackMessage = <HTMLParagraphElement>getElement(this.form, '.contacts__feedback-message');
        const feedbackIcon = <HTMLSpanElement>getElement(this.form, '.contacts__feedback-icon');

        const removeState = (): void => {
            this.form.classList.remove(pendingClass, successClass, errorClass);
            feedbackMessage.textContent = '';
            feedbackIcon.innerHTML = '';
            this.pendingStartTime = null;
        };

        if (state === 'pending') {
            // Очищаем предыдущие состояния
            removeState();
            this.pendingStartTime = Date.now();
            feedbackMessage.textContent = 'Отправляю';
            this.form.classList.add(pendingClass);
            return;
        }

        // success или error – показываем результат с задержкой
        const applyFinalState = () => {
            this.form.classList.remove(pendingClass);
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            svg.setAttribute('width', '15');
            svg.setAttribute('height', '15');
            svg.setAttribute('aria-hidden', 'true');
            svg.append(use);
            feedbackIcon.innerHTML = '';
            feedbackIcon.append(svg);

            if (state === 'success') {
                use.setAttribute('href', checkMarkIconPath);
                feedbackMessage.textContent = 'Успех!';
                this.form.classList.add(successClass);
                this.nameField.value = '';
                this.emailField.value = '';
                this.messageField.value = '';
            } else {
                use.setAttribute('href', crossIconPath);
                feedbackMessage.textContent = errorMessage ? errorMessage : 'Что-то пошло не так :(';
                this.form.classList.add(errorClass);
            }

            // Скрыть сообщение через 7 секунд после его появления
            setTimeout(() => removeState(), 7000);
        };

        if (this.pendingStartTime !== null) {
            const elapsed = Date.now() - this.pendingStartTime;
            const remaining = 1000 - elapsed;
            if (remaining > 0) {
                setTimeout(applyFinalState, remaining);
            } else {
                applyFinalState();
            }
        } else {
            applyFinalState();
        }
    }

    /**
     * Утилита: добавляет css класс ошибки и текст ошибки для поля.
     * @returns false (всегда), чтобы можно было использовать в валидаторах как return this.createError(...).
     */
    private createError(inputField: HTMLInputElement | HTMLTextAreaElement, errorField: HTMLParagraphElement, errorMessage: string): false {
        inputField.classList.add(this.errorClass);
        errorField.textContent = errorMessage;

        return false;
    }

    /**
    * Валидация имени: длина 2–50 символов, только буквы и пробелы, нормализация.
    * 
    * @returns `true`, если имя валидно; `false`, если не валидно (вызывает `this.createError()` с сообщением об ошибке).
    */
    private nameValidation(): boolean {
        const value = this.nameField.value.trim();
        if (value.length < 2 || value.length > 50) {
            return this.createError(this.nameField, this.nameError, 'Имя: 2–50 символов.');
        }
        if (/[^a-zа-яё\s]/i.test(value)) {
            return this.createError(this.nameField, this.nameError, 'Только буквы (кириллица/латиница) и пробелы.');
        }
        const normalized = value.replace(/\s{2,}/g, ' ').trim();
        if (!/^([a-zа-яё]{2,}\s?)+$/i.test(normalized)) {
            return this.createError(this.nameField, this.nameError, 'Неккоректный формат имени.');
        }
        this.nameField.value = normalized;

        return true;
    }

    /**
     * Валидация email: длина 5–100 символов, корректный формат.
     * @returns true, если email валиден; `false`, если не валиден (вызывает `this.createError()` с сообщением об ошибке).
     */
    private emailValidation(): boolean {
        const value = this.emailField.value.trim();
        if (value.length < 5 || value.length > 100) {
            return this.createError(this.emailField, this.emailError, 'Email: 5–100 символов.');
        }
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/i.test(value)) {
            return this.createError(this.emailField, this.emailError, 'Некорректный формат email.');
        }

        this.emailField.value = value;
        return true;
    }

    /**
     * Валидация сообщения: длина 10–1000 символов.
     * @returns true, если сообщение валидно; `false`, если не валидно (вызывает `this.createError()` с сообщением об ошибке).
     */
    private messageValidation(): boolean {
        const message = this.messageField.value.trim();
        if (message.length < 10 || message.length > 1000) {
            return this.createError(this.messageField, this.messageError, 'Сообщение: 10–1000 символов.');
        }
        this.messageField.value = message;

        return true;
    }

}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new ContactsModule();

