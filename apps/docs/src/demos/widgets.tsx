"use client";

import { useState } from "react";
import { Avatar, Badge, LevelMeter } from "@toimetdev/pathlogs-core";
import { Kanban, type KanbanColumn, type KanbanItem } from "@registry/kanban/Kanban";
import { Gantt } from "@registry/gantt/Gantt";
import { FilterBar } from "@registry/filter-bar/FilterBar";
import {
  emptyFilter,
  equalsMatcher,
  includesMatcher,
  matchesFilter,
  textMatcher,
  type FilterField,
} from "@registry/filter-bar/filterModel";

/**
 * Живые примеры виджетов реестра.
 *
 * Импортируются прямо из `registry/widgets` — то есть на сайте крутится
 * ровно тот код, который скопирует к себе пользователь. Расходиться
 * документации и реестру тут просто негде.
 */

interface Task extends KanbanItem {
  number: number;
  title: string;
  type: "FEATURE" | "BUG" | "REFACTOR";
  priority: 1 | 2 | 3 | 4;
  assignees: { id: string; name: string }[];
  startDate?: string | null;
  dueDate?: string | null;
  done?: boolean;
}

const TYPE_META = {
  FEATURE: { label: "Фича", color: "#6366f1" },
  BUG: { label: "Баг", color: "#ef4444" },
  REFACTOR: { label: "Рефакторинг", color: "#f59e0b" },
} as const;

const PRIORITY_META = {
  1: { label: "низкий", color: "#94a3b8" },
  2: { label: "средний", color: "#60a5fa" },
  3: { label: "высокий", color: "#f97316" },
  4: { label: "критический", color: "#ef4444" },
} as const;

const MEMBERS = [
  { id: "u1", name: "Мурат Тоймет" },
  { id: "u2", name: "Айгерим Сатпаева" },
  { id: "u3", name: "Данияр Ким" },
];

const COLUMNS: KanbanColumn[] = [
  { id: "todo", name: "К выполнению", color: "#94a3b8", order: 10 },
  { id: "doing", name: "В работе", color: "#60a5fa", order: 20, wipLimit: 2 },
  { id: "review", name: "На проверке", color: "#c084fc", order: 30 },
  { id: "done", name: "Готово", color: "#4ade80", order: 40, sort: "CREATED_DESC" },
];

const TASKS: Task[] = [
  {
    id: "t1", number: 12, title: "Импорт досок из Trello падает на больших проектах",
    type: "BUG", priority: 4, columnId: "doing", order: 0, createdAt: "2026-02-01",
    assignees: [MEMBERS[0]!], startDate: "2026-02-02", dueDate: "2026-02-09",
  },
  {
    id: "t2", number: 14, title: "Живые обновления доски по SSE",
    type: "FEATURE", priority: 3, columnId: "doing", order: 1, createdAt: "2026-02-03",
    assignees: [MEMBERS[1]!, MEMBERS[2]!], startDate: "2026-02-05", dueDate: "2026-02-14",
  },
  {
    id: "t3", number: 15, title: "Вынести разбор Markdown в отдельный модуль",
    type: "REFACTOR", priority: 2, columnId: "todo", order: 0, createdAt: "2026-02-04",
    assignees: [MEMBERS[2]!], startDate: "2026-02-10", dueDate: "2026-02-13",
  },
  {
    id: "t4", number: 16, title: "WIP-лимиты у колонок",
    type: "FEATURE", priority: 2, columnId: "todo", order: 1, createdAt: "2026-02-05",
    assignees: [MEMBERS[0]!], color: "#22d3ee", startDate: "2026-02-12", dueDate: "2026-02-16",
  },
  {
    id: "t5", number: 17, title: "Критический путь на диаграмме Ганта",
    type: "FEATURE", priority: 3, columnId: "review", order: 0, createdAt: "2026-02-06",
    assignees: [MEMBERS[1]!], startDate: "2026-02-14", dueDate: "2026-02-20",
  },
  {
    id: "t6", number: 9, title: "Тултипы обрезались в колонках доски",
    type: "BUG", priority: 1, columnId: "done", order: 0, createdAt: "2026-01-28",
    assignees: [MEMBERS[2]!], done: true, startDate: "2026-01-28", dueDate: "2026-02-01",
  },
];

const LINKS = [
  { fromId: "t1", toId: "t2" },
  { fromId: "t2", toId: "t5" },
  { fromId: "t3", toId: "t4" },
];

function TaskCard({ task }: { task: Task }) {
  const type = TYPE_META[task.type];
  const priority = PRIORITY_META[task.priority];

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted">UI-{task.number}</span>
        <Badge color={type.color}>{type.label}</Badge>
        <span className="ml-auto">
          <LevelMeter level={task.priority} color={priority.color} label={`Приоритет: ${priority.label}`} />
        </span>
      </div>
      <p className={`text-sm leading-snug ${task.done ? "text-muted line-through" : ""}`}>
        {task.title}
      </p>
      {task.assignees.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1">
          {task.assignees.map((a) => (
            <Avatar key={a.id} person={a} size="xs" />
          ))}
        </div>
      )}
    </>
  );
}

