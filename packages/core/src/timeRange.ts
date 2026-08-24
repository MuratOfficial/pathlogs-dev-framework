/**
 * Относительные интервалы времени — без React и без DOM.
 *
 * Синтаксис тот же, что в Grafana и Kibana: `now`, `now-15m`, `now-1d/d`.
 * Такая запись живёт в URL и переживает перезагрузку, оставаясь
 * относительной: ссылка «за последний час» через сутки покажет последний час,
 * а не тот же самый час вчера. Пара timestamp-ов этого не умеет — поэтому
 * выражение, а не два числа.
 */

/** Единицы: секунда, минута, час, день, неделя, месяц, год. */
export type TimeUnit = "s" | "m" | "h" | "d" | "w" | "M" | "y";

/** Интервал в виде двух выражений. */
export interface TimeRange {
  from: string;
  to: string;
}

/** Разобранный интервал. */
export interface ResolvedRange {
  from: Date;
  to: Date;
}

/**
 * Край интервала. Влияет на округление: `now/d` слева — начало сегодняшнего
 * дня, справа — его конец. Иначе интервал «сегодня» заканчивался бы в
 * полночь и не включал ни одного события за день.
 */
export type RangeBound = "start" | "end";

const RELATIVE = /^now(?:([+-])(\d+)([smhdwMy]))?(?:\/([smhdwMy]))?$/;

/** Длительность единицы в миллисекундах. Месяц и год сдвигаются календарём. */
const MS: Record<Exclude<TimeUnit, "M" | "y">, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

/** Сдвигает дату на `amount` единиц. */
export function shiftDate(date: Date, amount: number, unit: TimeUnit): Date {
  // 31 января минус месяц — не «минус 30 дней»: в месяцах разное число суток,
  // и арифметика в миллисекундах давала бы дрейф на длинных интервалах
  if (unit === "M" || unit === "y") {
    const d = new Date(date.getTime());
    const day = d.getDate();
    // Сначала ставим первое число: setMonth на 31-м марта иначе перепрыгнул бы
    // через февраль в март (в феврале нет 31-го), и «минус месяц» дал бы
    // не тот месяц вовсе
    d.setDate(1);
    if (unit === "M") d.setMonth(d.getMonth() + amount);
    else d.setFullYear(d.getFullYear() + amount);
    // Возвращаем день, но не дальше конца целевого месяца: 31 марта минус
    // месяц — это конец февраля, а не его несуществующее 31-е
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return d;
  }
  return new Date(date.getTime() + amount * MS[unit]);
}

/**
 * Округляет дату к границе единицы.
 *
 * Неделя начинается с понедельника: в проектных инструментах неделя — это
 * рабочая неделя, а не календарная американская.
 */
export function snapDate(date: Date, unit: TimeUnit, bound: RangeBound = "start"): Date {
  const d = new Date(date.getTime());

  if (unit === "s") d.setMilliseconds(0);
  else if (unit === "m") d.setSeconds(0, 0);
  else if (unit === "h") d.setMinutes(0, 0, 0);
  else if (unit === "d") d.setHours(0, 0, 0, 0);
  else if (unit === "w") {
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  } else if (unit === "M") {
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
  } else {
    d.setHours(0, 0, 0, 0);
    d.setMonth(0, 1);
  }

  if (bound === "start") return d;

  // Конец периода — миллисекунда до начала следующего. Так интервал остаётся
  // полуоткрытым и «сегодня» не задевает первую миллисекунду завтра.
  return new Date(shiftDate(d, 1, unit).getTime() - 1);
}

/** Похоже ли выражение на абсолютную дату, а не на `now…`. */
export function isAbsolute(expr: string): boolean {
  return !expr.trim().startsWith("now");
}

/**
 * Разбирает одно выражение. `null` — запись непонятна.
 *
 * Именно `null`, а не молчаливый откат к «последнему часу»: интервал, тихо
 * подменённый на другой, — худший вид ошибки в отчёте, потому что цифры
 * выглядят настоящими.
 */
