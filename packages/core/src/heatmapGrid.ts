/**
 * Сетка календарной теплокарты — без React и без DOM.
 *
 * Год активности — это 53 столбца по 7 клеток, подписи месяцев над нужными
 * столбцами и разбивка значений на уровни цвета. Интересного здесь два места:
 * выравнивание сетки по дням недели и выбор порогов уровней.
 */

/** Клетка теплокарты. */
export interface HeatmapCell {
  /** Дата в формате YYYY-MM-DD — годится как React key. */
  iso: string;
  date: Date;
  value: number;
  /** Уровень цвета: 0 — пусто, дальше по возрастанию. */
  level: number;
  /**
   * Клетка внутри запрошенного интервала. Клетки-добивки по краям нужны,
   * чтобы сетка осталась прямоугольной, но рисуются пустыми.
   */
  inRange: boolean;
}

/** Подпись месяца над сеткой. */
export interface HeatmapMonth {
  label: string;
  /** Номер столбца, с которого начинается месяц. */
  column: number;
  /** Сколько столбцов занимает. */
  span: number;
}

/** Готовая сетка. */
export interface HeatmapGrid {
  /** Столбцы-недели, в каждом ровно 7 клеток сверху вниз. */
  weeks: HeatmapCell[][];
  months: HeatmapMonth[];
  /** Подписи дней недели в порядке строк сетки. */
  weekdays: string[];
  /** Пороги уровней: `thresholds[i]` — минимум для уровня `i + 1`. */
  thresholds: number[];
  max: number;
  total: number;
  /** Сколько дней с ненулевым значением. */
  activeDays: number;
}

export interface BuildHeatmapOptions {
  from: Date;
  to: Date;
  /** С какого дня начинается неделя: 1 — понедельник (по умолчанию), 0 — воскресенье. */
  weekStart?: number;
  /** Сколько уровней цвета, не считая нулевого. */
  levels?: number;
  /** Локаль подписей месяцев и дней недели. */
  locale?: string;
}

/** Дата в YYYY-MM-DD из локальных частей — без ухода в UTC. */
export function isoDay(date: Date): string {
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Пороги уровней по квантилям ненулевых значений.
 *
 * Не равные интервалы от нуля до максимума: в реальных данных один день
 * с сотней событий на фоне единиц сплющил бы всю карту в самый бледный
 * уровень. Квантили дают карту, на которой видно распределение, а не
 * один выброс.
 */
export function quantileThresholds(values: number[], levels = 4): number[] {
  const positive = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (positive.length === 0) {
    // Пустых данных не бывает «наполовину»: пусть все клетки будут нулевого
    // уровня, чем половина случайно окрасится
    return Array.from({ length: levels }, () => Number.POSITIVE_INFINITY);
  }

  const out: number[] = [];
  for (let i = 0; i < levels; i += 1) {
    const at = Math.floor((i / levels) * (positive.length - 1));
    const value = positive[at]!;
    // Пороги обязаны не убывать: при малом числе разных значений квантили
    // совпадают, и без этого уровень мог бы «съехать» вниз
    out.push(Math.max(value, out[i - 1] ?? value));
  }
  return out;
}

/** Уровень значения по порогам. */
export function levelOf(value: number, thresholds: number[]): number {
  if (value <= 0) return 0;
  let level = 0;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value >= thresholds[i]!) level = i + 1;
  }
  // Ненулевое значение ниже первого порога — всё равно уровень 1: день,
  // в котором что-то было, не должен выглядеть пустым
  return Math.max(1, level);
}

/**
 * Собирает сетку.
 *
 * `values` — карта «YYYY-MM-DD → значение». Отсутствующий день считается
 * нулём: заставлять вызывающий код перечислять все 365 дней было бы
 * издевательством над источником данных.
 */
export function buildHeatmap(
  values: Record<string, number>,
  { from, to, weekStart = 1, levels = 4, locale = "en-US" }: BuildHeatmapOptions
): HeatmapGrid {
  const first = startOfDay(from);
  const last = startOfDay(to);

  // Сдвиг до начала недели, содержащей первый день: сетка обязана начинаться
  // с полной недели, иначе строки перестают соответствовать дням недели
  const lead = (first.getDay() - weekStart + 7) % 7;
  const gridStart = addDays(first, -lead);

  const tail = (weekStart + 6 - last.getDay() + 7) % 7;
  const gridEnd = addDays(last, tail);

  const days: HeatmapCell[] = [];
  const inRangeValues: number[] = [];

  for (let d = gridStart; d.getTime() <= gridEnd.getTime(); d = addDays(d, 1)) {
    const iso = isoDay(d);
    const inRange = d.getTime() >= first.getTime() && d.getTime() <= last.getTime();
    const value = inRange ? values[iso] ?? 0 : 0;
    if (inRange) inRangeValues.push(value);
    days.push({ iso, date: d, value, level: 0, inRange });
  }

  const thresholds = quantileThresholds(inRangeValues, levels);
  for (const cell of days) {
    cell.level = cell.inRange ? levelOf(cell.value, thresholds) : 0;
  }

  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Подписи месяцев: месяц привязывается к столбцу, где встретился его
  // первый день внутри интервала
  const months: HeatmapMonth[] = [];
  weeks.forEach((week, column) => {
    for (const cell of week) {
      if (!cell.inRange) continue;
      const label = cell.date.toLocaleDateString(locale, { month: "short" });
      const previous = months[months.length - 1];
      if (!previous || previous.label !== label) {
        months.push({ label, column, span: 1 });
      } else if (previous.column + previous.span - 1 < column) {
        previous.span += 1;
      }
      break;
    }
  });

  const weekdays: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    // Берём любую неделю сетки: она полная, поэтому дни недели в ней
    // идут ровно в порядке строк
    const sample = addDays(gridStart, i);
    weekdays.push(sample.toLocaleDateString(locale, { weekday: "short" }));
  }

  return {
    weeks,
    months,
    weekdays,
    thresholds,
    max: inRangeValues.reduce((a, b) => Math.max(a, b), 0),
    total: inRangeValues.reduce((a, b) => a + b, 0),
    activeDays: inRangeValues.filter((v) => v > 0).length,
  };
}

/** Интервал «последние N дней, включая сегодня». */
export function trailingRange(now: Date, days: number): { from: Date; to: Date } {
  const to = startOfDay(now);
  return { from: addDays(to, -(days - 1)), to };
}

/** Интервал календарного года. */
export function yearRange(year: number): { from: Date; to: Date } {
  return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
}

/**
 * Серии активных дней: текущая и самая длинная.
 *
 * Текущая серия считается от последнего дня интервала назад. Сегодняшний
 * пустой день её не обрывает — день ещё не кончился, и обнулять счётчик
 * в полночь было бы обидно.
 */
export function activityStreaks(grid: HeatmapGrid): { current: number; longest: number } {
  const cells = grid.weeks.flat().filter((c) => c.inRange);

  let longest = 0;
  let run = 0;
  for (const cell of cells) {
    run = cell.value > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  for (let i = cells.length - 1; i >= 0; i -= 1) {
    const cell = cells[i]!;
    if (cell.value > 0) current += 1;
    else if (i === cells.length - 1) continue;
    else break;
  }

  return { current, longest };
}
