# PathLogs UI

UI-фреймворк, выросший из трекера задач [pathlogs](../pathlogs). Всё, что там оказалось переиспользуемым, вынесено сюда: дизайн-система, поведенческие хуки, примитивы и тяжёлые виджеты — доска, диаграмма Ганта, панель фильтров.

## Как это устроено

Фреймворк раздаётся двумя способами, и это не компромисс, а осознанное разделение.

| | Что | Почему так |
|---|---|---|
| **npm-пакеты** | токены, хуки, примитивы | Их правят редко, а обновлять хочется одной командой. Версионирование здесь помогает. |
| **CLI-реестр** | доска, Гант, фильтры | Тяжёлые виджеты почти всегда требуют правок под конкретный домен. Держать их за стеной версионирования — значит вынуждать обходить её пропсами. Поэтому они копируются в код проекта, как в shadcn/ui. |

```
pathlogs-dev-framework/
├── packages/
│   ├── tokens/     @toimetdev/pathlogs-tokens  — CSS-переменные, темы, работа с цветом
│   ├── hooks/      @toimetdev/pathlogs-hooks   — протяжка, горячие клавиши, SSE, опрос
│   ├── core/       @toimetdev/pathlogs-core    — диалоги, меню, тултипы, палитра, Markdown
│   └── cli/        @toimetdev/pathlogs-ui      — установка виджетов в проект
├── registry/
│   └── widgets/    kanban, gantt, filter-bar
├── apps/docs/      сайт документации (Next.js)
└── tests/          165 тестов на чистую логику
```

## Документация

Сайт со всеми компонентами, живыми примерами и поиском:

```bash
npm run docs
```

Он построен на самих пакетах фреймворка — те же токены, тот же `CommandPalette`
в поиске, тот же `useActiveSection` в оглавлении. Виджеты в примерах импортируются
прямо из `registry/widgets`, поэтому на сайте крутится ровно тот код, который
скопирует к себе пользователь. Если что-то сломается в пакетах, первым это
увидит сайт.

## Установка

```bash
npm install @toimetdev/pathlogs-core @toimetdev/pathlogs-hooks @toimetdev/pathlogs-tokens
```

Подключить стили (обычно в `globals.css`):

```css
@import "tailwindcss";
@import "@toimetdev/pathlogs-tokens/styles/index.css";
@import "@toimetdev/pathlogs-core/styles/components.css";
@import "@toimetdev/pathlogs-tokens/styles/tailwind.css";
```

Последняя строка нужна, только если проект на Tailwind: она превращает токены в утилиты (`bg-surface`, `text-muted`, `border-edge`). Компоненты `@toimetdev/pathlogs-core` несут собственный CSS и работают без Tailwind вовсе.

Снять мигание темой при загрузке — инлайн-скрипт в `<head>`:

```tsx
import { themeScript } from "@toimetdev/pathlogs-tokens";

<head>
  <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
</head>
```

Скрипт синхронный и блокирует отрисовку — здесь это именно то, что нужно: он ставит `data-theme` до первого кадра.

## Виджеты

```bash
npx @toimetdev/pathlogs-ui init          # pathlogs.json + импорты стилей
npx @toimetdev/pathlogs-ui list          # что есть в реестре
npx @toimetdev/pathlogs-ui add kanban    # скопировать в src/components/ui/
```

`init` создаёт `pathlogs.json`:

```json
{
  "componentsDir": "src/components/ui",
  "alias": "@/components/ui",
  "css": "src/app/globals.css",
  "tailwind": true
}
```

`add` копирует файлы виджета и переписывает импорты между ними под ваш алиас. Существующие файлы не перезаписываются — виджеты копируются в проект именно затем, чтобы их правили. Перезаписать намеренно: `--force`. Посмотреть план, ничего не трогая: `--dry-run`.

---

## @toimetdev/pathlogs-tokens

Плоский набор CSS-переменных: поверхности, текст, акценты, семантика состояний, радиусы, тени, шкала z-index, тайминги. Тёмная тема — значение по умолчанию, светлая включается атрибутом `[data-theme="light"]` на `<html>`.

Общая шкала слоёв важнее, чем кажется: без неё портал одного компонента перекрывает портал другого в случайном порядке.

