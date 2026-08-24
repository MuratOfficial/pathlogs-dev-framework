/**
 * Стек отмен с истечением — без React и без DOM.
 *
 * Идея вместо диалога подтверждения: действие выполняется сразу, а рядом
 * на несколько секунд появляется «Отменить». Диалог спрашивает всегда и
 * поэтому перестаёт читаться; отмена стоит ровно столько, сколько стоит
 * ошибка, — и только в тех случаях, когда ошибка случилась.
 *
 * Слияние подряд идущих однотипных действий здесь не украшение: без него
 * удаление трёх задач подряд даёт три всплывающих панели, и отменить можно
 * только последнюю.
 */

/** Отменяемое действие. */
export interface UndoAction<P = unknown> {
  id: string;
  /** Что показать: «Задача удалена». */
  label: string;
  /** Когда произошло (мс). */
  at: number;
  /** Сколько живёт предложение отмены (мс). */
  ttlMs: number;
  /**
   * Ключ слияния. Действия с одним ключом, идущие подряд, складываются
   * в одно с счётчиком.
   */
  mergeKey?: string;
  /** Сколько действий свёрнуто в это. */
  count: number;
  /** Что нужно, чтобы откатить. */
  payload?: P;
}

export interface PushUndoOptions {
  /** Предел глубины стека. */
  max?: number;
  /**
   * Окно слияния (мс). Действие с тем же ключом внутри окна не создаёт
   * новую запись, а увеличивает счётчик существующей.
   */
  mergeWindowMs?: number;
}

/** Новое действие: id и счётчик проставляются сами. */
export type NewUndoAction<P = unknown> = Omit<UndoAction<P>, "count" | "id"> & { id?: string };

let sequence = 0;

/**
 * Кладёт действие в стек.
 *
 * Слияние продлевает жизнь записи от последнего действия, а не от первого:
 * иначе третье удаление подряд оказалось бы «уже почти истёкшим» и отменить
 * его было бы нельзя.
 */
export function pushUndo<P>(
  stack: UndoAction<P>[],
  action: NewUndoAction<P>,
  { max = 5, mergeWindowMs = 4000 }: PushUndoOptions = {}
): UndoAction<P>[] {
  const top = stack[0];
  if (
    top &&
    action.mergeKey !== undefined &&
    top.mergeKey === action.mergeKey &&
    action.at - top.at <= mergeWindowMs
  ) {
    const merged: UndoAction<P> = {
      ...top,
      at: action.at,
      label: action.label,
      count: top.count + 1,
      ...(action.payload !== undefined ? { payload: action.payload } : {}),
    };
    return [merged, ...stack.slice(1)];
  }

  sequence += 1;
  const entry: UndoAction<P> = {
    id: action.id ?? `undo-${sequence}`,
    label: action.label,
    at: action.at,
    ttlMs: action.ttlMs,
    count: 1,
    ...(action.mergeKey !== undefined ? { mergeKey: action.mergeKey } : {}),
    ...(action.payload !== undefined ? { payload: action.payload } : {}),
  };

  // Новое сверху: отменяют почти всегда последнее
  return [entry, ...stack].slice(0, Math.max(1, max));
}

/** Сколько времени осталось у записи (мс). */
export function remainingMs(action: UndoAction, now: number): number {
  return Math.max(0, action.at + action.ttlMs - now);
}

/** Доля прожитого времени от 0 до 1 — для кольцевого таймера. */
export function undoProgress(action: UndoAction, now: number): number {
  if (action.ttlMs <= 0) return 1;
  return Math.min(1, Math.max(0, (now - action.at) / action.ttlMs));
}

/** Делит стек на живые записи и истёкшие. */
export function expireUndo<P>(
  stack: UndoAction<P>[],
  now: number
): { kept: UndoAction<P>[]; expired: UndoAction<P>[] } {
  const kept: UndoAction<P>[] = [];
  const expired: UndoAction<P>[] = [];
  for (const action of stack) {
    (remainingMs(action, now) > 0 ? kept : expired).push(action);
  }
  return { kept, expired };
}

/** Убирает запись — после отмены или после закрытия вручную. */
export function dropUndo<P>(stack: UndoAction<P>[], id: string): UndoAction<P>[] {
  return stack.filter((a) => a.id !== id);
}

/**
 * Подпись с счётчиком: «Удалено ×3».
 *
 * Одиночное действие остаётся без счётчика: «×1» сообщает ровно ничего,
 * зато выглядит как недоделанный интерфейс.
 */
export function undoLabel(action: UndoAction): string {
  return action.count > 1 ? `${action.label} ×${action.count}` : action.label;
}