const KANBAN_LABELS = {
  addColumn: "Новая колонка",
  columnName: "Название",
  dragColumn: "Перетащите, чтобы переставить колонку",
  configureColumn: "Настроить колонку",
  renameHint: "Двойной клик — переименовать",
  deleteTitle: "Удалить колонку?",
  deleteMessage: "Карточки переедут в первую оставшуюся колонку.",
  hiddenColumns: "Скрытые колонки",
  restore: "вернуть",
  save: "Сохранить",
  cancel: "Отмена",
  hide: "Скрыть колонку",
  delete: "Удалить колонку",
  color: "Цвет",
  wipLimit: "WIP-лимит",
  wipLimitHint: "пусто — без лимита",
  cardOrder: "Порядок карточек",
  sortManual: "Вручную (перетаскиванием)",
  sortNewest: "Новые сверху",
  sortOldest: "Старые сверху",
};

export function KanbanDemo() {
  const [items, setItems] = useState<Task[]>(TASKS);
  const [columns, setColumns] = useState<KanbanColumn[]>(COLUMNS);

  return (
    <div className="h-[30rem] w-full">
      <Kanban<Task, KanbanColumn>
        items={items}
        columns={columns}
        canManageColumns
        aria-label="Демонстрационная доска"
        labels={KANBAN_LABELS}
        renderCard={(task) => <TaskCard task={task} />}
        // В настоящем приложении здесь были бы server actions.
        // Виджет уже применил изменение оптимистично — нам остаётся
        // сохранить его у себя.
        onMoveItem={(id, columnId, orderedIds) => {
          setItems((prev) =>
            prev.map((t) => {
              const at = orderedIds.indexOf(t.id);
              return at === -1 ? t : { ...t, columnId, order: at };
            })
          );
        }}
        onReorderColumns={(ids) => {
          setColumns((prev) => prev.map((c) => ({ ...c, order: (ids.indexOf(c.id) + 1) * 10 })));
        }}
        onCreateColumn={(name, color) => {
          setColumns((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name, color, order: (prev.length + 1) * 10 },
          ]);
        }}
        onUpdateColumn={(id, fields) => {
          setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
        }}
        onSetColumnHidden={(id, hidden) => {
          setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, hidden } : c)));
        }}
        onDeleteColumn={(id) => setColumns((prev) => prev.filter((c) => c.id !== id))}
      />
    </div>
  );
}

export function GanttDemo() {
  const [items, setItems] = useState<Task[]>(TASKS);

  return (
    <div className="h-[24rem] w-full">
      <Gantt<Task>
        items={items}
        edges={LINKS}
        locale="ru-RU"
        labels={{
          header: "Задача · тяните полосу и края",
          today: "Сегодня",
          criticalPath: "Критический путь",
          links: "Зависимостей",
          region: "Диаграмма Ганта: стрелки прокручивают, Home и End — к краям",
          empty: "Нет задач с датами.",
        }}
        renderLabel={(task) => (
          <>
            <span className="shrink-0 font-mono text-[11px] text-muted">UI-{task.number}</span>
            <span className="truncate">{task.title}</span>
          </>
        )}
        barColor={(task) => TYPE_META[task.type].color}
        onChangeDates={(id, dates) => {
          setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...dates } : t)));
        }}
      />
    </div>
  );
}

const FILTER_FIELDS: FilterField<Task>[] = [
  {
    key: "q",
    label: "Поиск",
    kind: "text",
    placeholder: "название или номер",
    matches: textMatcher<Task>((t) => [t.title, t.number]),
  },
  {
    key: "type",
    label: "Тип",
    kind: "select",
    anyLabel: "Любой",
    options: Object.entries(TYPE_META).map(([value, m]) => ({ value, label: m.label })),
    matches: equalsMatcher<Task>((t) => t.type),
  },
  {
    key: "assignee",
    label: "Исполнитель",
    kind: "select",
    anyLabel: "Любой",
    options: MEMBERS.map((m) => ({ value: m.id, label: m.name })),
    matches: includesMatcher<Task>((t) => t.assignees),
  },
];

export function FilterBarDemo() {
  const [filter, setFilter] = useState(emptyFilter(FILTER_FIELDS));
  const matched = TASKS.filter((t) => matchesFilter(FILTER_FIELDS, filter, t));

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-edge bg-surface p-4">
        <FilterBar
          fields={FILTER_FIELDS}
          value={filter}
          onChange={setFilter}
          matchedCount={matched.length}
          totalCount={TASKS.length}
          savedFilters={[
            { id: "f1", name: "Только баги", query: "type=BUG" },
            { id: "f2", name: "Мои задачи", query: "assignee=u1" },
          ]}
          labels={{
            reset: "Сбросить",
            save: "Сохранить фильтр",
            presets: "Сохранённые",
            matched: "{matched} из {total}",
            cancel: "Отмена",
            deleteTitle: "Удалить сохранённый фильтр?",
            savePrompt: "Название фильтра",
          }}
          onSaveFilter={() => {}}
          onDeleteFilter={() => {}}
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {matched.length === 0 ? (
          <li className="rounded-lg border border-dashed border-edge p-4 text-center text-sm text-muted">
            Под фильтр ничего не подошло
          </li>
        ) : (
          matched.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2.5 rounded-lg border border-edge bg-surface px-3 py-2 text-sm"
            >
              <span className="font-mono text-[11px] text-muted">UI-{task.number}</span>
              <Badge color={TYPE_META[task.type].color}>{TYPE_META[task.type].label}</Badge>
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              {task.assignees.map((a) => (
                <Avatar key={a.id} person={a} size="xs" />
              ))}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
