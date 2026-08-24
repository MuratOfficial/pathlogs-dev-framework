/**
 * Укладка сегментов статус-строки в доступную ширину — без React и без DOM.
 *
 * Нижняя полоса приложения набивается со временем: ветка, статус соединения,
 * счётчик задач, версия, подсказка. На узком экране всё это не влезает, а
 * `overflow: hidden` обрезает по случайному месту — и первым исчезает то,
 * что оказалось справа, а не то, что менее важно.
 */

/** Сегмент полосы. */
export interface StatusSegment {
  id: string;
  /** Ширина в пикселях — измеренная или оценённая. */
  width: number;
  /**
   * Важность: чем больше, тем позже сегмент убирают. По умолчанию 0.
   */
  priority?: number;
  /** Никогда не убирать — обычно это статус соединения. */
  pinned?: boolean;
}

export interface FitResult<S extends StatusSegment> {
  /** Что показать — в исходном порядке. */
  shown: S[];
  /** Что спрятать: обычно уходит в меню «ещё». */
  hidden: S[];
  /** Занятая ширина показанных сегментов вместе с зазорами. */
  used: number;
}

export interface FitOptions {
  /** Зазор между сегментами. */
  gap?: number;
  /** Ширина, которую занимает кнопка «ещё», если что-то спрятано. */
  overflowWidth?: number;
}

function totalWidth(widths: number[], gap: number): number {
  if (widths.length === 0) return 0;
  return widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
}

/**
 * Что влезает в `available` пикселей.
 *
 * Убираем по одному сегменту с наименьшим приоритетом, пока не влезет.
 * При равном приоритете первым уходит правый: полоса читается слева направо,
 * и правый край — самая дальняя от взгляда часть.
 *
 * Закреплённые сегменты не убираются никогда — даже если из-за них полоса
 * всё равно не влезет. Показать «нет связи» важнее, чем уложиться в ширину.
 */
export function fitSegments<S extends StatusSegment>(
  segments: S[],
  available: number,
  { gap = 12, overflowWidth = 0 }: FitOptions = {}
): FitResult<S> {
  const order = new Map(segments.map((s, i) => [s.id, i]));
  let shown = [...segments];
  const hidden: S[] = [];

  const widthOf = (list: S[]) =>
    totalWidth(list.map((s) => s.width), gap) + (hidden.length > 0 ? overflowWidth + gap : 0);

  while (widthOf(shown) > available) {
    const droppable = shown.filter((s) => !s.pinned);
    if (droppable.length === 0) break;

    let worst = droppable[0]!;
    for (const candidate of droppable) {
      const a = candidate.priority ?? 0;
      const b = worst.priority ?? 0;
      if (a < b || (a === b && order.get(candidate.id)! > order.get(worst.id)!)) worst = candidate;
    }

    shown = shown.filter((s) => s.id !== worst.id);
    hidden.push(worst);
  }

  // Спрятанные возвращаем в исходном порядке, а не в порядке выбрасывания:
  // меню «ещё» должно повторять полосу, а не историю решений этой функции
  hidden.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  return { shown, hidden, used: widthOf(shown) };
}

/**
 * Грубая оценка ширины по тексту — когда измерять нечем.
 *
 * Нужна на первом кадре и при серверной отрисовке: без неё полоса сначала
 * показала бы всё, а потом резко сложилась. Точность здесь не важна,
 * важно не промахнуться в разы.
 */
export function estimateWidth(text: string, { charWidth = 7, padding = 20 } = {}): number {
  return Math.round(text.length * charWidth + padding);
}
