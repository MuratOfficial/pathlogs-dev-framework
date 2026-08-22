# Перевод pathlogs на фреймворк

Порядок здесь не случайный: сначала переезжает то, у чего нет зависимостей вверх по дереву, а тяжёлые виджеты — последними, когда под ними уже стоят токены и хуки.

Каждый шаг самодостаточен: после него приложение собирается и работает. Останавливаться можно на любом.

## Что куда переезжает

### Полностью, заменой импорта

| В pathlogs | Во фреймворке | Что изменится в коде |
|---|---|---|
| `components/ConfirmDialog.tsx` | `ConfirmDialog` из `@pathlogs/core` | Подписи кнопок задаются пропами, дефолты английские |
| `components/TooltipLayer.tsx` | `TooltipLayer` | Атрибут `data-tip` тот же |
| `components/MoreMenu.tsx` | `Menu` + `MenuItem` | Закрытие при открытом диалоге теперь через `useDismiss` и `[data-pl-overlay]`, а не через поиск `.fixed.inset-0` |
| `components/ThemeToggle.tsx` | `ThemeToggle` | — |
| `components/AppShell.tsx` | `AppShell` | Логотип уходит в проп `brand` |
| `components/Markdown.tsx` | `Markdown`, `MarkdownInline` | Разбор вынесен в `markdownParser`, доступен отдельно |
| `components/DragScroll.tsx`, `useDragScroll.ts` | `DragScroll`, `useDragScroll` | — |
| `lib/dragScroll.ts`, `lib/dragScrollBinding.ts` | `@pathlogs/hooks` | data-атрибуты получили префикс `pl-` |
| `lib/sections.ts` + `TaskSectionNav` | `useActiveSection` + `SectionNav` | Разделы описываются массивом `{ id, label, count }` |
| `components/task/EditableText.tsx` | `EditableText` | Вместо `field` — прямой `onSave(next)` |
| `components/task/MentionTextarea.tsx` | `MentionTextarea` | `members` → `people` |
| `lib/background.ts` + `ProjectBackdrop` | `backdropCss` + `Backdrop` | `ProjectBackgroundDTO` → `SurfaceBackdrop` |
| `components/LiveBoard.tsx` | `useEventStream` + `LiveIndicator` | Компонент разделён на данные и вид |
| `components/UnreadBadge.tsx` | `usePolling` | Разметка бейджа остаётся в приложении |
| `components/Hotkeys.tsx` | `useHotkeys` + `HotkeysHelp` | Список клавиш один на обработку и на справку |
| `components/CommandPalette.tsx` | `CommandPalette` | Источник данных приходит пропом `search`, роуты — `items` |

### Через реестр, с обобщением

| В pathlogs | Виджет | Что придётся написать |
|---|---|---|
| `components/KanbanBoard.tsx` (1169 строк) | `kanban` | `renderCard` с телом карточки; колбэки поверх существующих server actions |
| `components/GanttChart.tsx` | `gantt` | `renderLabel`, `barColor` по статусу |
| `components/TaskFilterBar.tsx` + `lib/taskFilter.ts` | `filter-bar` | Описание полей `FilterField[]` |

### Остаётся в приложении

`TaskBadges`, `TaskListView`, `SprintPanel`, `PollsPanel`, `WorkloadPanel`, `ProjectStats`, диалоги импорта, админка, всё в `lib/actions/` и серверные утилиты (`storage`, `webhooks`, `notify`, `email`, `calendar`, `import/*`). Это домен трекера, а не фреймворк.

---

## Шаг 1. Токены

Заменить содержимое `src/app/globals.css` на импорты:

```css
@import "tailwindcss";
@import "@pathlogs/tokens/styles/index.css";
@import "@pathlogs/core/styles/components.css";
@import "@pathlogs/tokens/styles/tailwind.css";
```

Всё, что было в `globals.css` — переменные, анимации, `.page-hint`, `.no-scrollbar`, маски краёв — уже есть в пакете. Утилиты Tailwind (`bg-surface`, `text-muted`, `border-edge`) сохраняют прежние имена, поэтому вёрстку править не нужно.

Что переименовалось и требует замены по проекту:

| Было | Стало |
|---|---|
| `.animate-fade-up`, `.animate-fade-in`, `.animate-pop-in`, `.animate-shake`, `.animate-float` | `.pl-animate-*` |
| `.delay-1` … `.delay-6` | `.pl-delay-*` |
| `.hover-lift`, `.gradient-text`, `.btn-gradient` | `.pl-hover-lift`, `.pl-gradient-text`, `.pl-btn-gradient` |
| `.no-scrollbar` | `.pl-no-scrollbar` |
| `.auth-aurora`, `.aurora-blob` | `.pl-aurora`, `.pl-aurora-blob` |

Своё в приложении остаётся: `.auth-input` и `.app-sidebar` — их правила специфичны для экранов входа pathlogs.

Инлайн-скрипт темы в `layout.tsx` заменить на `themeScript()` из `@pathlogs/tokens`.

