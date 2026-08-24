/**
 * Буфер строк лога и отбор по фильтру — без React и без DOM.
 *
 * Лог отличается от списка тем, что он бесконечен. Значит, нужен предел
 * и вытеснение старых строк, а не «сколько прислали, столько и держим»:
 * иначе за сутки работы вкладка съедает гигабайт и умирает.
 */

import { stripAnsi } from "./ansi";

/** Уровень строки. Порядок важен: он же порядок сравнения. */
export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

/** Строка лога. */
export interface LogLine {
  /** Сквозной номер. Не индекс в массиве: старые строки вытесняются. */
  seq: number;
  text: string;
  level?: LogLevel;
  /** Метка времени (мс), если её прислал сервер. */
  at?: number;
  /** Источник: имя сервиса, контейнера, шага сборки. */
  source?: string;
}

/** Что пришло с сервера: номер проставится сам. */
export type IncomingLine = Omit<LogLine, "seq"> & { seq?: number };

const LEVEL_RE = /\b(trace|debug|info|warn(?:ing)?|error|fatal)\b/i;

/**
 * Пытается определить уровень по тексту строки.
 *
 * Ищем в начале строки, а не где угодно: уровень пишут в префиксе, и
 * «не удалось скачать, см. error.log» не должно превращать обычную строку
 * в ошибку. Ограничение в 80 символов покрывает любой разумный префикс
 * с временем, потоком и именем сервиса.
 */
export function detectLevel(text: string, prefixLength = 80): LogLevel | undefined {
  const m = LEVEL_RE.exec(stripAnsi(text).slice(0, prefixLength));
  if (!m) return undefined;
  const raw = m[1]!.toLowerCase();
  return (raw === "warning" ? "warn" : raw) as LogLevel;
}

/** Сравнение уровней: не ниже ли `level` порога `min`. */
export function levelAtLeast(level: LogLevel | undefined, min: LogLevel): boolean {
  if (!level) return false;
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(min);
}

export interface AppendResult {
  lines: LogLine[];
  /** Сколько строк вытеснено этим вызовом. */
  dropped: number;
  /** Номер следующей строки. */
  nextSeq: number;
}

/**
 * Дописывает строки в буфер, вытесняя старые сверх предела.
 *
 * Уровень определяется здесь, один раз на строку, а не при отрисовке:
 * в оконном рендере строка перерисовывается на каждом кадре прокрутки,
 * и разбор текста на каждом кадре — это заметные проценты процессора.
 */
export function appendLines(
  buffer: LogLine[],
  incoming: IncomingLine[],
  limit = 5000,
  startSeq?: number
): AppendResult {
  let seq = startSeq ?? (buffer.length > 0 ? buffer[buffer.length - 1]!.seq + 1 : 0);

  const added: LogLine[] = incoming.map((line) => {
    const own = line.seq ?? seq;
    seq = Math.max(seq, own) + 1;
    return {
      seq: own,
      text: line.text,
      // Явно присланный уровень доверяем: сервер знает лучше эвристики
      level: line.level ?? detectLevel(line.text),
      ...(line.at !== undefined ? { at: line.at } : {}),
      ...(line.source !== undefined ? { source: line.source } : {}),
    };
  });

  const all = [...buffer, ...added];
  const overflow = Math.max(0, all.length - limit);
  return { lines: overflow > 0 ? all.slice(overflow) : all, dropped: overflow, nextSeq: seq };
}

/** Условия отбора. */
export interface LogFilter {
  /** Показывать только эти уровни. Пусто — показывать все. */
  levels?: LogLevel[];
  /** Строки без распознанного уровня. По умолчанию видны. */
  includeUnleveled?: boolean;
  query?: string;
  /** Считать запрос регулярным выражением. */
  regex?: boolean;
  caseSensitive?: boolean;
  source?: string;
}

/**
 * Собирает запрос в регулярное выражение.
 *
 * Неверное выражение не роняет фильтр и не опустошает лог: пока пользователь
 * дописывает `(error|warn`, скобка ещё не закрыта — и правильнее искать эту
 * строку буквально, чем показать пустой экран.
 */
export function compileQuery(
  query: string,
  { regex = false, caseSensitive = false }: Pick<LogFilter, "regex" | "caseSensitive"> = {}
): RegExp | null {
  if (query === "") return null;
  const flags = caseSensitive ? "g" : "gi";
  if (!regex) return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
  try {
    return new RegExp(query, flags);
  } catch {
    return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
  }
}

/** Проверка одной строки на соответствие фильтру. */
export function matchesFilter(line: LogLine, filter: LogFilter, matcher?: RegExp | null): boolean {
  const { levels, includeUnleveled = true, source } = filter;

  if (levels && levels.length > 0) {
    if (!line.level) {
      if (!includeUnleveled) return false;
    } else if (!levels.includes(line.level)) return false;
  }

  if (source && line.source !== source) return false;

  if (matcher) {
    matcher.lastIndex = 0;
    if (!matcher.test(stripAnsi(line.text))) return false;
  }

  return true;
}

/** Отбирает строки по фильтру. */
export function filterLines(lines: LogLine[], filter: LogFilter): LogLine[] {
  const matcher = compileQuery(filter.query ?? "", filter);
  return lines.filter((line) => matchesFilter(line, filter, matcher));
}

/** Найденный отрезок для подсветки. */
export type MatchRange = [start: number, end: number];

/**
 * Отрезки совпадений в тексте.
 *
 * Совпадения нулевой длины пропускаются: выражение вроде `a*` совпадает
 * в каждой позиции, и без этой проверки цикл не двигался бы вперёд вовсе.
 */
export function matchRanges(text: string, matcher: RegExp | null): MatchRange[] {
  if (!matcher) return [];
  const out: MatchRange[] = [];
  matcher.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = matcher.exec(text)) !== null) {
    if (m[0].length === 0) {
      matcher.lastIndex += 1;
      continue;
    }
    out.push([m.index, m.index + m[0].length]);
  }
  return out;
}

/** Сколько строк каждого уровня — для счётчиков над логом. */
export function countByLevel(lines: LogLine[]): Record<LogLevel, number> {
  const counts = Object.fromEntries(LOG_LEVELS.map((l) => [l, 0])) as Record<LogLevel, number>;
  for (const line of lines) {
    if (line.level) counts[line.level] += 1;
  }
  return counts;
}
