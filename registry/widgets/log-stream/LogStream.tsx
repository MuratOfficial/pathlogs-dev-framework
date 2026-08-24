"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useVirtual } from "@toimetdev/pathlogs-hooks";
import { parseAnsi } from "./ansi";
import {
  compileQuery,
  countByLevel,
  filterLines,
  matchRanges,
  LOG_LEVELS,
  type LogFilter,
  type LogLevel,
  type LogLine,
} from "./logBuffer";

export interface LogStreamProps {
  lines: LogLine[];
  /** Высота области прокрутки. */
  height?: number | string;
  /** Прилипать к концу при новых строках. По умолчанию да. */
  follow?: boolean;
  /** Панель фильтров сверху. По умолчанию да. */
  toolbar?: boolean;
  /** Показывать номера строк. */
  lineNumbers?: boolean;
  /** Перенос длинных строк вместо горизонтальной прокрутки. */
  wrap?: boolean;
  /** Клик по строке — например, чтобы открыть источник. */
  onSelectLine?: (line: LogLine) => void;
  className?: string;
}

const LEVEL_COLOR: Record<LogLevel, string> = {
  trace: "#64748b",
  debug: "#8b5cf6",
  info: "#3b82f6",
  warn: "#f59e0b",
  error: "#ef4444",
  fatal: "#e11d48",
};

/**
 * Поток логов: ANSI-цвета, фильтр по уровню и подстроке, follow-tail.
 *
 * Фреймворк называется pathlogs, а вывода логов в нём не было. Строки
 * виртуализированы — CI-лог на десятки тысяч строк рисуется только видимой
 * частью. Разбор ANSI, буфер и фильтры — в `ansi.ts` и `logBuffer.ts` под
 * тестами; здесь окно, подсветка совпадений и панель.
 */
export function LogStream({
  lines,
  height = 420,
  follow = true,
  toolbar = true,
  lineNumbers = true,
  wrap = false,
  onSelectLine,
  className,
}: LogStreamProps) {
  const [filter, setFilter] = useState<LogFilter>({});
  const [query, setQuery] = useState("");

  const activeFilter = useMemo<LogFilter>(() => ({ ...filter, query }), [filter, query]);
  const shown = useMemo(() => filterLines(lines, activeFilter), [lines, activeFilter]);
  const matcher = useMemo(() => compileQuery(query), [query]);
  const counts = useMemo(() => countByLevel(lines), [lines]);

  const v = useVirtual({
    count: shown.length,
    estimateSize: wrap ? 40 : 22,
    overscan: 12,
    stickToBottom: follow,
  });

  function toggleLevel(level: LogLevel) {
    setFilter((f) => {
      const set = new Set(f.levels ?? []);
      if (set.has(level)) set.delete(level);
      else set.add(level);
      return { ...f, levels: [...set] };
    });
  }

  const activeLevels = new Set(filter.levels ?? []);

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-edge bg-[#0b0f1a] ${className ?? ""}`}>
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-edge bg-surface-2/40 px-2.5 py-2">
          <div className="relative flex-1 min-w-[8rem]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по логу…"
              className="w-full rounded-md border border-edge bg-surface px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-1">
            {LOG_LEVELS.map((level) => {
              const on = activeLevels.size === 0 || activeLevels.has(level);
              const n = counts[level];
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleLevel(level)}
                  aria-pressed={activeLevels.has(level)}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide transition ${
                    on ? "opacity-100" : "opacity-35"
                  }`}
                  style={{ color: LEVEL_COLOR[level] }}
                  title={`${level}: ${n}`}
                >
                  {level}
                  {n > 0 && <span className="ml-1 tabular-nums opacity-70">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        ref={v.scrollRef}
        className="relative min-h-0 flex-1 overflow-auto font-mono text-[12px] leading-[18px]"
        style={{ height }}
        role="log"
        aria-label="Поток логов"
      >
        <div style={{ height: v.totalSize, position: "relative", width: "100%" }}>
          {v.items.map((row) => {
            const line = shown[row.index]!;
            const ranges = matchRanges(line.text, matcher);
            return (
              <div
                key={line.seq}
                ref={v.measure(row.index)}
                onClick={onSelectLine ? () => onSelectLine(line) : undefined}
                className={`flex gap-2 px-2.5 hover:bg-white/[0.03] ${
                  onSelectLine ? "cursor-pointer" : ""
                } ${wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}
                style={{ position: "absolute", top: row.start, left: 0, width: "100%" }}
              >
                {lineNumbers && (
                  <span className="select-none text-right text-white/25 tabular-nums" style={{ width: "3.5ch" }}>
                    {line.seq + 1}
                  </span>
                )}
                {line.level && (
                  <span
                    className="select-none font-semibold uppercase"
                    style={{ color: LEVEL_COLOR[line.level], width: "3.5ch" }}
                  >
                    {line.level.slice(0, 3)}
                  </span>
                )}
                <span className="min-w-0 flex-1 text-[#cbd5e1]">
                  <LineContent text={line.text} ranges={ranges} />
                </span>
              </div>
            );
          })}
        </div>

        {shown.length === 0 && (
          <div className="grid h-full place-items-center text-xs text-white/40">Нет строк под фильтр.</div>
        )}
      </div>

      {follow && !v.atBottom && (
        <button
          type="button"
          onClick={v.scrollToBottom}
          className="absolute bottom-3 right-4 rounded-full border border-edge bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-lg hover:border-accent"
        >
          ↓ К концу
        </button>
      )}
    </div>
  );
}

/** Красит ANSI-сегменты и подсвечивает совпадения поиска поверх них. */
function LineContent({ text, ranges }: { text: string; ranges: [number, number][] }) {
  const spans = parseAnsi(text);

  // Без подсветки — только ANSI-куски
  if (ranges.length === 0) {
    return (
      <>
        {spans.map((s, i) => (
          <span key={i} style={styleOf(s)}>
            {s.text}
          </span>
        ))}
      </>
    );
  }

  // С подсветкой отрисовываем плоским текстом с жёлтыми вставками: наложить
  // поиск на цветные куски точь-в-точь сложно, а читаемость поиска важнее
  const out: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], i) => {
    if (start > at) out.push(<span key={`t${i}`}>{text.slice(at, start)}</span>);
    out.push(
      <mark key={`m${i}`} className="rounded-sm bg-amber-400/40 text-inherit">
        {text.slice(start, end)}
      </mark>
    );
    at = end;
  });
  if (at < text.length) out.push(<span key="tail">{text.slice(at)}</span>);
  return <>{out}</>;
}

function styleOf(span: ReturnType<typeof parseAnsi>[number]): CSSProperties {
  return {
    color: span.fg,
    backgroundColor: span.bg,
    fontWeight: span.bold ? 700 : undefined,
    fontStyle: span.italic ? "italic" : undefined,
    textDecoration: span.underline ? "underline" : undefined,
    opacity: span.dim ? 0.6 : undefined,
  };
}