```ts
import { alpha, readableTextOn, backdropCss, BOARD_PALETTE } from "@toimetdev/pathlogs-tokens";

alpha("#6366f1", 0.3);        // "#6366f14d"
readableTextOn("#ffff00");    // "#000000" — белый текст на жёлтом не читается
backdropCss({ color: "#6366f1", colorTo: "#ec4899", angle: 45 });
```

Цвета меток и колонок задаёт пользователь, поэтому `readableTextOn` считает яркость по WCAG и выбирает чёрный или белый — а не полагается на то, что «обычно фон тёмный».

Файлы стилей: `styles/tokens.css`, `base.css`, `animations.css`, `scroll.css`, `index.css` (всё вместе), `tailwind.css` (мост к Tailwind v4).

## @toimetdev/pathlogs-hooks

### useDragScroll

Прокрутка контейнера протяжкой мыши — с инерцией, растворением краёв и автопрокруткой при перетаскивании.

```tsx
const ref = useDragScroll<HTMLDivElement>({ axis: "x", keyboard: true });
<div ref={ref} className="overflow-x-auto">…</div>
```

Что здесь неочевидно и почему сделано именно так:

- клик не ломается — протяжка включается только после порога сдвига, а «пойманный» ею клик гасится на фазе захвата;
- нативный drag&drop важнее: на `dragstart` протяжка отменяется, а лента у края крутится автопрокруткой — иначе бросить карточку за краем экрана нечем;
- тач не трогаем — там прокрутка пальцем и так родная;
- курсор-«рука» и растворение краёв появляются, только когда есть куда прокручивать;
- с `keyboard: true` лента слушает стрелки, Page и Home/End — но только когда фокус на ней самой.

Механика вынесена в `attachDragScroll` (без React) и `dragScroll.ts` (без DOM) — поэтому она покрыта тестами, а не проверяется руками.

### useHotkeys

Горячие клавиши с последовательностями: «g», затем «d».

```tsx
useHotkeys([
  { keys: "g d", label: "Дашборд", group: "Навигация", handler: () => router.push("/dashboard") },
  { keys: "mod+k", label: "Поиск", allowInInput: true, handler: openPalette },
]);
```

`mod` — Ctrl на Windows/Linux и ⌘ на macOS. Внутри работают два независимых матчера: набранная в поле ввода «g» иначе оставила бы общий матчер в ожидании продолжения, и следующая настоящая «d» сработала бы как переход.

### useEventStream / usePolling

```tsx
const { status, updatedAt } = useEventStream(`/api/projects/${id}/stream`, {
  events: ["change"],
  onEvent: () => router.refresh(),
});

const { data: unread } = usePolling(fetchUnread, { initial: 0, interval: 30_000 });
```

Оба откладывают работу, пока вкладка скрыта, и догоняют при возврате: обновлять невидимый экран незачем, а вернувшись, пользователь должен увидеть свежее состояние сразу, а не через интервал.

### useDismiss

Закрытие всплывающего слоя по клику мимо и по Escape — с одной важной оговоркой:

```tsx
useDismiss(ref, { enabled: open, onDismiss: close });
```

Пока в документе есть `[data-pl-overlay]` (его ставит `Dialog`), закрытие пропускается. Триггеры диалогов часто живут внутри выпадающего меню, а сам диалог рендерится порталом: закрой меню — размонтируется триггер, и диалог уйдёт вместе с ним, не успев появиться.

### useTheme, useActiveSection

```tsx
const { resolved, toggle } = useTheme();
const { active, scrollTo } = useActiveSection(["overview", "comments"], { offset: () => nav.offsetHeight });
```

## @toimetdev/pathlogs-core

| Компонент | Назначение |
|---|---|
| `Dialog` | Модальное окно: портал, ловушка фокуса, Escape, блокировка прокрутки страницы |
| `ConfirmDialog` | Подтверждение вместо `window.confirm` |
| `CommandPalette` | ⌘K с локальными пунктами и серверным поиском |
| `HotkeysHelp` | Экран справки, собираемый из того же списка, что отдан в `useHotkeys` |
| `Menu` / `MenuItem` | Складка для второстепенных действий |
| `TooltipLayer` | Один тултип на всё приложение через `data-tip` |
| `Markdown` | Ограниченный Markdown без зависимостей |
| `AppShell` | Адаптивный сайдбар: статичный на десктопе, drawer на мобильном |
| `EditableText` | Правка текста по клику на месте |
| `MentionTextarea` | Поле с автодополнением @упоминаний |
| `SectionNav` | Липкая навигация по разделам длинной страницы |
| `Avatar` / `AvatarStack` | Аватары с инициалами и стопка с остатком |
| `Badge` / `LevelMeter` | Метки и шкала уровня |
| `Button`, `Field`, `Input`, `Textarea`, `Select` | Формы |
| `ThemeToggle`, `Backdrop`, `PageHint`, `LiveIndicator`, `DragScroll`, `Portal` | Остальное |

