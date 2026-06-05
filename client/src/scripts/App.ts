/**
 * Главный модуль приложения.
 * Главный класс, который управляет инициализацией всех модулей интерфейса
 * (шапка, сайдбар, проводник, вкладки, домашняя страница) и настройкой темы.
 */

import { HeaderModule } from '@modules/header/Header';
import { ProfileBarModule } from '@modules/sidebar/Profile-bar';
import { FilesModule } from '@modules/explorer/Files';
import { TabsBarModule } from '@modules/editor/Tabs-bar';
import { HomeModule } from '@modules/editor/Home';
import { ThemeManager } from '@scripts/utils';

export class App {
    /**
   * Главный класс приложения.
   * Инициализирует модули (шапка, сайдбар, проводник, вкладки, домашняя страница)
   * и устанавливает сохранённую тему.
   *
   * @property modules - Список классов модулей, которые будут инициализированы при старте.
   */

    private modules: Array<{ new(): any }> = [
        HeaderModule,
        ProfileBarModule,
        FilesModule,
        TabsBarModule,
        HomeModule,
    ];

    constructor() {
        this.initModules();
        this.installTheme();
    }

    /**
     * Инициализирует все модули из списка.
     * В случае ошибки в одном модуле логирует её и продолжает загрузку остальных.
     */
    private initModules(): void {
        //  Загрузка базовых модулей
        this.modules.forEach(ModuleClass => {
            try {
                new ModuleClass();
            } catch (error) {
                console.error(`Failed to initialize module ${ModuleClass.name}:`, error);
            }
        })
    }

    /**
     * Устанавливает сохранённую тему (из localStorage или тему по умолчанию).
     */
    private installTheme(): void {
        const theme = ThemeManager.getTheme();
        ThemeManager.setTheme(theme);
    }
}