/**
 * Языки сайта, адреса и строки интерфейса.
 *
 * Своя реализация вместо next-intl и подобных: строк интерфейса здесь
 * меньше сотни, а язык известен из адреса — целая библиотека ради этого
 * была бы такой же несоразмерностью, как clsx ради тридцати строк `cn`.
 *
 * Английский живёт в корне (`/docs/...`), русский — под префиксом
 * (`/ru/docs/...`). Поэтому адрес строится функцией, а не склейкой строк
 * на месте: правило «у языка по умолчанию префикса нет» должно быть
 * записано ровно один раз.
 */

export const LANGS = ["en", "ru"] as const;

export type Lang = (typeof LANGS)[number];

/** Язык по умолчанию — он же тот, что живёт в корне сайта. */
export const DEFAULT_LANG: Lang = "en";

/** Значение, своё для каждого языка. */
export type Localized<T = string> = Record<Lang, T>;

/**
 * Одна и та же строка во всех языках — имя компонента, хука, пакета.
 *
 * `Dialog` не переводится, но в типе всё равно обязан быть полным набором
 * языков: иначе добавление третьего языка не сломало бы сборку, а тихо
 * оставило бы дыры.
 */
export function same(value: string): Localized {
  return { en: value, ru: value };
}

/** Известен ли такой язык. Пришедшее из адреса нельзя приводить типом. */
export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Префикс языка в адресе. У языка по умолчанию его нет. */
export function langPrefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? "" : `/${lang}`;
}

/** Адрес страницы документации. */
export function docsHref(lang: Lang, slug: string): string {
  return `${langPrefix(lang)}/docs/${slug}`;
}

/** Адрес главной. Пустая строка адресом не бывает — отдаём «/». */
export function homeHref(lang: Lang): string {
  return langPrefix(lang) || "/";
}

/** Тот же путь на другом языке — для переключателя. */
export function switchHref(lang: Lang, slug: string | null): string {
  return slug === null ? homeHref(lang) : docsHref(lang, slug);
}

/** Код локали для `hreflang`, `Intl` и Open Graph. */
export const LOCALE_TAG: Localized = {
  en: "en_US",
  ru: "ru_RU",
};

/** Что показать в переключателе языка. */
export const LANG_LABEL: Localized = {
  en: "English",
  ru: "Русский",
};

/** Строки интерфейса — всё, что не приходит из контента страниц. */
export interface Dictionary {
  /** Пункты верхнего меню. */
  navDocs: string;
  navComponents: string;
  navWidgets: string;
  /** Поиск. */
  search: string;
  searchPlaceholder: string;
  searchEmpty: string;
  searchNavigate: string;
  searchSelect: string;
  /** Оболочка. */
  sectionsMenu: string;
  sidebarLabel: string;
  onThisPage: string;
  prev: string;
  next: string;
  toHome: string;
  sourcesOnGitHub: string;
  switchLanguage: string;
  /** Тема. */
  toDark: string;
  toLight: string;
  toggleTheme: string;
  /** Примеры и код. */
  tabPreview: string;
  tabCode: string;
  copy: string;
  copied: string;
  /** Таблица пропсов. */
  propColumn: string;
  typeColumn: string;
  defaultColumn: string;
  descriptionColumn: string;
  required: string;
  defaultsTo: string;
  /** Врезки. */
  calloutNote: string;
  calloutWarn: string;
  calloutWhy: string;
}

export const UI: Localized<Dictionary> = {
  en: {
    navDocs: "Docs",
    navComponents: "Components",
    navWidgets: "Widgets",
    search: "Search",
    searchPlaceholder: "Search the docs…",
    searchEmpty: "Nothing found",
    searchNavigate: "navigate",
    searchSelect: "open",
    sectionsMenu: "Sections menu",
    sidebarLabel: "Documentation sections",
    onThisPage: "On this page",
    prev: "Previous",
    next: "Next",
    toHome: "PathLogs UI — home",
    sourcesOnGitHub: "Source on GitHub",
    switchLanguage: "Switch language",
    toDark: "Dark theme",
    toLight: "Light theme",
    toggleTheme: "Toggle theme",
    tabPreview: "Preview",
    tabCode: "Code",
    copy: "Copy",
    copied: "Copied",
    propColumn: "Prop",
    typeColumn: "Type",
    defaultColumn: "Default",
    descriptionColumn: "Description",
    required: "required",
    defaultsTo: "defaults to",
    calloutNote: "Note",
    calloutWarn: "Careful",
    calloutWhy: "Why it works this way",
  },
  ru: {
    navDocs: "Документация",
    navComponents: "Компоненты",
    navWidgets: "Виджеты",
    search: "Поиск",
    searchPlaceholder: "Поиск по документации…",
    searchEmpty: "Ничего не найдено",
    searchNavigate: "навигация",
    searchSelect: "открыть",
    sectionsMenu: "Меню разделов",
    sidebarLabel: "Разделы документации",
    onThisPage: "На этой странице",
    prev: "Назад",
    next: "Дальше",
    toHome: "PathLogs UI — на главную",
    sourcesOnGitHub: "Исходники на GitHub",
    switchLanguage: "Сменить язык",
    toDark: "Тёмная тема",
    toLight: "Светлая тема",
    toggleTheme: "Переключить тему",
    tabPreview: "Превью",
    tabCode: "Код",
    copy: "Скопировать",
    copied: "Скопировано",
    propColumn: "Проп",
    typeColumn: "Тип",
    defaultColumn: "По умолчанию",
    descriptionColumn: "Описание",
    required: "обязательный",
    defaultsTo: "по умолчанию",
    calloutNote: "Заметка",
    calloutWarn: "Осторожно",
    calloutWhy: "Почему так",
  },
};

/** Словарь языка. Отдельной функцией — чтобы не писать `UI[lang]` повсюду. */
export function dict(lang: Lang): Dictionary {
  return UI[lang];
}

/** Заголовок и описание сайта — для метаданных и главной. */
export const SITE_META: Localized<{ title: string; description: string; keywords: string[] }> = {
  en: {
    title: "PathLogs UI — React components, hooks and widgets",
    description:
      "A design system, behavioural hooks and ready-made widgets: kanban board, Gantt chart, filter bar. Primitives install from npm, widgets are copied into your project.",
    keywords: [
      "react",
      "components",
      "design system",
      "kanban",
      "gantt chart",
      "hooks",
      "typescript",
      "tailwind",
      "shadcn",
      "ui kit",
    ],
  },
  ru: {
    title: "PathLogs UI — React-компоненты, хуки и виджеты",
    description:
      "Дизайн-система, поведенческие хуки и готовые виджеты: канбан-доска, диаграмма Ганта, панель фильтров. Примитивы ставятся из npm, виджеты копируются в проект.",
    keywords: [
      "react",
      "компоненты",
      "дизайн-система",
      "канбан",
      "диаграмма Ганта",
      "хуки",
      "typescript",
      "tailwind",
      "shadcn",
      "ui kit",
    ],
  },
};