export function parseTimeExpr(expr: string, now: Date, bound: RangeBound = "start"): Date | null {
  const raw = expr.trim();
  if (raw === "") return null;

  const m = RELATIVE.exec(raw);
  if (m) {
    const sign = m[1];
    const amount = m[2];
    const unit = m[3];
    const snap = m[4];

    let date = new Date(now.getTime());
    if (sign && amount && unit) {
      date = shiftDate(date, (sign === "-" ? -1 : 1) * Number(amount), unit as TimeUnit);
    }
    if (snap) date = snapDate(date, snap as TimeUnit, bound);
    return date;
  }

  // Абсолютная дата: epoch в миллисекундах или то, что понимает Date
  if (/^\d{10,}$/.test(raw)) return new Date(Number(raw));

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  // Дата без времени справа — это весь день, а не его полночь: «до 14 февраля»
  // читается как «включая четырнадцатое»
  if (bound === "end" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return snapDate(parsed, "d", "end");
  return parsed;
}

/** Разбирает интервал целиком. `null`, если край непонятен или интервал вывернут. */
export function resolveRange(range: TimeRange, now: Date): ResolvedRange | null {
  const from = parseTimeExpr(range.from, now, "start");
  const to = parseTimeExpr(range.to, now, "end");
  if (!from || !to) return null;
  if (from.getTime() > to.getTime()) return null;
  return { from, to };
}

/** Длина интервала в миллисекундах. `null` при неразобранном интервале. */
export function rangeDuration(range: TimeRange, now: Date): number | null {
  const r = resolveRange(range, now);
  return r ? r.to.getTime() - r.from.getTime() : null;
}

/** Дата в формате, который принимает `<input type="datetime-local">`. */
export function toLocalInput(date: Date): string {
  const p = (n: number) => `${n}`.padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}`
  );
}

/** Превращает интервал в абсолютный — например, перед отправкой на сервер. */
export function toAbsolute(range: TimeRange, now: Date): TimeRange | null {
  const r = resolveRange(range, now);
  if (!r) return null;
  return { from: toLocalInput(r.from), to: toLocalInput(r.to) };
}

/**
 * Листает интервал на его собственную длину: `-1` — назад, `1` — вперёд.
 *
 * Результат всегда абсолютный: сдвинутое «последние 15 минут» перестаёт быть
 * последними пятнадцатью минутами, и оставить запись относительной значило бы
 * вернуть пользователя туда, откуда он только что ушёл.
 */
export function shiftRange(range: TimeRange, direction: number, now: Date): TimeRange | null {
  const r = resolveRange(range, now);
  if (!r) return null;
  const delta = direction * (r.to.getTime() - r.from.getTime());
  return {
    from: toLocalInput(new Date(r.from.getTime() + delta)),
    to: toLocalInput(new Date(r.to.getTime() + delta)),
  };
}

/** Растягивает (`factor > 1`) или сужает интервал вокруг его центра. */
export function zoomRange(range: TimeRange, factor: number, now: Date): TimeRange | null {
  const r = resolveRange(range, now);
  if (!r || factor <= 0) return null;
  const center = (r.from.getTime() + r.to.getTime()) / 2;
  const half = ((r.to.getTime() - r.from.getTime()) / 2) * factor;
  return {
    from: toLocalInput(new Date(Math.round(center - half))),
    to: toLocalInput(new Date(Math.round(center + half))),
  };
}

/** Готовый интервал для выпадающего списка. */
export interface TimePreset {
  /** Ключ для сравнения с текущим интервалом. */
  id: string;
  label: string;
  range: TimeRange;
}

export const TIME_PRESETS: TimePreset[] = [
  { id: "5m", label: "Last 5 minutes", range: { from: "now-5m", to: "now" } },
  { id: "15m", label: "Last 15 minutes", range: { from: "now-15m", to: "now" } },
  { id: "1h", label: "Last hour", range: { from: "now-1h", to: "now" } },
  { id: "4h", label: "Last 4 hours", range: { from: "now-4h", to: "now" } },
  { id: "24h", label: "Last 24 hours", range: { from: "now-24h", to: "now" } },
  { id: "7d", label: "Last 7 days", range: { from: "now-7d", to: "now" } },
  { id: "30d", label: "Last 30 days", range: { from: "now-30d", to: "now" } },
  { id: "today", label: "Today", range: { from: "now/d", to: "now/d" } },
  { id: "yesterday", label: "Yesterday", range: { from: "now-1d/d", to: "now-1d/d" } },
  { id: "week", label: "This week", range: { from: "now/w", to: "now/w" } },
  { id: "month", label: "This month", range: { from: "now/M", to: "now/M" } },
];

/** Совпадает ли интервал с готовым — чтобы подсветить его в списке. */
export function matchPreset(range: TimeRange): TimePreset | undefined {
  return TIME_PRESETS.find((p) => p.range.from === range.from && p.range.to === range.to);
}

const INTL_UNIT: Record<TimeUnit, Intl.RelativeTimeFormatUnit> = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year",
};

/** Единица и её длительность — для человекочитаемой длины интервала. */
const HUMAN: [TimeUnit, number][] = [
  ["y", 31_536_000_000],
  ["M", 2_592_000_000],
  ["d", 86_400_000],
  ["h", 3_600_000],
  ["m", 60_000],
  ["s", 1000],
];

/**
 * Подпись выражения: «15 минут назад», «сегодня», абсолютная дата.
 *
 * Локаль обязательна параметром, а не берётся из окружения: подпись попадает
 * и в серверную отрисовку, где локали браузера нет, — и тогда сервер с
 * клиентом разошлись бы в разметке.
 */
export function describeExpr(expr: string, locale: string, bound: RangeBound = "start"): string {
  const raw = expr.trim();
  const m = RELATIVE.exec(raw);

  if (m) {
    const sign = m[1];
    const amount = m[2];
    const unit = m[3];
    const snap = m[4];
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (!sign) return rtf.format(0, snap ? INTL_UNIT[snap as TimeUnit] : "second");
    const n = Number(amount) * (sign === "-" ? -1 : 1);
    return rtf.format(n, INTL_UNIT[unit as TimeUnit]);
  }

  const date = parseTimeExpr(raw, new Date(), bound);
  if (!date) return raw;
  return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

/** Длительность словами: «2 ч», «15 мин». */
export function describeDuration(ms: number, locale: string): string {
  const abs = Math.abs(ms);
  for (const [unit, size] of HUMAN) {
    if (abs >= size) {
      return new Intl.NumberFormat(locale, {
        style: "unit",
        unit: INTL_UNIT[unit],
        unitDisplay: "short",
      }).format(Math.round(abs / size));
    }
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "second",
    unitDisplay: "short",
  }).format(0);
}

/** Проверка выражения — для подсветки поля ввода. */
export function isValidExpr(expr: string): boolean {
  return parseTimeExpr(expr, new Date()) !== null;
}

/** Единицы, доступные в записи — для подсказки в интерфейсе. */
export const TIME_UNITS: TimeUnit[] = ["s", "m", "h", "d", "w", "M", "y"];
