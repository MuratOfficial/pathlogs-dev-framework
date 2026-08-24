"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  LiveIndicator,
  QueryInput,
  SlashTextarea,
  StatusBar,
  TagInput,
  UndoToaster,
  VirtualList,
  parseQuery,
  matchesQuery,
  type QueryField,
  type SlashCommand,
} from "@toimetdev/pathlogs-core";

// ── QueryInput ─────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  author: { id: string; name: string };
  labels: string[];
  priority: number;
}

const TASKS: Task[] = [
  { id: "t1", title: "Импорт падает на больших досках", status: "in_progress", author: { id: "u1", name: "Мурат" }, labels: ["bug"], priority: 4 },
  { id: "t2", title: "Живые обновления по SSE", status: "in_progress", author: { id: "u2", name: "Айгерим" }, labels: ["feature"], priority: 3 },
  { id: "t3", title: "Разбор Markdown в модуль", status: "open", author: { id: "u3", name: "Данияр" }, labels: ["refactor"], priority: 2 },
  { id: "t4", title: "WIP-лимиты у колонок", status: "done", author: { id: "u1", name: "Мурат" }, labels: ["feature", "ui"], priority: 2 },
  { id: "t5", title: "Тёмная тема мигает при загрузке", status: "open", author: { id: "u2", name: "Айгерим" }, labels: ["bug", "ui"], priority: 3 },
];

const FIELDS: QueryField<Task>[] = [
  { key: "status", label: "статус", type: "enum", options: [
    { value: "open", hint: "открыта" },
    { value: "in_progress", hint: "в работе" },
    { value: "done", hint: "готова" },
  ] },
  { key: "author", label: "автор", type: "text", get: (t) => t.author, options: [
    { value: "Мурат" }, { value: "Айгерим" }, { value: "Данияр" },
  ] },
  { key: "label", label: "метка", type: "enum", get: (t) => t.labels, options: [
    { value: "bug" }, { value: "feature" }, { value: "refactor" }, { value: "ui" },
  ] },
  { key: "priority", label: "приоритет", type: "number" },
];

export function QueryInputDemo() {
  const [query, setQuery] = useState("status:open label:bug");
  const shown = useMemo(() => {
    const parsed = parseQuery(query, FIELDS);
    return TASKS.filter((t) => matchesQuery(t, parsed, FIELDS, { text: (x) => x.title }));
  }, [query]);

  return (
    <div className="w-full max-w-lg">
      <QueryInput value={query} onChange={setQuery} fields={FIELDS} />
      <p className="mt-2 text-xs text-muted">
        Попробуйте <code>-status:done</code>, <code>priority:&gt;=3</code>, <code>author:Мурат</code>{" "}
        или свободное слово.
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {shown.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border border-edge bg-surface px-3 py-2 text-sm">
            <span className="flex-1 truncate">{t.title}</span>
            {t.labels.map((l) => (
              <Badge key={l}>{l}</Badge>
            ))}
          </li>
        ))}
        {shown.length === 0 && <li className="px-3 py-2 text-sm text-muted">Ничего не найдено.</li>}
      </ul>
    </div>
  );
}

// ── SlashTextarea ──────────────────────────────────────────

const COMMANDS: SlashCommand[] = [
  { id: "date", label: "Дата", hint: "вставить сегодня", icon: "📅", keywords: "date today" },
  { id: "check", label: "Чек-лист", hint: "- [ ] пункт", icon: "☑", keywords: "todo checkbox" },
  { id: "code", label: "Блок кода", hint: "```", icon: "⌘", keywords: "code snippet" },
  { id: "mention", label: "Упомянуть", hint: "@команда", icon: "@", keywords: "mention people" },
  { id: "divider", label: "Разделитель", hint: "———", icon: "—", keywords: "hr divider" },
];

export function SlashTextareaDemo() {
  const [value, setValue] = useState("Напишите «/» для команд…\n");
  return (
    <div className="w-full max-w-md">
      <SlashTextarea
        value={value}
        onValueChange={setValue}
        commands={COMMANDS}
        rows={5}
        placeholder="Комментарий…"
        onCommand={(cmd) => {
          if (cmd.id === "date") return new Date(2026, 7, 24).toLocaleDateString("ru-RU");
          if (cmd.id === "check") return "\n- [ ] ";
          if (cmd.id === "code") return "\n```\n\n```";
          if (cmd.id === "divider") return "\n———\n";
          if (cmd.id === "mention") return "@";
          return undefined;
        }}
      />
    </div>
  );
}

// ── TagInput ───────────────────────────────────────────────

