"use client";

import { useEffect, useMemo, useState } from "react";
import { LogStream } from "@registry/log-stream/LogStream";
import type { LogLine } from "@registry/log-stream/logBuffer";
import { TreeView } from "@registry/tree-view/TreeView";
import type { TreeNodeOf } from "@registry/tree-view/treeModel";
import { DiffView } from "@registry/diff-view/DiffView";
import { DependencyGraph } from "@registry/dep-graph/DependencyGraph";
import { FlowCanvas, type FlowNode } from "@registry/flow-canvas/FlowCanvas";
import { DashboardGrid } from "@registry/dashboard-grid/DashboardGrid";
import type { GridItem } from "@registry/dashboard-grid/gridLayout";
import { PresenceLayer } from "@registry/presence-layer/PresenceLayer";
import type { PresenceEvent } from "@registry/presence-layer/presence";

const E = String.fromCharCode(27); // ESC для ANSI

// ── LogStream ──────────────────────────────────────────────

const RAW: [string, LogLine["level"]?][] = [
  [`${E}[2m12:04:01${E}[0m ${E}[32minfo${E}[0m  сборка запущена`, "info"],
  [`${E}[2m12:04:02${E}[0m ${E}[32minfo${E}[0m  разрешение зависимостей…`, "info"],
  [`${E}[2m12:04:05${E}[0m ${E}[34mdebug${E}[0m кэш попал в 128 из 130 модулей`, "debug"],
  [`${E}[2m12:04:06${E}[0m ${E}[33mwarn${E}[0m  пакет ${E}[1mleft-pad${E}[0m помечен устаревшим`, "warn"],
  [`${E}[2m12:04:08${E}[0m ${E}[32minfo${E}[0m  компиляция TypeScript`, "info"],
  [`${E}[2m12:04:12${E}[0m ${E}[31merror${E}[0m ${E}[1mTS2304${E}[0m: не найдено имя «ReactNode»`, "error"],
  [`${E}[2m12:04:12${E}[0m ${E}[31merror${E}[0m   в src/panel/View.tsx:182`, "error"],
  [`${E}[2m12:04:13${E}[0m ${E}[33mwarn${E}[0m  сборка продолжена с ошибками типов`, "warn"],
];

export function LogStreamDemo() {
  const lines = useMemo<LogLine[]>(() => {
    // Размножаем базовый набор в длинный лог, чтобы показать виртуализацию
    const out: LogLine[] = [];
    for (let i = 0; i < 500; i += 1) {
      const [text, level] = RAW[i % RAW.length]!;
      out.push({ seq: i, text, ...(level ? { level } : {}) });
    }
    return out;
  }, []);

  return <LogStream lines={lines} height={320} follow={false} className="w-full" />;
}

// ── TreeView ───────────────────────────────────────────────

interface FileNode extends TreeNodeOf<FileNode> {
  id: string;
  name: string;
  kind: "dir" | "file";
  children?: FileNode[];
}

const TREE: FileNode[] = [
  {
    id: "src", name: "src", kind: "dir",
    children: [
      { id: "index", name: "index.ts", kind: "file" },
      {
        id: "components", name: "components", kind: "dir",
        children: [
          { id: "Button", name: "Button.tsx", kind: "file" },
          { id: "Dialog", name: "Dialog.tsx", kind: "file" },
          { id: "Menu", name: "Menu.tsx", kind: "file" },
        ],
      },
      {
        id: "hooks", name: "hooks", kind: "dir",
        children: [
          { id: "useTheme", name: "useTheme.ts", kind: "file" },
          { id: "useVirtual", name: "useVirtual.ts", kind: "file" },
        ],
      },
    ],
  },
  { id: "readme", name: "README.md", kind: "file" },
  { id: "pkg", name: "package.json", kind: "file" },
];

export function TreeViewDemo() {
  const [nodes, setNodes] = useState(TREE);
  const [expanded, setExpanded] = useState(new Set(["src", "components"]));
  const [checked, setChecked] = useState<Set<string>>(new Set());

  return (
    <div className="w-full max-w-sm rounded-xl border border-edge bg-surface p-2">
      <TreeView
        nodes={nodes}
        expanded={expanded}
        onExpandedChange={setExpanded}
        checkable
        checked={checked}
        onCheckedChange={setChecked}
        onMove={(next) => setNodes(next)}
        renderIcon={(node, open) => (
          <span>{node.kind === "dir" ? (open ? "📂" : "📁") : "📄"}</span>
        )}
        renderLabel={(node) => <span className={node.kind === "dir" ? "font-medium" : ""}>{node.name}</span>}
      />
      <p className="mt-2 px-2 text-xs text-muted">
        Стрелки — навигация, пробел — галочка, перетаскивание меняет вложенность.
      </p>
    </div>
  );
}

// ── DiffView ───────────────────────────────────────────────

const BEFORE = `export function greet(name) {
  const msg = "Привет, " + name;
  console.log(msg);
  return msg;
}`;

const AFTER = `export function greet(name: string) {
  const msg = \`Привет, \${name}!\`;
  return msg;
}`;

export function DiffViewDemo() {
  const [mode, setMode] = useState<"unified" | "split">("unified");
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex gap-1">
        {(["unified", "split"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              mode === m ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {m === "unified" ? "Построчно" : "Две колонки"}
          </button>
        ))}
      </div>
      <DiffView before={BEFORE} after={AFTER} mode={mode} filename="greet.ts" />
    </div>
  );
}

// ── DependencyGraph ────────────────────────────────────────

interface GraphTask {
  id: string;
  number: number;
  title: string;
  status: "done" | "doing" | "todo";
}

