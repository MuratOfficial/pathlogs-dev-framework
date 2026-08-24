/**
 * Оглавление сайта — единственный источник для боковой навигации, поиска
 * и переходов «назад/вперёд» внизу страницы.
 *
 * Держать три копии одного списка — верный способ получить пункт, который
 * есть в меню, но не находится поиском.
 */

export interface NavItem {
  /** Путь без префикса /docs: "components/dialog". */
  slug: string;
  title: string;
  /** Одна строка для карточек, поиска и мета-описания страницы. */
  description: string;
  /** Дополнительные слова для поиска: английские имена, синонимы. */
  keywords?: string;
  /** Помечает то, что копируется через CLI, а не ставится пакетом. */
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "Начало",
    items: [
      {
        slug: "introduction",
        title: "Что это",
        description: "Зачем фреймворк, из чего состоит и почему раздаётся двумя способами.",
        keywords: "introduction обзор архитектура",
      },
      {
        slug: "installation",
        title: "Установка",
        description: "Пакеты, стили и скрипт темы — с нуля до первого компонента.",
        keywords: "installation setup npm подключение",
      },
      {
        slug: "theming",
        title: "Темы и токены",
        description: "CSS-переменные, светлая и тёмная темы, своя палитра.",
        keywords: "theming tokens css variables dark light цвета",
      },
      {
        slug: "cli",
        title: "CLI и реестр",
        description: "Как виджеты попадают в проект и почему они копируются, а не ставятся.",
        keywords: "cli registry add init виджеты",
      },
    ],
  },
  {
    title: "Хуки",
    items: [
      {
        slug: "hooks/use-drag-scroll",
        title: "useDragScroll",
        description: "Прокрутка протяжкой мыши с инерцией и растворением краёв.",
        keywords: "drag scroll протяжка инерция momentum",
      },
      {
        slug: "hooks/use-hotkeys",
        title: "useHotkeys",
        description: "Горячие клавиши с последовательностями и модификаторами.",
        keywords: "hotkeys keyboard shortcuts клавиши",
      },
      {
        slug: "hooks/use-event-stream",
        title: "useEventStream",
        description: "Подписка на серверный поток событий с паузой в скрытой вкладке.",
        keywords: "sse eventsource live поток",
      },
      {
        slug: "hooks/use-polling",
        title: "usePolling",
        description: "Периодический опрос с паузой в фоне и догоном при возврате.",
        keywords: "polling interval опрос",
      },
      {
        slug: "hooks/use-dismiss",
        title: "useDismiss",
        description: "Закрытие слоя по клику мимо и Escape — с оглядкой на диалоги.",
        keywords: "dismiss outside click escape закрытие",
      },
      {
        slug: "hooks/use-theme",
        title: "useTheme",
        description: "Текущая тема как внешнее состояние DOM, без мигания при загрузке.",
        keywords: "theme dark light тема",
      },
      {
        slug: "hooks/use-active-section",
        title: "useActiveSection",
        description: "Подсветка активного раздела длинной страницы при прокрутке.",
        keywords: "scrollspy section navigation разделы",
      },
    ],
  },
  {
    title: "Компоненты",
    items: [
      {
        slug: "components/dialog",
        title: "Dialog",
        description: "Модальное окно с ловушкой фокуса и блокировкой прокрутки.",
        keywords: "dialog modal окно",
      },
      {
        slug: "components/confirm-dialog",
        title: "ConfirmDialog",
        description: "Подтверждение действия вместо window.confirm.",
        keywords: "confirm подтверждение удаление",
      },
      {
        slug: "components/command-palette",
        title: "CommandPalette",
        description: "Палитра команд по ⌘K с локальными пунктами и серверным поиском.",
        keywords: "command palette cmdk поиск search",
      },
      {
        slug: "components/tooltip",
        title: "TooltipLayer",
        description: "Один тултип на всё приложение через атрибут data-tip.",
        keywords: "tooltip подсказка",
      },
      {
        slug: "components/menu",
        title: "Menu",
        description: "Складка для второстепенных действий с выпадающей панелью.",
        keywords: "menu dropdown меню",
      },
      {
        slug: "components/button",
        title: "Button",
        description: "Кнопка с вариантами, размерами и состоянием загрузки.",
        keywords: "button кнопка",
      },
      {
        slug: "components/field",
        title: "Field и поля",
        description: "Подпись, пояснение и ошибка, связанные с полем через aria.",
        keywords: "field input textarea select форма",
      },
      {
        slug: "components/markdown",
        title: "Markdown",
        description: "Ограниченная разметка без зависимостей и без сырого HTML.",
        keywords: "markdown разметка текст",
      },
      {
        slug: "components/editable-text",
        title: "EditableText",
        description: "Правка текста по клику прямо на месте.",
        keywords: "inline edit редактирование",
      },
      {
        slug: "components/mention-textarea",
        title: "MentionTextarea",
        description: "Поле ввода с автодополнением @упоминаний.",
        keywords: "mention упоминания textarea",
      },
      {
        slug: "components/avatar",
        title: "Avatar",
        description: "Аватар с инициалами и стопка с остатком.",
        keywords: "avatar инициалы участники",
      },
      {
        slug: "components/badge",
        title: "Badge и LevelMeter",
        description: "Метки в цвете и шкала уровня для порядковых величин.",
        keywords: "badge chip tag метка приоритет",
      },
      {
        slug: "components/app-shell",
        title: "AppShell",
        description: "Оболочка приложения с адаптивным сайдбаром.",
        keywords: "shell layout sidebar сайдбар",
      },
      {
        slug: "components/section-nav",
        title: "SectionNav",
        description: "Липкая навигация по разделам длинной страницы.",
        keywords: "section nav разделы навигация",
      },
      {
        slug: "components/hotkeys-help",
        title: "HotkeysHelp",
        description: "Экран справки, собранный из того же списка клавиш.",
        keywords: "hotkeys help справка",
      },
      {
        slug: "components/theme-toggle",
        title: "ThemeToggle",
        description: "Переключатель светлой и тёмной темы.",
        keywords: "theme toggle тема переключатель",
      },
      {
        slug: "components/live-indicator",
        title: "LiveIndicator",
        description: "Состояние живого соединения точкой и подписью.",
        keywords: "live indicator sse статус",
      },
      {
        slug: "components/query-input",
        title: "QueryInput",
        description: "Структурный поиск is:open author:me — чипы вместо текста, автодополнение.",
        keywords: "query search filter поиск фильтр синтаксис is author",
      },
      {
        slug: "components/slash-textarea",
        title: "SlashTextarea",
        description: "Меню команд по «/» прямо в поле ввода — как в Notion и Linear.",
        keywords: "slash command menu команды notion",
      },
      {
        slug: "components/tag-input",
        title: "TagInput",
        description: "Многозначный ввод: чипы вместо строки, разбор вставки из буфера.",
        keywords: "tag input chips метки теги вставка",
      },
      {
        slug: "components/time-range",
        title: "TimeRangePicker",
        description: "Интервал времени в синтаксисе now-15m — как в Grafana и Kibana.",
        keywords: "time range now grafana интервал время период",
      },
      {
        slug: "components/undo-toaster",
        title: "UndoToaster",
        description: "«Отменить» с тающим таймером вместо диалога подтверждения.",
        keywords: "undo toast отмена подтверждение",
      },
      {
        slug: "components/status-bar",
        title: "StatusBar",
        description: "Нижняя полоса как в редакторах кода: сегменты по приоритету.",
        keywords: "status bar статус полоса vscode сегменты",
      },
      {
        slug: "components/sparkline",
        title: "Sparkline",
        description: "Инлайновый тренд в SVG без chart-библиотеки — в строку и в бейдж.",
        keywords: "sparkline chart trend график тренд спарклайн",
      },
      {
        slug: "components/heatmap",
        title: "HeatmapCalendar",
        description: "Год активности сеткой недель, как график вкладов на GitHub.",
        keywords: "heatmap calendar activity github теплокарта календарь",
      },
      {
        slug: "components/activity-timeline",
        title: "ActivityTimeline",
        description: "Лента событий по дням со свёрткой серий однотипных.",
        keywords: "activity timeline feed лента события хронология",
      },
      {
        slug: "components/virtual-list",
        title: "VirtualList",
        description: "Оконный рендер длинного списка: в DOM живёт только видимое.",
        keywords: "virtual list windowing виртуализация список",
      },
      {
        slug: "components/misc",
        title: "Мелочи",
        description: "Portal, Backdrop, PageHint и DragScroll — по одному экрану на каждый.",
        keywords: "portal backdrop pagehint dragscroll",
      },
    ],
  },
  {
    title: "Виджеты",
    items: [
      {
        slug: "widgets/log-stream",
        title: "LogStream",
        description: "Виртуализированный вывод логов: ANSI, фильтры, follow-tail.",
        keywords: "log stream ansi логи вывод виртуализация",
        badge: "CLI",
      },
      {
        slug: "widgets/tree-view",
        title: "TreeView",
        description: "Дерево с клавиатурой, tri-state чекбоксами и переносом узлов.",
        keywords: "tree view дерево чекбокс перенос файлы",
        badge: "CLI",
      },
      {
        slug: "widgets/diff-view",
        title: "DiffView",
        description: "Дифф двух текстов: построчно и в две колонки, по словам.",
        keywords: "diff view дифф сравнение lcs",
        badge: "CLI",
      },
      {
        slug: "widgets/dep-graph",
        title: "DependencyGraph",
        description: "Слоистая раскладка графа зависимостей с разрывом циклов.",
        keywords: "dependency graph dag граф зависимости sugiyama",
        badge: "CLI",
      },
      {
        slug: "widgets/flow-canvas",
        title: "FlowCanvas",
        description: "Канва pan/zoom с узлами и связями — мини-react-flow.",
        keywords: "flow canvas pan zoom канва узлы react-flow",
        badge: "CLI",
      },
      {
        slug: "widgets/dashboard-grid",
        title: "DashboardGrid",
        description: "Плиточная сетка с перетаскиванием и ресайзом.",
        keywords: "dashboard grid layout сетка плитки дашборд",
        badge: "CLI",
      },
      {
        slug: "widgets/presence-layer",
        title: "PresenceLayer",
        description: "Курсоры соучастников поверх поверхности через поток событий.",
        keywords: "presence cursors multiplayer курсоры соучастники figma",
        badge: "CLI",
      },
      {
        slug: "widgets/kanban",
        title: "Kanban",
        description: "Доска с перетаскиванием карточек и колонок и WIP-лимитами.",
        keywords: "kanban board доска канбан",
        badge: "CLI",
      },
      {
        slug: "widgets/gantt",
        title: "Gantt",
        description: "Диаграмма Ганта с зависимостями и критическим путём.",
        keywords: "gantt диаграмма сроки",
        badge: "CLI",
      },
      {
        slug: "widgets/filter-bar",
        title: "FilterBar",
        description: "Панель фильтров, собираемая из описания полей.",
        keywords: "filter фильтр поиск",
        badge: "CLI",
      },
    ],
  },
];

/** Плоский список всех страниц в порядке навигации. */
export const ALL_ITEMS: NavItem[] = NAV.flatMap((group) => group.items);

export function findItem(slug: string): NavItem | undefined {
  return ALL_ITEMS.find((item) => item.slug === slug);
}

/** Соседи страницы — для переходов внизу. Работает и через границы групп. */
export function neighbours(slug: string): { prev?: NavItem; next?: NavItem } {
  const at = ALL_ITEMS.findIndex((item) => item.slug === slug);
  if (at === -1) return {};
  return {
    ...(at > 0 ? { prev: ALL_ITEMS[at - 1] } : {}),
    ...(at < ALL_ITEMS.length - 1 ? { next: ALL_ITEMS[at + 1] } : {}),
  };
}

/** В какой группе лежит страница — показывается над заголовком. */
export function groupOf(slug: string): string | undefined {
  return NAV.find((group) => group.items.some((item) => item.slug === slug))?.title;
}
