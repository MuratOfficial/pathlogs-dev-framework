/**
 * Тексты главной страницы.
 *
 * Вынесены из разметки, потому что страница существует на двух языках,
 * а вёрстка у неё одна: держать две копии JSX ради шести абзацев значило бы
 * чинить каждую правку дважды.
 */

import type { Localized } from "./locale";

export interface LandingFeature {
  title: string;
  text: string;
  /** Slug без языка и префикса /docs. */
  slug: string;
}

export interface LandingCopy {
  release: string;
  headline: { lead: string; accent: string };
  lede: string;
  ctaStart: string;
  ctaWidgets: string;
  liveTitle: string;
  liveText: string;
  liveLink: string;
  featuresTitle: string;
  featuresLede: string;
  features: LandingFeature[];
  packagesTitle: string;
  packagesText: string;
  widgetsTitle: string;
  widgetsText: string;
  footerMade: string;
  footerDocs: string;
}

export const LANDING: Localized<LandingCopy> = {
  en: {
    release: "0.1.0 — first public release",
    headline: { lead: "Components grown from", accent: "a real product" },
    lede:
      "A design system, behavioural hooks and heavyweight widgets — kanban, Gantt chart, filter bar. Primitives install from npm; widgets are copied into your project and edited like your own code.",
    ctaStart: "Get started",
    ctaWidgets: "Browse the widgets",
    liveTitle: "Not a screenshot",
    liveText:
      "This is the actual widget from the registry. Drag a card, reorder a column, open its settings.",
    liveLink: "Board documentation →",
    featuresTitle: "The small things everyone rewrites",
    featuresLede:
      "Each one cost real debugging in a real product. Next to the code sits a comment explaining what the alternative would have been.",
    features: [
      {
        title: "Drag-scroll that does not break clicks",
        text: "Mouse scrolling engages only past a movement threshold, yields to native drag & drop, and auto-scrolls the strip near the edge. Momentum, fading edges, keyboard support.",
        slug: "hooks/use-drag-scroll",
      },
      {
        title: "A board with honest optimism",
        text: "The card lands exactly where the slot was shown. Fresh server data never overwrites a later local change — so quick successive moves do not snap back.",
        slug: "widgets/kanban",
      },
      {
        title: "Markdown without raw HTML",
        text: "Parsing yields a tree, and React elements are built from that tree. A foreign tag becomes text and a javascript: link never becomes a link — by construction, not by a sanitiser.",
        slug: "components/markdown",
      },
      {
        title: "Shortcuts with sequences",
        text: "«g», then «d». Two independent matchers: a letter typed into an input never leaves the app waiting for a second key.",
        slug: "hooks/use-hotkeys",
      },
      {
        title: "A tooltip that never gets clipped",
        text: "One layer for the whole app and a data-tip attribute on any element. A fixed-position portal — columns and strips with overflow are no obstacle.",
        slug: "components/tooltip",
      },
      {
        title: "Themes on CSS variables",
        text: "Light, dark and system. A script in the head applies the theme before the first paint, so the page never flashes. Your own palette is a variable override.",
        slug: "theming",
      },
    ],
    packagesTitle: "Packages — from npm",
    packagesText:
      "Tokens, hooks and primitives change rarely, and you want to update them with a single command.",
    widgetsTitle: "Widgets — by copying",
    widgetsText:
      "The board and the Gantt almost always need domain-specific edits. In your project they are ordinary files.",
    footerMade: "MIT · built on the back of",
    footerDocs: "Docs",
  },
  ru: {
    release: "0.1.0 — первый публичный выпуск",
    headline: { lead: "Компоненты, выросшие из", accent: "настоящего продукта" },
    lede:
      "Дизайн-система, поведенческие хуки и тяжёлые виджеты — канбан, диаграмма Ганта, панель фильтров. Примитивы ставятся из npm, виджеты копируются в проект и правятся как свой код.",
    ctaStart: "Начать",
    ctaWidgets: "Посмотреть виджеты",
    liveTitle: "Не скриншот",
    liveText:
      "Это настоящий виджет из реестра. Перетащите карточку, переставьте колонку, откройте её настройки.",
    liveLink: "Документация доски →",
    featuresTitle: "Мелочи, которые обычно пишут заново",
    featuresLede:
      "Каждая из них стоила отладки в настоящем продукте. Рядом с кодом лежит комментарий, объясняющий, что было бы иначе.",
    features: [
      {
        title: "Протяжка, которая не ломает клик",
        text: "Прокрутка мышью включается только после порога сдвига, уступает нативному drag&drop и сама подкручивает ленту у края. Инерция, растворение краёв, клавиатура.",
        slug: "hooks/use-drag-scroll",
      },
      {
        title: "Доска с честным оптимизмом",
        text: "Карточка встаёт ровно туда, где показан слот. Свежие данные с сервера не перезатирают более позднее локальное изменение — быстрые переносы подряд не откатываются.",
        slug: "widgets/kanban",
      },
      {
        title: "Markdown без сырого HTML",
        text: "Разбор даёт дерево, из дерева строятся React-элементы. Чужой тег станет текстом, а javascript:-ссылка не станет ссылкой — по построению, а не по санитайзеру.",
        slug: "components/markdown",
      },
      {
        title: "Клавиши с последовательностями",
        text: "«g», затем «d». Два независимых матчера: набранная в поле ввода буква не оставляет приложение в ожидании второй клавиши.",
        slug: "hooks/use-hotkeys",
      },
      {
        title: "Тултип, который не обрезается",
        text: "Один слой на всё приложение и атрибут data-tip на любом элементе. Портал с fixed — колонки и ленты с overflow ему не помеха.",
        slug: "components/tooltip",
      },
      {
        title: "Темы на CSS-переменных",
        text: "Светлая, тёмная и системная. Скрипт в head ставит тему до первой отрисовки, поэтому страница не мигает. Своя палитра — переопределением переменных.",
        slug: "theming",
      },
    ],
    packagesTitle: "Пакеты — из npm",
    packagesText:
      "Токены, хуки и примитивы правят редко, а обновлять их хочется одной командой.",
    widgetsTitle: "Виджеты — копированием",
    widgetsText:
      "Доска и Гант почти всегда требуют правок под домен. В вашем проекте это обычные файлы.",
    footerMade: "MIT · сделано на основе",
    footerDocs: "Документация",
  },
};