**Проверка:** приложение выглядит как раньше в обеих темах, переключатель работает без мигания при перезагрузке.

## Шаг 2. Хуки

Удалить `src/lib/dragScroll.ts`, `src/lib/dragScrollBinding.ts`, `src/components/useDragScroll.ts`, `src/lib/sections.ts` и соответствующие тесты — они переехали вместе с кодом.

Импорты `@/components/useDragScroll` → `@pathlogs/hooks`.

`Hotkeys.tsx` превращается в вызов:

```tsx
const hotkeys = [
  { keys: "g d", label: "Проекты (дашборд)", group: "Навигация", handler: () => router.push("/dashboard") },
  { keys: "g m", label: "Мои задачи", group: "Навигация", handler: () => router.push("/my") },
  { keys: "g n", label: "Уведомления", group: "Навигация", handler: () => router.push("/notifications") },
  { keys: "g p", label: "Профиль", group: "Навигация", handler: () => router.push("/profile") },
];

<HotkeysHelp hotkeys={hotkeys} hint="«g» — лидер: нажмите g, затем вторую клавишу." />
```

`HotkeysHelp` сам вызывает `useHotkeys` с этим списком и добавляет «?» — отдельная таблица для справки больше не нужна, разъехаться ей негде.

**Проверка:** доска листается протяжкой, края растворяются, `g d` работает, «?» показывает справку с теми же клавишами.

## Шаг 3. Примитивы

Удалить `ConfirmDialog.tsx`, `TooltipLayer.tsx`, `MoreMenu.tsx`, `ThemeToggle.tsx`, `AppShell.tsx`, `Markdown.tsx`, `DragScroll.tsx`, `task/EditableText.tsx`, `task/MentionTextarea.tsx`, `ProjectBackdrop.tsx`, `LiveBoard.tsx`, `UnreadBadge.tsx`, `CommandPalette.tsx`, `task/TaskSectionNav.tsx`.

Русские подписи, которые раньше были зашиты в компоненты, теперь передаются:

```tsx
<ConfirmDialog
  open={open}
  title="Удалить колонку?"
  confirmLabel="Удалить"
  cancelLabel="Отмена"
  pendingLabel="Выполняем…"
  onConfirm={remove}
  onCancel={() => setOpen(false)}
/>
```

Чтобы не повторять их в каждом вызове, удобно завести в приложении тонкие обёртки с готовыми русскими подписями — фреймворк на это не претендует.

`LiveBoard` распадается на две части:

```tsx
const { status, updatedAt } = useEventStream(`/api/projects/${projectId}/stream`, {
  events: ["change", "sync"],
  onEvent: () => router.refresh(),
});

<LiveIndicator
  status={status}
  updatedAt={updatedAt}
  locale="ru-RU"
  labels={{ live: "живые обновления", connecting: "подключаемся…", offline: "нет связи — обновления приостановлены", updated: "обновлено в {time}" }}
/>
```

`CommandPalette` получает роуты и поиск снаружи:

```tsx
<CommandPalette
  items={NAV.map((n) => ({ id: n.href, group: "Навигация", title: n.label, hint: n.keys, onSelect: () => router.push(n.href) }))}
  search={async (q) => {
    const { projects, tasks } = await searchAction(q);
    return [
      ...projects.map((p) => ({ id: `p:${p.id}`, group: "Проекты", title: p.name, badge: p.key, onSelect: () => router.push(`/projects/${p.id}`) })),
      ...tasks.map((t) => ({ id: `t:${t.id}`, group: "Задачи", title: t.title, badge: `${t.projectKey}-${t.number}`, onSelect: () => router.push(`/tasks/${t.id}`) })),
    ];
  }}
  labels={{ placeholder: "Поиск проектов, задач, разделов…", empty: "Ничего не найдено", navigate: "навигация", select: "открыть" }}
/>
```

Кнопка в сайдбаре больше не шлёт `window.dispatchEvent(new Event("cmdk:open"))` — вместо этого палитра управляется пропами `open`/`onOpenChange`.

**Проверка:** диалоги открываются из выпадающих меню и не закрываются вместе с ними, тултипы не обрезаются в колонках доски, ⌘K ищет.

## Шаг 4. Фильтры

```bash
npx pathlogs-ui add filter-bar
```

`lib/taskFilter.ts` заменяется описанием полей — например, в `lib/filterFields.ts`:

```ts
export const taskFilterFields: FilterField<TaskDTO>[] = [
  { key: "q", label: "Поиск", kind: "text", placeholder: "название или номер",
    matches: textMatcher((t) => [t.title, t.number]) },
  { key: "status", label: "Статус", kind: "select", anyLabel: "Любой",
    options: statusOptions, matches: equalsMatcher((t) => t.status) },
  { key: "type", label: "Тип", kind: "select", anyLabel: "Любой",
    options: typeOptions, matches: equalsMatcher((t) => t.type) },
  { key: "priority", label: "Приоритет", kind: "select", anyLabel: "Любой",
    options: priorityOptions, matches: equalsMatcher((t) => t.priority) },
  { key: "assignee", label: "Исполнитель", kind: "select", anyLabel: "Любой",
    options: memberOptions, matches: includesMatcher((t) => t.assignees) },
  { key: "tag", label: "Метка", kind: "select", anyLabel: "Любая",
    options: tagOptions, matches: includesMatcher((t) => t.tags) },
];
```

