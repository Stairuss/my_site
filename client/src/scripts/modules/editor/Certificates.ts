/**
 * Модуль вкладки "certificates".
 * Отображает список сертификатов, открывает модальное окно с увеличенным изображением и описанием.
 */


import '@style/blocks/_certificates.scss';

import { BaseModule } from '@scripts/modules/Base-module';
import { certificatesData } from '@data/certificates-data';
import { createCertificateWindow } from '@components/certificate-window';
import { CERTIFICATE_DIRECTIONS } from '@scripts/config';
import type { CertificateDirectionsType } from '@scripts/config';
import { ToggleOverlay } from '@scripts/utils';
import { CertificatesDirectionNotFoundError } from '@scripts/errors';


export class CertificatesModule extends BaseModule {
    /**
     * Обеспечивает логику работы вкладки "certificates".
     * 
     * Создаёт экземпляр модуля сертификатов.
     * Ищет элемент с id="certificates" и инициализирует модуль.
     */
    constructor() {
        super('certificates', true);

        this.init();
    }

    /** Привязывает обработчики событий на вкладке "certificates". */
    protected bindEvents(): void {
        this.attachCertificateListeners('.certificates__cert-button');
    }

    /**
     * Навешивает слушатели на кнопки сертификатов.
     * @param selector - CSS-селектор кнопок.
     */
    private attachCertificateListeners(selector: string): void {
        const buttons = Array.from(this.rootElement.querySelectorAll(selector))
            .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const certificateDirection = button.dataset.direction;
                if (!certificateDirection) {
                    throw new CertificatesDirectionNotFoundError();
                }

                const isValidDirection = Object.values(CERTIFICATE_DIRECTIONS).includes(
                    certificateDirection as CERTIFICATE_DIRECTIONS);
                if (!isValidDirection) {
                    throw new CertificatesDirectionNotFoundError(certificateDirection);
                }

                this.openCertificate('certificates__window', certificateDirection as CertificateDirectionsType);
            })
        })
    }

    /**
    * Навешивает слушатели на кнопку закрытия окна и оверлея.
    */
    private attachCertificateCloseListeners(): void {
        const closeWindow = (htmlEL: HTMLElement) => {
            htmlEL.addEventListener('click', () => {
                const certificateWindow = this.rootElement.querySelector('.certificates__window');
                certificateWindow?.remove();
                ToggleOverlay.closeOverlay();
            })
        }

        const button: HTMLButtonElement | null = this.rootElement.querySelector('.certificates__window-close');
        if (button) closeWindow(button);

        const overlay: HTMLDivElement | null = document.querySelector('.overlay');
        if (overlay) closeWindow(overlay);
    }

    /**
     * Открывает модальное окно для выбранного сертификата.
     * @param selector - CSS-класс для окна.
     * @param certificateDirection - Направление сертификата (ключ из CERTIFICATE_DIRECTIONS).
     */
    private openCertificate(selector: string, certificateDirection: CertificateDirectionsType): void {        
        const certificateData = certificatesData[certificateDirection];
        if (!certificateData) {
            throw new CertificatesDirectionNotFoundError(certificateDirection);
        }
        this.rootElement.append(createCertificateWindow(selector, certificateData));
        ToggleOverlay.openOverlay();
        this.attachCertificateCloseListeners();
    }
}

// Создание экземпляра при импорте модуля (для динамической загрузки)
new CertificatesModule();