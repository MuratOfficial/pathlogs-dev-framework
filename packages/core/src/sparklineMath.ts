/**
 * Геометрия спарклайна — без React и без DOM.
 *
 * Задача простая ровно до первого края: пустой массив, одно значение,
 * все значения равные, тысяча точек на сто пикселей. Всё это ломает наивную
 * формулу масштабирования делением на ноль или неразличимой кашей — поэтому
 * расчёт живёт здесь и проверяется тестами, а не на глаз.
 */

/** Точка в координатах SVG. */
export interface SparkPoint {
  x: number;
  y: number;
  value: number;
  /** Индекс в исходном массиве значений. */
  index: number;
}

export interface SparklineOptions {
  width?: number;
  height?: number;
  /** Отступ внутрь, чтобы линия и точки не обрезались по краям. */
  padding?: number;
  /** Нижняя граница шкалы. По умолчанию — минимум данных. */
  min?: number;
  /** Верхняя граница шкалы. По умолчанию — максимум данных. */
  max?: number;
  /** Включать ноль в шкалу — тогда высота линии сопоставима между графиками. */
  zeroBased?: boolean;
  /** Сглаживать линию кривыми вместо ломаной. */
  smooth?: boolean;
}

export interface SparklineGeometry {
  points: SparkPoint[];
  /** `d` для `<path>` линии. */
  line: string;
  /** `d` для заливки под линией. */
  area: string;
  width: number;
  height: number;
  min: number;
  max: number;
  first?: SparkPoint;
  last?: SparkPoint;
  /** Точки экстремумов — их обычно помечают на графике. */
  lowest?: SparkPoint;
  highest?: SparkPoint;
}

/** Границы шкалы. */
export function extentOf(
  values: number[],
  { min, max, zeroBased = false }: Pick<SparklineOptions, "min" | "max" | "zeroBased"> = {}
): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };

  let lo = min ?? Math.min(...values);
  let hi = max ?? Math.max(...values);
  if (zeroBased) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }

  // Плоский ряд: раздвигаем шкалу вокруг значения, иначе делили бы на ноль
  // и получили линию либо по верхнему краю, либо NaN
  if (hi === lo) {
    const pad = Math.abs(hi) > 0 ? Math.abs(hi) * 0.5 : 1;
    return { min: lo - pad, max: hi + pad };
  }
  return { min: lo, max: hi };
}

/**
 * Прореживание длинного ряда с сохранением выбросов.
 *
 * В каждой корзине оставляем минимум и максимум, а не среднее: спарклайн
 * рисуют ради всплесков, а усреднение — единственный способ гарантированно
 * их потерять.
 */
export function decimate(values: number[], maxPoints: number): number[] {
  if (maxPoints < 3 || values.length <= maxPoints) return [...values];

  // По две точки на корзину плюс первая и последняя
  const buckets = Math.floor((maxPoints - 2) / 2);
  const size = values.length / buckets;
  const out: number[] = [values[0]!];

  for (let b = 0; b < buckets; b += 1) {
    const start = Math.floor(b * size);
    const end = Math.min(values.length, Math.floor((b + 1) * size));
    if (end <= start) continue;

    let lowAt = start;
    let highAt = start;
    for (let i = start; i < end; i += 1) {
      if (values[i]! < values[lowAt]!) lowAt = i;
      if (values[i]! > values[highAt]!) highAt = i;
    }
    // Порядок внутри корзины сохраняем — иначе линия рисовала бы зигзаг
    // там, где данные монотонны
    const [a, c] = lowAt <= highAt ? [lowAt, highAt] : [highAt, lowAt];
    out.push(values[a]!);
    if (c !== a) out.push(values[c]!);
  }

  out.push(values[values.length - 1]!);
  return out;
}

/** Сглаженная линия: квадратичные кривые через середины отрезков. */
function smoothPath(points: SparkPoint[]): string {
  if (points.length < 3) return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

  const parts = [`M${points[0]!.x} ${points[0]!.y}`];
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i]!;
    const next = points[i + 1]!;
    // Контрольная точка — сама вершина, конец сегмента — середина до следующей.
    // Кривая проходит рядом с вершинами, но не выскакивает за пределы ряда,
    // как это делает Catmull-Rom
    const mx = (p.x + next.x) / 2;
    const my = (p.y + next.y) / 2;
    parts.push(`Q${p.x} ${p.y} ${mx} ${my}`);
  }
  const last = points[points.length - 1]!;
  parts.push(`L${last.x} ${last.y}`);
  return parts.join(" ");
}

/**
 * Считает геометрию линии.
 *
 * Точки укладываются в `width × height` с отступом `padding`. Ось Y
 * перевёрнута: в SVG она растёт вниз, а график — вверх.
 */
export function sparklineGeometry(
  values: number[],
  {
    width = 120,
    height = 32,
    padding = 2,
    min,
    max,
    zeroBased = false,
    smooth = false,
  }: SparklineOptions = {}
): SparklineGeometry {
  const extent = extentOf(values, { min, max, zeroBased });
  const base: SparklineGeometry = {
    points: [],
    line: "",
    area: "",
    width,
    height,
    min: extent.min,
    max: extent.max,
  };
  if (values.length === 0) return base;

  const innerW = Math.max(0, width - padding * 2);
  const innerH = Math.max(0, height - padding * 2);
  const span = extent.max - extent.min;

  const points: SparkPoint[] = values.map((value, index) => {
    // Одна точка встаёт по центру: делить на (length - 1) здесь означало бы
    // делить на ноль
    const t = values.length === 1 ? 0.5 : index / (values.length - 1);
    const clamped = Math.min(Math.max(value, extent.min), extent.max);
    return {
      x: padding + t * innerW,
      y: padding + innerH - ((clamped - extent.min) / span) * innerH,
      value,
      index,
    };
  });

  const line = smooth
    ? smoothPath(points)
    : points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const floor = height - padding;
  const area = `${line} L${last.x} ${floor} L${first.x} ${floor} Z`;

  let lowest = first;
  let highest = first;
  for (const p of points) {
    if (p.value < lowest.value) lowest = p;
    if (p.value > highest.value) highest = p;
  }

  return { ...base, points, line, area, first, last, lowest, highest };
}

/**
 * Направление ряда: доля изменения от первого значения к последнему.
 *
 * `null`, когда сравнивать нечего или первое значение нулевое: «рост на
 * бесконечность процентов» — не то, что стоит показывать рядом с цифрой.
 */
export function trend(values: number[]): number | null {
  if (values.length < 2) return null;
  const first = values[0]!;
  const last = values[values.length - 1]!;
  if (first === 0) return null;
  return (last - first) / Math.abs(first);
}
