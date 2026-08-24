/**
 * Механика оконного рендера — без React и без DOM.
 *
 * Здесь всё, что легко сломать незаметно: границы видимого окна, смещения
 * строк разной высоты, отступы-распорки и прыжок к элементу. Ошибка в этих
 * четырёх числах даёт «список прыгает при прокрутке» — баг, который
 * разглядыванием не ловится, а тестом ловится сразу.
 */

/** Высота элемента по его индексу. */
export type SizeFn = (index: number) => number;

/**
 * Префиксные суммы высот: `offsets[i]` — смещение начала элемента `i`,
 * последний элемент — полная высота списка.
 *
 * Массив на один длиннее количества элементов именно поэтому: иначе полную
 * высоту приходилось бы считать отдельно и держать в синхронности вручную.
 */
export function buildOffsets(count: number, size: number | SizeFn): number[] {
  const at: SizeFn = typeof size === "function" ? size : () => size;
  const offsets = new Array<number>(Math.max(0, count) + 1);
  offsets[0] = 0;
  for (let i = 0; i < count; i += 1) {
    // Отрицательная высота сдвинула бы следующие элементы назад и сломала
    // бинарный поиск: он опирается на неубывающий массив
    offsets[i + 1] = offsets[i]! + Math.max(0, at(i));
  }
  return offsets;
}

/** Полная высота списка. */
export function totalSize(offsets: number[]): number {
  return offsets[offsets.length - 1] ?? 0;
}

/**
 * Индекс элемента, накрывающего позицию, бинарным поиском.
 *
 * Линейный проход здесь тоже сработал бы, но на десяти тысячах строк он
 * выполняется на каждое событие прокрутки — то есть до сотни раз в секунду.
 */
export function indexAtOffset(offsets: number[], position: number): number {
  const count = offsets.length - 1;
  if (count <= 0) return 0;

  let lo = 0;
  let hi = count - 1;
  const target = Math.max(0, position);

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid]! <= target) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Видимое окно и распорки вокруг него. */
export interface VirtualWindow {
  /** Первый отрисовываемый индекс. */
  start: number;
  /** Индекс за последним отрисовываемым — как в slice. */
  end: number;
  /** Высота распорки до окна. */
  paddingStart: number;
  /** Высота распорки после окна. */
  paddingEnd: number;
  /** Полная высота списка. */
  totalSize: number;
}

/**
 * Что рисовать при данной прокрутке.
 *
 * `overscan` — запас строк за краями окна: без него быстрая прокрутка
 * показывает пустоту, потому что событие scroll приходит уже после отрисовки
 * кадра.
 *
 * Нулевая высота вьюпорта (контейнер ещё не измерен) не даёт пустое
 * окно: на первом кадре рисуется запас строк, иначе список мигал бы
 * пустотой при каждом монтировании.
 */
export function virtualWindow(
  offsets: number[],
  scrollTop: number,
  viewport: number,
  overscan = 3
): VirtualWindow {
  const count = offsets.length - 1;
  const total = totalSize(offsets);
  if (count <= 0) return { start: 0, end: 0, paddingStart: 0, paddingEnd: 0, totalSize: 0 };

  // Отрицательная прокрутка — это инерционный «отскок» у края в Safari
  // и на трекпадах; клампим, чтобы окно не уезжало за начало списка
  const top = Math.min(Math.max(0, scrollTop), Math.max(0, total - 1));
  const bottom = top + Math.max(0, viewport);

  const first = indexAtOffset(offsets, top);
  const last = indexAtOffset(offsets, bottom);

  const start = Math.max(0, first - overscan);
  const end = Math.min(count, last + 1 + overscan);

  return {
    start,
    end,
    paddingStart: offsets[start]!,
    paddingEnd: total - offsets[end]!,
    totalSize: total,
  };
}

/** Отрисовываемый элемент: индекс, смещение и высота. */
export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

/** Элементы окна с уже посчитанными смещениями. */
export function virtualItems(offsets: number[], window: VirtualWindow): VirtualItem[] {
  const out: VirtualItem[] = [];
  for (let i = window.start; i < window.end; i += 1) {
    out.push({ index: i, start: offsets[i]!, size: offsets[i + 1]! - offsets[i]! });
  }
  return out;
}

/** Куда прижимать элемент при прыжке к нему. */
export type ScrollAlign = "auto" | "start" | "center" | "end";

/**
 * Прокрутка, при которой элемент виден.
 *
 * `auto` не двигает список, если элемент и так на экране: прыжок к уже
 * видимой строке выглядит как случайный рывок.
 */
export function scrollOffsetFor(
  offsets: number[],
  index: number,
  viewport: number,
  currentScroll: number,
  align: ScrollAlign = "auto"
): number {
  const count = offsets.length - 1;
  if (count <= 0) return 0;

  const i = Math.min(Math.max(0, index), count - 1);
  const start = offsets[i]!;
  const size = offsets[i + 1]! - start;
  const max = Math.max(0, totalSize(offsets) - viewport);
  const clamp = (v: number) => Math.min(Math.max(0, v), max);

  if (align === "start") return clamp(start);
  if (align === "end") return clamp(start + size - viewport);
  if (align === "center") return clamp(start - (viewport - size) / 2);

  if (start < currentScroll) return clamp(start);
  if (start + size > currentScroll + viewport) return clamp(start + size - viewport);
  return currentScroll;
}

/**
 * Прилипание к концу списка: нужно ли доскроллить вниз при новых строках.
 *
 * Порог, а не точное равенство: у элементов бывают дробные высоты, и
 * `scrollTop + clientHeight` почти никогда не совпадает с `scrollHeight`
 * ровно. Без порога «прилипание к хвосту» в логе отваливалось бы само.
 */
export function isAtBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold = 24
): boolean {
  return scrollHeight - scrollTop - clientHeight <= threshold;
}
