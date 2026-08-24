"use client";

import { useMemo, useState } from "react";
import {
  ActivityTimeline,
  Badge,
  HeatmapCalendar,
  Sparkline,
  TimeRangePicker,
  isoDay,
  trailingRange,
  type ActivityEventLike,
  type TimeRange,
} from "@toimetdev/pathlogs-core";

/**
 * Живые примеры для страниц с данными и временем.
 *
 * Данные детерминированные — генерируются из фиксированного зерна, — чтобы
 * сайт при сборке выглядел одинаково и превью не «дрожало» между рендерами.
 */

/** Простой детерминированный генератор: одинаковые графики при каждой сборке. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ── Sparkline ──────────────────────────────────────────────

const COMMITS = [4, 6, 5, 9, 7, 11, 8, 12, 10, 14, 9, 16, 13, 18];
const LATENCY = [120, 118, 125, 140, 240, 138, 130, 128, 135, 126];
const BURN = [80, 76, 74, 70, 66, 61, 58, 50, 44, 39, 30, 22, 14, 6];

export function SparklineDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Row label="Коммиты за 2 недели" trend="+18%">
        <Sparkline values={COMMITS} width={130} height={30} fill dots color="var(--accent)" />
      </Row>
      <Row label="Задержка ответа, мс" trend="выброс">
        <Sparkline values={LATENCY} width={130} height={30} extremes color="var(--warning)" />
      </Row>
      <Row label="Остаток работ" trend="−92%">
        <Sparkline values={BURN} width={130} height={30} smooth fill color="var(--success)" />
      </Row>
    </div>
  );
}

function Row({ label, trend, children }: { label: string; trend: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-edge bg-surface px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {children}
        <Badge>{trend}</Badge>
      </div>
    </div>
  );
}

/** Спарклайн прямо в строке таблицы — типичное место применения. */
export function SparklineTableDemo() {
  const rng = useMemo(() => seeded(7), []);
  const rows = useMemo(
    () =>
      ["auth", "billing", "search", "notifications"].map((name) => ({
        name,
        series: Array.from({ length: 20 }, () => Math.round(40 + rng() * 60)),
      })),
    [rng]
  );
  return (
    <table className="w-full max-w-sm border-collapse text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-b border-edge/60 last:border-0">
            <td className="py-2 font-mono text-xs text-muted">{row.name}</td>
            <td className="py-2 text-right tabular-nums">{row.series.at(-1)}</td>
            <td className="py-2 pl-4">
              <Sparkline values={row.series} width={90} height={22} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── HeatmapCalendar ────────────────────────────────────────

export function HeatmapDemo() {
  const values = useMemo(() => {
    const rng = seeded(42);
    const range = trailingRange(new Date(2026, 7, 24), 365);
    const out: Record<string, number> = {};
    for (let d = new Date(range.from); d <= range.to; d.setDate(d.getDate() + 1)) {
      const weekday = d.getDay();
      // По выходным активности меньше — так карта похожа на настоящую
      const base = weekday === 0 || weekday === 6 ? 0.25 : 0.8;
      if (rng() < base) out[isoDay(d)] = Math.floor(rng() * 12) + 1;
    }
    return out;
  }, []);

  return (
    <HeatmapCalendar
      values={values}
      to={new Date(2026, 7, 24)}
      color="var(--accent)"
      legend
      summary
      locale="ru-RU"
    />
  );
}

// ── ActivityTimeline ───────────────────────────────────────

interface Activity extends ActivityEventLike {
  actor: string;
  text: string;
}

const NOW = new Date(2026, 7, 24, 15, 0, 0);

function ago(minutes: number): string {
  return new Date(NOW.getTime() - minutes * 60_000).toISOString();
}

const FEED: Activity[] = [
  { id: "a1", at: ago(8), kind: "comment", actorId: "u1", actor: "Мурат", text: "Добавил обработку таймаута в импорт" },
  { id: "a2", at: ago(22), kind: "status", actorId: "u2", actor: "Айгерим", text: "перевела UI-14 в «На проверке»" },
  { id: "a3", at: ago(24), kind: "status", actorId: "u2", actor: "Айгерим", text: "перевела UI-12 в «В работе»" },
  { id: "a4", at: ago(26), kind: "status", actorId: "u2", actor: "Айгерим", text: "перевела UI-9 в «Готово»" },
  { id: "a5", at: ago(28), kind: "status", actorId: "u2", actor: "Айгерим", text: "перевела UI-7 в «Готово»" },
  { id: "a6", at: ago(95), kind: "comment", actorId: "u3", actor: "Данияр", text: "Вынес разбор Markdown в отдельный модуль" },
  { id: "a7", at: ago(60 * 26), kind: "comment", actorId: "u1", actor: "Мурат", text: "Открыл задачу про WIP-лимиты" },
  { id: "a8", at: ago(60 * 27), kind: "assign", actorId: "u1", actor: "Мурат", text: "назначил Данияра на UI-15" },
];

const KIND_META: Record<string, { color: string; icon: string }> = {
  comment: { color: "#6366f1", icon: "💬" },
  status: { color: "#22c55e", icon: "✓" },
  assign: { color: "#f59e0b", icon: "@" },
};

export function ActivityTimelineDemo() {
  return (
    <div className="w-full max-w-md">
      <ActivityTimeline
        events={FEED}
        now={NOW}
        locale="ru-RU"
        renderIcon={(e) => <span>{KIND_META[e.kind]?.icon}</span>}
        renderEvent={(e) => (
          <span>
            <b className="font-semibold">{e.actor}</b> {e.text}
          </span>
        )}
        renderBurst={(events) => (
          <span>
            <b className="font-semibold">{(events[0] as Activity).actor}</b> обновил статусы задач
          </span>
        )}
      />
    </div>
  );
}

// ── TimeRangePicker ────────────────────────────────────────

export function TimeRangeDemo() {
  const [range, setRange] = useState<TimeRange>({ from: "now-24h", to: "now" });
  return (
    <div className="flex flex-col items-center gap-4">
      <TimeRangePicker value={range} onChange={setRange} locale="ru-RU" now={NOW} />
      <code className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-muted">
        {`{ from: "${range.from}", to: "${range.to}" }`}
      </code>
    </div>
  );
}