export function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(["bug", "ui"]);
  const [rejected, setRejected] = useState<string | null>(null);
  return (
    <div className="w-full max-w-md">
      <TagInput
        value={tags}
        onChange={setTags}
        max={6}
        placeholder="Метка и Enter…"
        onReject={(v, reason) => {
          setRejected(reason === "duplicate" ? `«${v}» уже есть` : reason === "limit" ? "не больше шести" : `«${v}» не подходит`);
          setTimeout(() => setRejected(null), 1800);
        }}
      />
      <p className="mt-2 h-4 text-xs text-danger">{rejected}</p>
      <p className="text-xs text-muted">
        Вставьте <code>a, b; c</code> из буфера — разложится на отдельные метки, повторы отсеются.
      </p>
    </div>
  );
}

// ── UndoToaster ────────────────────────────────────────────

export function UndoToasterDemo() {
  const [items, setItems] = useState(["Импорт из Trello", "Отчёт по спринту", "Черновик релиза", "Старый бэклог"]);
  const [trash, setTrash] = useState<{ index: number; value: string }[]>([]);

  return (
    <UndoToaster<{ index: number; value: string }>
      placement="bottom"
      onUndo={(action) => {
        const p = action.payload!;
        setItems((prev) => {
          const next = [...prev];
          next.splice(p.index, 0, p.value);
          return next;
        });
        setTrash((t) => t.filter((x) => x.value !== p.value));
      }}
    >
      {({ notify }) => (
        <div className="w-full max-w-sm">
          <ul className="flex flex-col gap-1.5">
            {items.map((item, index) => (
              <li key={item} className="flex items-center justify-between gap-2 rounded-lg border border-edge bg-surface px-3 py-2 text-sm">
                <span>{item}</span>
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() => {
                    setItems((prev) => prev.filter((x) => x !== item));
                    setTrash((t) => [...t, { index, value: item }]);
                    notify({ label: "Удалено", mergeKey: "delete", payload: { index, value: item } });
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
            {items.length === 0 && <li className="px-3 py-2 text-sm text-muted">Список пуст.</li>}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Удалите несколько подряд — предложения отмены сольются в одно с счётчиком.
          </p>
        </div>
      )}
    </UndoToaster>
  );
}

// ── StatusBar ──────────────────────────────────────────────

export function StatusBarDemo() {
  const [width, setWidth] = useState(560);
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <input
        type="range"
        min={280}
        max={640}
        value={width}
        onChange={(e) => setWidth(Number(e.target.value))}
        className="w-full max-w-xs"
        aria-label="Ширина полосы"
      />
      <div className="overflow-hidden rounded-lg border border-edge" style={{ width }}>
        <StatusBar
          segments={[
            { id: "branch", content: <span>⎇ main</span>, priority: 5, align: "left" },
            { id: "sync", content: <span>↑2 ↓0</span>, priority: 2, align: "left", tip: "2 коммита к пушу" },
            { id: "problems", content: <span>⚠ 3 · ✕ 0</span>, priority: 4, align: "left" },
            { id: "conn", content: <LiveIndicator status="live" labels={{ live: "live" }} />, pinned: true, align: "right" },
            { id: "pos", content: <span>Стр 42, Кол 8</span>, priority: 1, align: "right" },
            { id: "enc", content: <span>UTF-8</span>, priority: 0, align: "right" },
            { id: "lang", content: <span>TypeScript</span>, priority: 3, align: "right" },
          ]}
        />
      </div>
      <p className="text-xs text-muted">Сужайте полосу — сегменты уходят по возрастанию важности, связь остаётся.</p>
    </div>
  );
}

// ── VirtualList ────────────────────────────────────────────

export function VirtualListDemo() {
  const rows = useMemo(
    () => Array.from({ length: 10_000 }, (_, i) => ({ id: i, title: `Событие #${i + 1}`, size: 30 + ((i * 37) % 60) })),
    []
  );
  return (
    <div className="w-full max-w-md">
      <VirtualList
        items={rows}
        itemKey={(r) => r.id}
        estimateSize={52}
        height={280}
        className="rounded-xl border border-edge bg-surface"
      >
        {(row) => (
          <div className="flex items-center gap-3 border-b border-edge/50 px-4" style={{ height: row.size }}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs tabular-nums text-muted">
              {row.id + 1}
            </span>
            <span className="text-sm">{row.title}</span>
          </div>
        )}
      </VirtualList>
      <p className="mt-2 text-xs text-muted">10 000 строк разной высоты — в DOM живёт только видимая горстка.</p>
    </div>
  );
}