const GRAPH_NODES: GraphTask[] = [
  { id: "n1", number: 1, title: "Схема БД", status: "done" },
  { id: "n2", number: 2, title: "Миграции", status: "done" },
  { id: "n3", number: 3, title: "API задач", status: "doing" },
  { id: "n4", number: 4, title: "API досок", status: "doing" },
  { id: "n5", number: 5, title: "Доска UI", status: "todo" },
  { id: "n6", number: 6, title: "Живые обновления", status: "todo" },
  { id: "n7", number: 7, title: "Релиз", status: "todo" },
];

const GRAPH_EDGES = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n3", to: "n5" },
  { from: "n4", to: "n5" },
  { from: "n3", to: "n6" },
  { from: "n5", to: "n7" },
  { from: "n6", to: "n7" },
];

const STATUS_DOT: Record<GraphTask["status"], string> = {
  done: "#22c55e",
  doing: "#60a5fa",
  todo: "#94a3b8",
};

export function DependencyGraphDemo() {
  return (
    <DependencyGraph
      nodes={GRAPH_NODES}
      edges={GRAPH_EDGES}
      className="w-full"
      renderNode={(node) => (
        <span className="flex h-full items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_DOT[node.status] }} />
          <span className="font-mono text-[11px] text-muted">#{node.number}</span>
          <span className="truncate">{node.title}</span>
        </span>
      )}
    />
  );
}

// ── FlowCanvas ─────────────────────────────────────────────

interface CanvasNode extends FlowNode {
  id: string;
  label: string;
  tone: string;
}

export function FlowCanvasDemo() {
  const [nodes, setNodes] = useState<CanvasNode[]>([
    { id: "src", x: 40, y: 60, label: "Источник", tone: "#6366f1" },
    { id: "map", x: 260, y: 40, label: "Преобразование", tone: "#22d3ee" },
    { id: "filter", x: 260, y: 160, label: "Фильтр", tone: "#f59e0b" },
    { id: "sink", x: 480, y: 100, label: "Приёмник", tone: "#22c55e" },
  ]);

  return (
    <FlowCanvas
      nodes={nodes}
      onNodesChange={(n) => setNodes(n as CanvasNode[])}
      edges={[
        { from: "src", to: "map" },
        { from: "src", to: "filter" },
        { from: "map", to: "sink" },
        { from: "filter", to: "sink" },
      ]}
      height={360}
      className="w-full"
      renderNode={(node) => (
        <div className="flex h-full flex-col justify-center gap-1 px-3">
          <span className="h-1.5 w-8 rounded-full" style={{ background: node.tone }} />
          <span className="text-sm font-medium">{node.label}</span>
        </div>
      )}
    />
  );
}

// ── DashboardGrid ──────────────────────────────────────────

const TILE_META: Record<string, { title: string; body: string; tone: string }> = {
  velocity: { title: "Скорость", body: "34 sp", tone: "#6366f1" },
  open: { title: "Открытых задач", body: "18", tone: "#f59e0b" },
  burn: { title: "Сгорание", body: "62%", tone: "#22c55e" },
  team: { title: "Команда", body: "5 человек", tone: "#22d3ee" },
  notes: { title: "Заметки", body: "Релиз в пятницу", tone: "#a855f7" },
};

export function DashboardGridDemo() {
  const [items, setItems] = useState<GridItem[]>([
    { id: "velocity", x: 0, y: 0, w: 3, h: 2 },
    { id: "open", x: 3, y: 0, w: 3, h: 1 },
    { id: "burn", x: 3, y: 1, w: 3, h: 1 },
    { id: "team", x: 6, y: 0, w: 3, h: 1 },
    { id: "notes", x: 6, y: 1, w: 6, h: 1 },
  ]);

  return (
    <div className="w-full max-w-2xl">
      <DashboardGrid items={items} onItemsChange={setItems} columns={12} rowHeight={72}>
        {(item) => {
          const meta = TILE_META[item.id]!;
          return (
            <div className="flex h-full flex-col justify-between p-3">
              <span className="text-xs text-muted">{meta.title}</span>
              <span className="text-xl font-semibold" style={{ color: meta.tone }}>
                {meta.body}
              </span>
            </div>
          );
        }}
      </DashboardGrid>
      <p className="mt-2 text-xs text-muted">Тащите плитки и тяните за нижний правый угол — соседи расступаются, сетка оседает.</p>
    </div>
  );
}

// ── PresenceLayer ──────────────────────────────────────────

export function PresenceLayerDemo() {
  // Заранее заготовленный поток: три курсора ходят по кругу
  const events = useMemo<PresenceEvent[]>(() => {
    const people = [
      { id: "u2", name: "Айгерим" },
      { id: "u3", name: "Данияр" },
      { id: "u4", name: "Ольга" },
    ];
    const out: PresenceEvent[] = [];
    for (let step = 0; step < 60; step += 1) {
      const t = Date.now() + step * 400;
      people.forEach((p, i) => {
        const a = (step / 12) + (i * Math.PI * 2) / 3;
        out.push({
          actorId: p.id,
          name: p.name,
          at: t,
          cursor: { x: 200 + Math.cos(a) * 120, y: 130 + Math.sin(a) * 80 },
        });
      });
    }
    return out;
  }, []);

  // Проигрываем поток по кадрам, чтобы показать сглаживание вживую
  const [cut, setCut] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setCut((c) => (c >= events.length ? 3 : c + 3)), 400);
    return () => clearInterval(id);
  }, [events.length]);

  return (
    <div className="relative h-[280px] w-full max-w-xl overflow-hidden rounded-xl border border-edge bg-surface-2/40">
      <div className="grid h-full place-items-center text-sm text-muted">
        Общая поверхность
      </div>
      <PresenceLayer events={events.slice(0, cut)} />
    </div>
  );
}