### Тултипы через атрибут

```tsx
<TooltipLayer />                          // один раз в корне
<button data-tip="Архивировать проект" /> // где угодно
```

Не компонент-обёртка, а глобальный слой — потому что бабл рендерится порталом с `position: fixed` и поэтому не обрезается контейнерами с `overflow`: колонками, лентами, прокручиваемыми списками. Обёртка рисовала бы его внутри такого контейнера.

Иконочным элементам без видимого текста слой сам проставляет `aria-label`: нативный `title` читают скринридеры, а свой атрибут — нет.

### Markdown

```tsx
<Markdown text={description} mentions={members.map((m) => m.name)} />
```

Поддерживается: `**жирный**`, `*курсив*`, `~~зачёркнутый~~`, `` `код` ``, блоки кода, ссылки, заголовки, списки, цитаты, черта.

Картинок и сырого HTML нет намеренно. Разбор даёт дерево, из дерева строятся React-элементы — строка с чужим тегом станет текстом, а не разметкой. `dangerouslySetInnerHTML` здесь нет и быть не должно. Ссылки с протоколом не из белого списка остаются видимым текстом, чтобы автор заметил, что разметка не сработала.

## Виджеты реестра

### kanban

```tsx
<Kanban
  items={tasks}
  columns={columns}
  renderCard={(task) => <TaskCard task={task} />}
  onMoveItem={(id, columnId, orderedIds) => moveTaskAction(id, columnId, orderedIds)}
  onReorderColumns={(ids) => reorderColumnsAction(projectId, ids)}
  onUpdateColumn={updateColumnAction}
  canManageColumns={isManager}
  filter={(task) => matchesFilter(fields, filterState, task)}
/>
```

Доска ничего не знает о домене: что показывать на карточке, решает `renderCard`, что делать с переносом — `onMoveItem`. Одна и та же доска обслуживает задачи, заявки, кандидатов.

`onMoveItem` получает **полный** новый порядок колонки, а не одну позицию: сервер должен записать порядок целиком, иначе два одновременных переноса разъедутся.

Тонкости, которые стоили отладки и потому вынесены в комментарии кода:

- источник перетаскивания прячется не в `dragstart`, а на первом `drag` — синхронный `setState` в дискретном событии убрал бы карточку прямо в момент старта, и браузер отменил бы перенос;
- скрытая карточка остаётся в дереве (`hidden`), чтобы её `onDragEnd` сработал при отмене переноса;
- свежие props с сервера заменяют оптимистичное состояние только когда все начатые действия завершились — иначе ревалидация одного переноса перезатирает результат другого;
- границы колонки задаются четырьмя отдельными свойствами: React обновляет сокращённое `borderColor` и `borderTopColor` независимо, и верхняя полоса «залипает».

### gantt

```tsx
<Gantt
  items={tasks}
  edges={links.filter((l) => l.type === "BLOCKS")}
  renderLabel={(task) => <TaskLabel task={task} />}
  onChangeDates={(id, dates) => updateTaskFieldsAction(id, dates)}
  barColor={(task) => STATUS_COLORS[task.status]}
/>
```

Полосы двигаются целиком и тянутся за края; зависимости рисуются стрелками; критический путь подсвечивается янтарным.

Критический путь считается по топологическому порядку. Если порядок построить не удалось — в графе цикл, и пути нет: показывать произвольную цепочку было бы враньём. Одиночный элемент путём тоже не считается.

### filter-bar

```tsx
const fields = [
  { key: "q", label: "Поиск", kind: "text", matches: textMatcher((t) => [t.title, t.number]) },
  { key: "status", label: "Статус", kind: "select", options: statusOptions, matches: equalsMatcher((t) => t.status) },
  { key: "assignee", label: "Исполнитель", kind: "select", options: members, matches: includesMatcher((t) => t.assignees) },
];

<FilterBar fields={fields} value={filter} onChange={setFilter} savedFilters={presets} onSaveFilter={saveFilterAction} />
```

