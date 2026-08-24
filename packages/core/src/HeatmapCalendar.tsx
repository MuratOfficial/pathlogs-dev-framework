import { useMemo, type ReactNode } from "react";
import { cn } from "./cn.js";
import {
  activityStreaks,
  buildHeatmap,
  trailingRange,
  type HeatmapCell,
} from "./heatmapGrid.js";

export interface HeatmapCalendarProps {
  /** Значения по дням: `{ "2026-02-14": 3 }`. Отсутствующий день — ноль. */
  values: Record<string, number>;
  /** Начало интервала. По умолчанию — 365 дней назад от `to`. */
  from?: Date;
  /** Конец интервала. По умолчанию — сегодня. */
  to?: Date;
  /** Сколько уровней цвета, не считая пустого. */
  levels?: number;
  /** Базовый цвет: уровни — это он с растущей непрозрачностью. */
  color?: string;
  /** Сторона клетки в пикселях. */
  cellSize?: number;
  /** С какого дня начинается неделя: 1 — понедельник. */
  weekStart?: number;
  locale?: string;
  /** Подпись клетки: по умолчанию «дата: N». */
  title?: (cell: HeatmapCell) => string;
  onSelectDay?: (cell: HeatmapCell) => void;
  /** Показать легенду «меньше → больше» под сеткой. */
  legend?: boolean;
  /** Показать сводку: всего, активных дней, серия. */
  summary?: boolean;
  className?: string;
}

const GAP = 3;

/**
 * Календарная теплокарта года — сетка недель, как график вкладов на GitHub.
 *
 * Раскладка, пороги уровней и серии активных дней посчитаны в
 * `heatmapGrid.ts` и проверены тестами. Здесь — SVG-сетка и подписи.
 */
export function HeatmapCalendar({
  values,
  from,
  to,
  levels = 4,
  color = "var(--accent)",
  cellSize = 12,
  weekStart = 1,
  locale = "ru-RU",
  title,
  onSelectDay,
  legend = false,
  summary = false,
  className,
}: HeatmapCalendarProps) {
  const range = useMemo(() => {
    if (from && to) return { from, to };
    const now = to ?? new Date();
    return from ? { from, to: now } : trailingRange(now, 365);
  }, [from, to]);

  const grid = useMemo(
    () => buildHeatmap(values, { ...range, weekStart, levels, locale }),
    [values, range, weekStart, levels, locale]
  );

  const streaks = useMemo(() => activityStreaks(grid), [grid]);

  const step = cellSize + GAP;
  const chartWidth = grid.weeks.length * step;
  const chartHeight = 7 * step;
  const labelW = 30;
  const monthH = 16;

  const defaultTitle = (cell: HeatmapCell) =>
    `${cell.date.toLocaleDateString(locale, { day: "numeric", month: "long" })}: ${cell.value}`;

  return (
    <div className={cn("pl-heatmap", className)}>
      <div className="pl-heatmap__scroll">
        <svg
          width={labelW + chartWidth}
          height={monthH + chartHeight}
          role="img"
          aria-label={`Активность: ${grid.total} за ${grid.activeDays} дней`}
        >
          {grid.months.map((m) => (
            <text
              key={`${m.label}-${m.column}`}
              x={labelW + m.column * step}
              y={11}
              className="pl-heatmap__month"
            >
              {m.label}
            </text>
          ))}

          {[1, 3, 5].map((row) => (
            <text key={row} x={0} y={monthH + row * step + cellSize - 2} className="pl-heatmap__day">
              {grid.weekdays[row]}
            </text>
          ))}

          {grid.weeks.map((week, col) =>
            week.map((cell, row) =>
              cell.inRange ? (
                <rect
                  key={cell.iso}
                  x={labelW + col * step}
                  y={monthH + row * step}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  className={cn("pl-heatmap__cell", onSelectDay && "pl-heatmap__cell--clickable")}
                  style={cellStyle(cell.level, levels, color)}
                  onClick={onSelectDay ? () => onSelectDay(cell) : undefined}
                >
                  <title>{(title ?? defaultTitle)(cell)}</title>
                </rect>
              ) : null
            )
          )}
        </svg>
      </div>

      {legend && (
        <div className="pl-heatmap__legend">
          <span>меньше</span>
          {Array.from({ length: levels + 1 }, (_, l) => (
            <span key={l} className="pl-heatmap__swatch" style={cellStyle(l, levels, color)} />
          ))}
          <span>больше</span>
        </div>
      )}

      {summary && (
        <div className="pl-heatmap__summary">
          <Stat value={grid.total} label="всего" />
          <Stat value={grid.activeDays} label="активных дней" />
          <Stat value={streaks.longest} label="лучшая серия" />
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: ReactNode }) {
  return (
    <span className="pl-heatmap__stat">
      <b>{value}</b> {label}
    </span>
  );
}

/**
 * Цвет уровня: базовый цвет с растущей непрозрачностью через color-mix.
 *
 * Один цвет и прозрачность вместо готовой палитры из N оттенков: так карта
 * перекрашивается сменой одной переменной и остаётся согласованной с темой.
 */
function cellStyle(level: number, levels: number, color: string) {
  if (level <= 0) return { fill: "var(--surface-2)" };
  const pct = Math.round((level / levels) * 100);
  return { fill: `color-mix(in srgb, ${color} ${pct}%, transparent)` };
}
