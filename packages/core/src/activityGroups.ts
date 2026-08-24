/**
 * Группировка ленты событий — без React и без DOM.
 *
 * Задача не в том, чтобы вывести события списком, а в том, чтобы лента не
 * превращалась в шум. Два правила: события режутся по дням, а подряд идущие
 * однотипные сворачиваются в одну запись — «сменил статус ×7» вместо семи
 * одинаковых строк.
 */

/** То немногое, что нужно группировке от события. */
export interface ActivityEventLike {
  id: string;
  /** Когда произошло. Строка, число или Date — что пришло с сервера. */
  at: string | number | Date;
  /** Тип события: по нему события считаются однотипными. */
  kind: string;
  /** Кто сделал. `null` — системное событие. */
  actorId?: string | null;
}

/** Запись ленты: одиночное событие либо свёрнутая серия. */
export type ActivityEntry<E extends ActivityEventLike> =
  | { type: "single"; key: string; at: Date; event: E }
  | {
      type: "burst";
      key: string;
      /** Время первого события серии в порядке отображения. */
      at: Date;
      /** Время последнего события серии. */
      until: Date;
      kind: string;
      actorId?: string | null;
      events: E[];
    };

/** День ленты. */
export interface ActivityDay<E extends ActivityEventLike> {
  /** Ключ дня в формате YYYY-MM-DD — годится как React key. */
  key: string;
  /** Начало дня. */
  date: Date;
  entries: ActivityEntry<E>[];
  /** Сколько событий в дне всего, включая свёрнутые. */
  total: number;
}

export interface GroupActivityOptions {
  /** Порядок: `desc` — новые сверху (по умолчанию). */
  order?: "desc" | "asc";
  /** Максимальный разрыв внутри серии (мс). */
  burstWindowMs?: number;
  /** С какого количества событий серия сворачивается. */
  burstThreshold?: number;
  /** Требовать одного автора для серии. По умолчанию да. */
  sameActor?: boolean;
}

/** Время события как Date. */
export function eventAt(event: ActivityEventLike): Date {
  return event.at instanceof Date ? event.at : new Date(event.at);
}

/** Ключ дня: YYYY-MM-DD из локальных частей, без ухода в UTC. */
export function dayKey(date: Date): string {
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Складывает события в дни и сворачивает серии.
 *
 * Серия не пересекает границу дня: сначала режем по дням, потом сворачиваем
 * внутри каждого. Иначе «×7» могло бы означать «шесть вчера и одно сегодня» —
 * и заголовок дня перестал бы что-либо значить.
 */
export function groupActivity<E extends ActivityEventLike>(
  events: E[],
  {
    order = "desc",
    burstWindowMs = 30 * 60_000,
    burstThreshold = 3,
    sameActor = true,
  }: GroupActivityOptions = {}
): ActivityDay<E>[] {
  const sorted = [...events].sort((a, b) => {
    const diff = eventAt(a).getTime() - eventAt(b).getTime();
    // Равные метки времени — обычно один пакет изменений с сервера.
    // Разрываем ничью по id, иначе порядок зависел бы от реализации sort
    return order === "desc" ? -diff || (a.id < b.id ? 1 : -1) : diff || (a.id < b.id ? -1 : 1);
  });

  const days: ActivityDay<E>[] = [];
  let current: { key: string; events: E[] } | null = null;

  for (const event of sorted) {
    const key = dayKey(eventAt(event));
    if (!current || current.key !== key) {
      current = { key, events: [] };
      days.push({ key, date: startOfDay(eventAt(event)), entries: [], total: 0 });
    }
    current.events.push(event);
    const day = days[days.length - 1]!;
    day.total += 1;
  }

  // Второй проход: свёртка внутри дня. Отдельным проходом, потому что
  // группировка по дням должна быть завершена до подсчёта серий
  let at = 0;
  for (const day of days) {
    const slice = sorted.slice(at, at + day.total);
    at += day.total;
    day.entries = collapseBursts(slice, { burstWindowMs, burstThreshold, sameActor });
  }

  return days;
}

/**
 * Свёртка подряд идущих однотипных событий.
 *
 * Разрыв считается между соседями, а не от начала серии: десять правок
 * по одной в двадцать минут — это одна работа, а не пять серий, и
 * ограничение общей длины разрезало бы её произвольно.
 */
export function collapseBursts<E extends ActivityEventLike>(
  events: E[],
  {
    burstWindowMs = 30 * 60_000,
    burstThreshold = 3,
    sameActor = true,
  }: Omit<GroupActivityOptions, "order"> = {}
): ActivityEntry<E>[] {
  const out: ActivityEntry<E>[] = [];
  let run: E[] = [];

  function flush() {
    if (run.length === 0) return;
    if (run.length < burstThreshold) {
      for (const event of run) {
        out.push({ type: "single", key: event.id, at: eventAt(event), event });
      }
    } else {
      const first = run[0]!;
      const last = run[run.length - 1]!;
      out.push({
        type: "burst",
        key: `${first.id}+${run.length}`,
        at: eventAt(first),
        until: eventAt(last),
        kind: first.kind,
        actorId: first.actorId ?? null,
        events: run,
      });
    }
    run = [];
  }

  for (const event of events) {
    const prev = run[run.length - 1];
    const joins =
      prev !== undefined &&
      prev.kind === event.kind &&
      (!sameActor || (prev.actorId ?? null) === (event.actorId ?? null)) &&
      Math.abs(eventAt(event).getTime() - eventAt(prev).getTime()) <= burstWindowMs;

    if (!joins) flush();
    run.push(event);
  }
  flush();

  return out;
}

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["week", 604_800_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/**
 * «5 минут назад», «через 2 дня».
 *
 * `now` приходит параметром, а не берётся из `Date.now()`: иначе функцию
 * нельзя было бы проверить тестом, а лента — отрисовать на сервере.
 */
export function relativeTime(at: Date | string | number, now: Date, locale: string): string {
  const date = at instanceof Date ? at : new Date(at);
  const diff = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(diff) >= size) return rtf.format(Math.round(diff / size), unit);
  }
  // Меньше минуты — «только что», а не «0 секунд назад»
  return rtf.format(0, "minute");
}

/** Заголовок дня: «Сегодня», «Вчера» или дата. */
export function dayLabel(date: Date, now: Date, locale: string): string {
  const days = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000
  );
  if (days === 0 || days === -1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
  }
  // Год показываем только для прошлых лет: «14 февраля 2025» в ленте за
  // этот год — лишний шум
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