Фильтр описывается набором полей, а не жёсткой структурой: новое условие добавляется записью в массиве, а не правкой пяти файлов. Состояние сериализуется в строку запроса — в этом же виде оно лежит в сохранённых пресетах и в адресной строке, поэтому ссылка на отфильтрованный список открывается ровно тем же, чем была.

Неизвестные ключи при разборе игнорируются: сохранённый пресет должен пережить исчезновение поля, а не сломать экран.

## Разработка

```bash
npm install
npm run build      # tsc -b по ссылкам проектов
npm run typecheck  # пакеты + виджеты реестра + сайт документации
npm test           # 165 тестов
npm run check      # всё разом
npm run docs       # сайт документации на localhost:3000
npm run docs:build # продакшн-сборка сайта
```

Сборку и dev-сервер сайта не стоит запускать одновременно: они делят каталог
`.next`, и продакшн-сборка ломает карту чанков работающего dev-сервера.

### Деплой сайта

Сайт разворачивается на Vercel как обычное приложение Next.js. В настройках
проекта нужно указать одно:

| Настройка | Значение |
|---|---|
| Root Directory | `apps/docs` |
| Framework Preset | Next.js |
| Build / Install Command | по умолчанию |
| Include files outside root directory | включено |

Последний пункт обязателен: живые примеры импортируют виджеты прямо
из `registry/widgets`, то есть из каталога выше корня приложения.

Отдельно собирать пакеты не нужно — `apps/docs` делает это сам. Каталог
`dist/` в git не хранится, поэтому на чистом клоне его некому создать:
за это отвечает `prebuild`, который запускает `tsc -b ../../packages/core`
(сборка по ссылкам проектов подтягивает `tokens` и `hooks`). Без него
Next не может разрешить `@toimetdev/pathlogs-core`: пакет объявляет
`main: ./dist/index.js`, а файла нет.

После первого деплоя поправьте константу `SITE` в
[`apps/docs/src/app/layout.tsx`](apps/docs/src/app/layout.tsx) — от неё
считаются канонические адреса и ссылки в карточках для соцсетей.

Виджеты реестра типизируются отдельным `registry/tsconfig.json` — иначе в реестр можно было бы положить файл, который не компилируется, и узнать об этом только от пользователя.

### Что покрыто тестами

Тесты стоят там, где ошибка тихая и дорогая: порядок карточек при разных режимах сортировки, критический путь, разбор Markdown и белый список протоколов, последовательности горячих клавиш, математика инерции и краёв, сериализация фильтров.

Компоненты тестами не покрыты: их поведение почти целиком — это DOM-события и вёрстка, и такие тесты проверяли бы React, а не нашу логику. Поэтому вся логика, которую стоит проверять, из компонентов вынесена — `kanbanOrder.ts`, `ganttLayout.ts`, `filterModel.ts`, `dragScroll.ts`, `hotkeys.ts`, `markdownParser.ts`.

### Добавить виджет в реестр

1. `registry/widgets/<имя>/` — файлы виджета.
2. `meta.json` рядом с ними:

```json
{
  "name": "имя",
  "title": "Название",
  "description": "Что делает и чем полезен",
  "type": "widget",
  "dependencies": [],
  "registryDependencies": [],
  "packageDependencies": ["@toimetdev/pathlogs-core"],
  "tailwind": true,
  "files": [{ "path": "Widget.tsx", "target": "имя/Widget.tsx" }]
}
```

3. `npm run typecheck` — виджет должен компилироваться.
4. Чистую логику вынести в отдельный модуль и покрыть тестами.

`registryDependencies` — другие виджеты реестра, `dependencies` — сторонние npm-пакеты, `packageDependencies` — пакеты самого фреймворка. CLI раскрывает зависимости в порядке установки и печатает список для `npm install`.

## Соглашения

- **Код и API — английский, документация и комментарии — русский.** UI-строки вынесены в проп `labels` с английскими значениями по умолчанию.
- **Комментарий объясняет «почему», а не «что».** Если в коде есть неочевидное решение — рядом написано, что было бы иначе.
- **Логика отделена от разметки.** Всё, что можно проверить без DOM, живёт в отдельном модуле.
- **Компонент не знает о домене.** Что показать — `renderCard`/`renderLabel`, что сделать — колбэк.
- **Цвет не единственный носитель смысла.** Рядом со статусом всегда есть текст, у приоритета — шкала, а не только оттенок.
