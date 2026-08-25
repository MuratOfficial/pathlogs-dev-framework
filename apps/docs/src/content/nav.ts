/**
 * Оглавление сайта — единственный источник для боковой навигации, поиска
 * и переходов «назад/вперёд» внизу страницы.
 *
 * Держать три копии одного списка — верный способ получить пункт, который
 * есть в меню, но не находится поиском.
 *
 * Заголовки и описания хранятся сразу на всех языках. Имена компонентов
 * (`Dialog`, `Menu`) не переводятся, но и они обёрнуты в `same()`: тип
 * требует полного набора языков, поэтому добавление третьего сломает
 * сборку, а не оставит молчаливые дыры.
 */

import { same, type Lang, type Localized } from "./locale";

export interface NavItem {
  /** Путь без префикса языка и раздела: "components/dialog". */
  slug: string;
  title: Localized;
  /** Одна строка для карточек, поиска и мета-описания страницы. */
  description: Localized;
  /** Дополнительные слова для поиска: синонимы, иноязычные имена. */
  keywords?: Localized;
  /** Помечает то, что копируется через CLI, а не ставится пакетом. */
  badge?: string;
}

export interface NavGroup {
  title: Localized;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: { en: "Getting started", ru: "Начало" },
    items: [
      {
        slug: "introduction",
        title: { en: "What is this", ru: "Что это" },
        description: {
          en: "Why the framework exists, what it is made of, and why it ships two different ways.",
          ru: "Зачем фреймворк, из чего состоит и почему раздаётся двумя способами.",
        },
        keywords: {
          en: "introduction overview architecture about",
          ru: "introduction обзор архитектура",
        },
      },
      {
        slug: "installation",
        title: { en: "Installation", ru: "Установка" },
        description: {
          en: "Packages, styles and the theme script — from nothing to your first component.",
          ru: "Пакеты, стили и скрипт темы — с нуля до первого компонента.",
        },
        keywords: { en: "installation setup npm getting started", ru: "installation setup npm подключение" },
      },
      {
        slug: "theming",
        title: { en: "Themes and tokens", ru: "Темы и токены" },
        description: {
          en: "CSS variables, light and dark themes, and a palette of your own.",
          ru: "CSS-переменные, светлая и тёмная темы, своя палитра.",
        },
        keywords: {
          en: "theming tokens css variables dark light colors",
          ru: "theming tokens css variables dark light цвета",
        },
      },
      {
        slug: "cli",
        title: { en: "CLI and registry", ru: "CLI и реестр" },
        description: {
          en: "How widgets land in your project, and why they are copied rather than installed.",
          ru: "Как виджеты попадают в проект и почему они копируются, а не ставятся.",
        },
        keywords: { en: "cli registry add init widgets", ru: "cli registry add init виджеты" },
      },
    ],
  },
  {
    title: same("Hooks"),
    items: [
      {
        slug: "hooks/use-drag-scroll",
        title: same("useDragScroll"),
        description: {
          en: "Drag-to-scroll with momentum and fading edges.",
          ru: "Прокрутка протяжкой мыши с инерцией и растворением краёв.",
        },
        keywords: { en: "drag scroll momentum inertia panning", ru: "drag scroll протяжка инерция momentum" },
      },
      {
        slug: "hooks/use-hotkeys",
        title: same("useHotkeys"),
        description: {
          en: "Keyboard shortcuts with sequences and modifiers.",
          ru: "Горячие клавиши с последовательностями и модификаторами.",
        },
        keywords: { en: "hotkeys keyboard shortcuts keys", ru: "hotkeys keyboard shortcuts клавиши" },
      },
      {
        slug: "hooks/use-event-stream",
        title: same("useEventStream"),
        description: {
          en: "Subscribing to a server event stream, paused while the tab is hidden.",
          ru: "Подписка на серверный поток событий с паузой в скрытой вкладке.",
        },
        keywords: { en: "sse eventsource live stream realtime", ru: "sse eventsource live поток" },
      },
      {
        slug: "hooks/use-polling",
        title: same("usePolling"),
        description: {
          en: "Periodic polling that pauses in the background and catches up on return.",
          ru: "Периодический опрос с паузой в фоне и догоном при возврате.",
        },
        keywords: { en: "polling interval refresh", ru: "polling interval опрос" },
      },
      {
        slug: "hooks/use-dismiss",
        title: same("useDismiss"),
        description: {
          en: "Closing a layer on outside click and Escape — with an eye on dialogs.",
          ru: "Закрытие слоя по клику мимо и Escape — с оглядкой на диалоги.",
        },
        keywords: { en: "dismiss outside click escape close", ru: "dismiss outside click escape закрытие" },
      },
      {
        slug: "hooks/use-theme",
        title: same("useTheme"),
        description: {
          en: "The current theme as external DOM state, with no flash on load.",
          ru: "Текущая тема как внешнее состояние DOM, без мигания при загрузке.",
        },
        keywords: { en: "theme dark light color scheme", ru: "theme dark light тема" },
      },
      {
        slug: "hooks/use-active-section",
        title: same("useActiveSection"),
        description: {
          en: "Highlighting the active section of a long page while scrolling.",
          ru: "Подсветка активного раздела длинной страницы при прокрутке.",
        },
        keywords: { en: "scrollspy section navigation anchors", ru: "scrollspy section navigation разделы" },
      },
    ],
  },
  {
    title: { en: "Components", ru: "Компоненты" },
    items: [
      {
        slug: "components/dialog",
        title: same("Dialog"),
        description: {
          en: "A modal window with a focus trap and scroll lock.",
          ru: "Модальное окно с ловушкой фокуса и блокировкой прокрутки.",
        },
        keywords: { en: "dialog modal window overlay", ru: "dialog modal окно" },
      },
      {
        slug: "components/confirm-dialog",
        title: same("ConfirmDialog"),
        description: {
          en: "Confirming an action instead of window.confirm.",
          ru: "Подтверждение действия вместо window.confirm.",
        },
        keywords: { en: "confirm confirmation delete destructive", ru: "confirm подтверждение удаление" },
      },
      {
        slug: "components/command-palette",
        title: same("CommandPalette"),
        description: {
          en: "A ⌘K palette with local entries and server-side search.",
          ru: "Палитра команд по ⌘K с локальными пунктами и серверным поиском.",
        },
        keywords: { en: "command palette cmdk search spotlight", ru: "command palette cmdk поиск search" },
      },
      {
        slug: "components/tooltip",
        title: same("TooltipLayer"),
        description: {
          en: "One tooltip for the whole application, driven by a data-tip attribute.",
          ru: "Один тултип на всё приложение через атрибут data-tip.",
        },
        keywords: { en: "tooltip hint popover", ru: "tooltip подсказка" },
      },
      {
        slug: "components/menu",
        title: same("Menu"),
        description: {
          en: "A fold for secondary actions with a dropdown panel.",
          ru: "Складка для второстепенных действий с выпадающей панелью.",
        },
        keywords: { en: "menu dropdown actions", ru: "menu dropdown меню" },
      },
      {
        slug: "components/button",
        title: same("Button"),
        description: {
          en: "A button with variants, sizes and a loading state.",
          ru: "Кнопка с вариантами, размерами и состоянием загрузки.",
        },
        keywords: { en: "button variants loading", ru: "button кнопка" },
      },
      {
        slug: "components/field",
        title: { en: "Field and inputs", ru: "Field и поля" },
        description: {
          en: "Label, hint and error wired to the input through aria.",
          ru: "Подпись, пояснение и ошибка, связанные с полем через aria.",
        },
        keywords: { en: "field input textarea select form label", ru: "field input textarea select форма" },
      },
      {
        slug: "components/markdown",
        title: same("Markdown"),
        description: {
          en: "Limited markup with no dependencies and no raw HTML.",
          ru: "Ограниченная разметка без зависимостей и без сырого HTML.",
        },
        keywords: { en: "markdown markup text formatting", ru: "markdown разметка текст" },
      },
      {
        slug: "components/editable-text",
        title: same("EditableText"),
        description: {
          en: "Editing text in place, right where it is shown.",
          ru: "Правка текста по клику прямо на месте.",
        },
        keywords: { en: "inline edit editable rename", ru: "inline edit редактирование" },
      },
      {
        slug: "components/mention-textarea",
        title: same("MentionTextarea"),
        description: {
          en: "A text field with @mention autocomplete.",
          ru: "Поле ввода с автодополнением @упоминаний.",
        },
        keywords: { en: "mention textarea autocomplete people", ru: "mention упоминания textarea" },
      },
      {
        slug: "components/avatar",
        title: same("Avatar"),
        description: {
          en: "An avatar with initials, and a stack with a remainder.",
          ru: "Аватар с инициалами и стопка с остатком.",
        },
        keywords: { en: "avatar initials people stack", ru: "avatar инициалы участники" },
      },
      {
        slug: "components/badge",
        title: { en: "Badge and LevelMeter", ru: "Badge и LevelMeter" },
        description: {
          en: "Colour-coded labels and a level meter for ordinal values.",
          ru: "Метки в цвете и шкала уровня для порядковых величин.",
        },
        keywords: { en: "badge chip tag label priority", ru: "badge chip tag метка приоритет" },
      },
      {
        slug: "components/app-shell",
        title: same("AppShell"),
        description: {
          en: "An application shell with a responsive sidebar.",
          ru: "Оболочка приложения с адаптивным сайдбаром.",
        },
        keywords: { en: "shell layout sidebar responsive", ru: "shell layout sidebar сайдбар" },
      },
      {
        slug: "components/section-nav",
        title: same("SectionNav"),
        description: {
          en: "Sticky navigation across the sections of a long page.",
          ru: "Липкая навигация по разделам длинной страницы.",
        },
        keywords: { en: "section nav sticky navigation", ru: "section nav разделы навигация" },
      },
      {
        slug: "components/hotkeys-help",
        title: same("HotkeysHelp"),
        description: {
          en: "A help screen assembled from the very same list of shortcuts.",
          ru: "Экран справки, собранный из того же списка клавиш.",
        },
        keywords: { en: "hotkeys help shortcuts cheatsheet", ru: "hotkeys help справка" },
      },
      {
        slug: "components/theme-toggle",
        title: same("ThemeToggle"),
        description: {
          en: "A switch between the light and dark themes.",
          ru: "Переключатель светлой и тёмной темы.",
        },
        keywords: { en: "theme toggle dark light switch", ru: "theme toggle тема переключатель" },
      },
      {
        slug: "components/live-indicator",
        title: same("LiveIndicator"),
        description: {
          en: "Live connection state as a dot and a caption.",
          ru: "Состояние живого соединения точкой и подписью.",
        },
        keywords: { en: "live indicator sse status connection", ru: "live indicator sse статус" },
      },
      {
        slug: "components/query-input",
        title: same("QueryInput"),
        description: {
          en: "Structured search is:open author:me — chips instead of text, with autocomplete.",
          ru: "Структурный поиск is:open author:me — чипы вместо текста, автодополнение.",
        },
        keywords: {
          en: "query search filter syntax is author chips",
          ru: "query search filter поиск фильтр синтаксис is author",
        },
      },
      {
        slug: "components/slash-textarea",
        title: same("SlashTextarea"),
        description: {
          en: "A «/» command menu right inside the input — like Notion and Linear.",
          ru: "Меню команд по «/» прямо в поле ввода — как в Notion и Linear.",
        },
        keywords: { en: "slash command menu notion linear", ru: "slash command menu команды notion" },
      },
      {
        slug: "components/tag-input",
        title: same("TagInput"),
        description: {
          en: "Multi-value input: chips instead of a string, with clipboard paste parsing.",
          ru: "Многозначный ввод: чипы вместо строки, разбор вставки из буфера.",
        },
        keywords: { en: "tag input chips labels paste tokens", ru: "tag input chips метки теги вставка" },
      },
      {
        slug: "components/time-range",
        title: same("TimeRangePicker"),
        description: {
          en: "A time range in now-15m syntax — like Grafana and Kibana.",
          ru: "Интервал времени в синтаксисе now-15m — как в Grafana и Kibana.",
        },
        keywords: { en: "time range now grafana kibana period", ru: "time range now grafana интервал время период" },
      },
      {
        slug: "components/undo-toaster",
        title: same("UndoToaster"),
        description: {
          en: "«Undo» with a draining timer instead of a confirmation dialog.",
          ru: "«Отменить» с тающим таймером вместо диалога подтверждения.",
        },
        keywords: { en: "undo toast revert confirmation", ru: "undo toast отмена подтверждение" },
      },
      {
        slug: "components/status-bar",
        title: same("StatusBar"),
        description: {
          en: "A bottom bar like a code editor's: segments dropped by priority.",
          ru: "Нижняя полоса как в редакторах кода: сегменты по приоритету.",
        },
        keywords: { en: "status bar vscode segments footer", ru: "status bar статус полоса vscode сегменты" },
      },
      {
        slug: "components/sparkline",
        title: same("Sparkline"),
        description: {
          en: "An inline SVG trend without a chart library — in a row or a badge.",
          ru: "Инлайновый тренд в SVG без chart-библиотеки — в строку и в бейдж.",
        },
        keywords: { en: "sparkline chart trend inline svg", ru: "sparkline chart trend график тренд спарклайн" },
      },
      {
        slug: "components/heatmap",
        title: same("HeatmapCalendar"),
        description: {
          en: "A year of activity as a grid of weeks, like the GitHub contribution graph.",
          ru: "Год активности сеткой недель, как график вкладов на GitHub.",
        },
        keywords: { en: "heatmap calendar activity github contributions", ru: "heatmap calendar activity github теплокарта календарь" },
      },
      {
        slug: "components/activity-timeline",
        title: same("ActivityTimeline"),
        description: {
          en: "A feed of events by day, with runs of similar ones collapsed.",
          ru: "Лента событий по дням со свёрткой серий однотипных.",
        },
        keywords: { en: "activity timeline feed history events", ru: "activity timeline feed лента события хронология" },
      },
      {
        slug: "components/virtual-list",
        title: same("VirtualList"),
        description: {
          en: "Windowed rendering of a long list: only what is visible lives in the DOM.",
          ru: "Оконный рендер длинного списка: в DOM живёт только видимое.",
        },
        keywords: { en: "virtual list windowing virtualization scroll", ru: "virtual list windowing виртуализация список" },
      },
      {
        slug: "components/misc",
        title: { en: "Odds and ends", ru: "Мелочи" },
        description: {
          en: "Portal, Backdrop, PageHint and DragScroll — one screen each.",
          ru: "Portal, Backdrop, PageHint и DragScroll — по одному экрану на каждый.",
        },
        keywords: same("portal backdrop pagehint dragscroll"),
      },
    ],
  },
  {
    title: { en: "Widgets", ru: "Виджеты" },
    items: [
      {
        slug: "widgets/kanban",
        title: same("Kanban"),
        description: {
          en: "A board with draggable cards and columns, and WIP limits.",
          ru: "Доска с перетаскиванием карточек и колонок и WIP-лимитами.",
        },
        keywords: { en: "kanban board drag cards columns wip", ru: "kanban board доска канбан" },
        badge: "CLI",
      },
      {
        slug: "widgets/gantt",
        title: same("Gantt"),
        description: {
          en: "A Gantt chart with dependencies and a critical path.",
          ru: "Диаграмма Ганта с зависимостями и критическим путём.",
        },
        keywords: { en: "gantt chart timeline schedule dependencies", ru: "gantt диаграмма сроки" },
        badge: "CLI",
      },
      {
        slug: "widgets/filter-bar",
        title: same("FilterBar"),
        description: {
          en: "A filter bar assembled from a description of the fields.",
          ru: "Панель фильтров, собираемая из описания полей.",
        },
        keywords: { en: "filter bar facets search presets", ru: "filter фильтр поиск" },
        badge: "CLI",
      },
      {
        slug: "widgets/log-stream",
        title: same("LogStream"),
        description: {
          en: "Virtualised log output: ANSI colours, filters, follow-tail.",
          ru: "Виртуализированный вывод логов: ANSI, фильтры, follow-tail.",
        },
        keywords: { en: "log stream ansi console output tail", ru: "log stream ansi логи вывод виртуализация" },
        badge: "CLI",
      },
      {
        slug: "widgets/tree-view",
        title: same("TreeView"),
        description: {
          en: "A tree with keyboard navigation, tri-state checkboxes and node dragging.",
          ru: "Дерево с клавиатурой, tri-state чекбоксами и переносом узлов.",
        },
        keywords: { en: "tree view checkbox drag files hierarchy", ru: "tree view дерево чекбокс перенос файлы" },
        badge: "CLI",
      },
      {
        slug: "widgets/diff-view",
        title: same("DiffView"),
        description: {
          en: "A diff of two texts: unified and side by side, word by word.",
          ru: "Дифф двух текстов: построчно и в две колонки, по словам.",
        },
        keywords: { en: "diff view compare lcs unified split", ru: "diff view дифф сравнение lcs" },
        badge: "CLI",
      },
      {
        slug: "widgets/dep-graph",
        title: same("DependencyGraph"),
        description: {
          en: "Layered layout of a dependency graph, with cycles broken apart.",
          ru: "Слоистая раскладка графа зависимостей с разрывом циклов.",
        },
        keywords: { en: "dependency graph dag sugiyama layers", ru: "dependency graph dag граф зависимости sugiyama" },
        badge: "CLI",
      },
      {
        slug: "widgets/flow-canvas",
        title: same("FlowCanvas"),
        description: {
          en: "A pan/zoom canvas with nodes and edges — a small react-flow.",
          ru: "Канва pan/zoom с узлами и связями — мини-react-flow.",
        },
        keywords: { en: "flow canvas pan zoom nodes react-flow", ru: "flow canvas pan zoom канва узлы react-flow" },
        badge: "CLI",
      },
      {
        slug: "widgets/dashboard-grid",
        title: same("DashboardGrid"),
        description: {
          en: "A tile grid with dragging and resizing.",
          ru: "Плиточная сетка с перетаскиванием и ресайзом.",
        },
        keywords: { en: "dashboard grid layout tiles widgets", ru: "dashboard grid layout сетка плитки дашборд" },
        badge: "CLI",
      },
      {
        slug: "widgets/presence-layer",
        title: same("PresenceLayer"),
        description: {
          en: "Collaborator cursors over a shared surface, fed by an event stream.",
          ru: "Курсоры соучастников поверх поверхности через поток событий.",
        },
        keywords: { en: "presence cursors multiplayer collaboration figma", ru: "presence cursors multiplayer курсоры соучастники figma" },
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
export function groupOf(slug: string, lang: Lang): string | undefined {
  return NAV.find((group) => group.items.some((item) => item.slug === slug))?.title[lang];
}
