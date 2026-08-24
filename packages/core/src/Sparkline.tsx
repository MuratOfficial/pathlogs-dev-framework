import { useId, type CSSProperties } from "react";
import { cn } from "./cn.js";
import {
  decimate,
  sparklineGeometry,
  trend,
  type SparklineOptions,
  type SparkPoint,
} from "./sparklineMath.js";

export interface SparklineProps extends SparklineOptions {
  /** Ряд значений слева направо. */
  values: number[];
  /** Цвет линии. По умолчанию — акцент темы. */
  color?: string;
  /** Залить область под линией полупрозрачным цветом линии. */
  fill?: boolean;
  /** Пометить точками первое и последнее значение. */
  dots?: boolean;
  /** Пометить минимум и максимум ряда. */
  extremes?: boolean;
  /** Прореживать длинный ряд до этого числа точек. */
  maxPoints?: number;
  /** Доступная подпись: «Коммиты за неделю, тренд +18%». */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Инлайновый спарклайн: тренд в строку таблицы, в бейдж, в статус-бар.
 *
 * Без chart-библиотеки — один `<path>` и, по желанию, точки. Вся геометрия
 * (масштаб, прореживание, экстремумы) посчитана в `sparkline.ts` и проверена
 * тестами; здесь только отрисовка.
 */
export function Sparkline({
  values,
  width = 120,
  height = 32,
  padding = 3,
  color = "var(--accent)",
  fill = false,
  dots = false,
  extremes = false,
  smooth = false,
  maxPoints,
  min,
  max,
  zeroBased,
  label,
  className,
  style,
}: SparklineProps) {
  const gradientId = useId();
  // Прореживаем с сохранением выбросов — их-то ради спарклайна и рисуют
  const series = maxPoints ? decimate(values, maxPoints) : values;

  const geo = sparklineGeometry(series, { width, height, padding, min, max, zeroBased, smooth });
  const direction = trend(values);

  const auto =
    label ??
    (direction === null
      ? "Тренд"
      : `Тренд ${direction >= 0 ? "+" : ""}${Math.round(direction * 100)}%`);

  if (geo.points.length === 0) {
    return (
      <svg
        className={cn("pl-sparkline", className)}
        width={width}
        height={height}
        style={style}
        role="img"
        aria-label="Нет данных"
      />
    );
  }

  return (
    <svg
      className={cn("pl-sparkline", className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={style}
      role="img"
      aria-label={auto}
      preserveAspectRatio="none"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={geo.area} fill={`url(#${gradientId})`} stroke="none" />
        </>
      )}

      <path
        d={geo.line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {extremes && (
        <>
          <Dot point={geo.lowest!} color="var(--muted)" />
          <Dot point={geo.highest!} color={color} />
        </>
      )}

      {dots && (
        <>
          <Dot point={geo.first!} color={color} />
          <Dot point={geo.last!} color={color} filled />
        </>
      )}
    </svg>
  );
}

function Dot({ point, color, filled }: { point: SparkPoint; color: string; filled?: boolean }) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={2}
      fill={filled ? color : "var(--surface)"}
      stroke={color}
      strokeWidth={1.5}
    />
  );
}