Формат строки запроса совпадает с прежним (`status=TODO&assignee=…`), поэтому **сохранённые фильтры в базе мигрировать не нужно** — они продолжат разбираться.

**Проверка:** сохранённый до перевода фильтр открывается и отбирает то же самое.

## Шаг 5. Доска

```bash
npx pathlogs-ui add kanban
```

Тело карточки — то, что сейчас внутри `KanbanBoard`, — переезжает в отдельный `TaskCard.tsx` приложения: номер, галочка «готово», бейджи, палитра цвета, аватары, метки. Это домен трекера, и он остаётся в приложении.

Сам вызов:

```tsx
<Kanban
  items={tasks}
  columns={columns}
  canManageColumns={canManageBoard}
  filter={filtering ? (t) => matchesFilter(taskFilterFields, filter, t) : undefined}
  renderCard={(task) => <TaskCard task={task} projectKey={projectKey} onToggleDone={toggleDone} />}
  onOpenItem={(task) => router.push(`/tasks/${task.id}`)}
  onMoveItem={(id, columnId, orderedIds) => moveTaskAction(id, columnId, orderedIds)}
  onReorderColumns={(ids) => reorderColumnsAction(projectId, ids)}
  onCreateColumn={(name, color) => createBoardColumnAction(projectId, name, color)}
  onUpdateColumn={(id, fields) => updateBoardColumnAction(id, fields)}
  onSetColumnHidden={setBoardColumnHiddenAction}
  onDeleteColumn={deleteBoardColumnAction}
  labels={RU_KANBAN_LABELS}
  toolbar={<BoardToolbar … />}
/>
```

Server actions менять не нужно: их сигнатуры уже совпадают с колбэками.

Две вещи, которые действительно отличаются от нынешнего кода:

1. **Колонка карточки.** Виджет читает `item.columnId` напрямую, а в pathlogs есть запасной путь: карточка без явной колонки показывается в колонке своего статуса. Этот вывод надо сделать до передачи в виджет — при формировании `TaskDTO` на сервере или в `useMemo` на клиенте.

2. **Отметка «Готово».** Быстрая галочка на карточке была частью доски, теперь она часть `TaskCard`. Логика та же: статус меняется, колонка остаётся прежней.

**Проверка:** карточка переносится между колонками и внутри колонки; слот встаёт там, где карточка окажется; отмена переноса Escape не теряет карточку; быстрые переносы подряд не откатываются.

## Шаг 6. Гант

```bash
npx pathlogs-ui add gantt
```

```tsx
<Gantt
  items={tasks}
  edges={links.filter((l) => l.type === "BLOCKS").map((l) => ({ fromId: l.fromId, toId: l.toId }))}
  renderLabel={(task) => (
    <>
      <span className="font-mono text-[11px] text-muted">{projectKey}-{task.number}</span>
      <TypeBadge type={task.type} />
      <span className="truncate">{task.title}</span>
    </>
  )}
  barColor={(task) => STATUS_COLORS[task.status]}
  onChangeDates={(id, dates) => updateTaskFieldsAction(id, dates)}
  onOpenItem={(task) => router.push(`/tasks/${task.id}`)}
  locale="ru-RU"
  labels={RU_GANTT_LABELS}
/>
```

Чего в виджете нет по сравнению с нынешним `GanttChart`: подсчёта заблокированных задач с перечислением блокеров. Это домен трекера — считайте его в приложении и показывайте над диаграммой.

**Проверка:** полосы двигаются и тянутся за края, даты сохраняются, критический путь совпадает с прежним.

## Шаг 7. Уборка

Удалить из `package.json` приложения то, что больше не нужно, и прогнать:

```bash
npm run lint && npm test && npm run build
```

Тесты `dragScroll.test.ts`, `dragScrollBinding.test.ts`, `sections.test.ts`, `taskFilter.test.ts` из pathlogs удаляются — их предмет переехал во фреймворк вместе с тестами.

---

## Что стоит знать заранее

**Оптимистичное состояние доски.** Виджет держит его сам и синхронизируется с props, когда все начатые действия завершились. Если приложение тоже будет держать копию — они разойдутся. Передавайте в `items` данные с сервера как есть.

**`onMoveItem` получает весь порядок колонки.** Не позицию, а полный список id. Так и в нынешнем `moveTaskAction`, менять ничего не нужно.

**Подписи.** У виджетов английские дефолты. Заведите константы `RU_KANBAN_LABELS`, `RU_GANTT_LABELS` в одном месте приложения, а не по месту вызова.

**Виджеты — ваш код.** После `add` они лежат в `src/components/ui/` и правятся как обычные файлы проекта. Обновление из реестра затирает правки, поэтому `add` без `--force` существующие файлы не трогает.
