/**
 * Панорама и масштаб канвы — без React и без DOM.
 *
 * Вся математика «мир ↔ экран»: где на экране мировая точка, куда попадёт
 * клик, как приблизить к курсору, а не к углу. Ошибка здесь не роняет
 * приложение — она делает так, что при зуме канва «уезжает» из-под курсора,
 * и понять, почему, по коду невозможно. Поэтому расчёт отдельно и под тестом.
 */

/** Состояние камеры. `scale` — сколько экранных пикселей в одном мировом. */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

/** Точка. Одна структура для мировых и экранных координат. */
export interface Point {
  x: number;
  y: number;
}

/** Прямоугольник в мировых координатах. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const IDENTITY_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 };

/** Мировая точка → экранная. */
export function worldToScreen(point: Point, view: Viewport): Point {
  return { x: point.x * view.scale + view.x, y: point.y * view.scale + view.y };
}

/** Экранная точка → мировая. Обратное к worldToScreen. */
export function screenToWorld(point: Point, view: Viewport): Point {
  return { x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale };
}

/** Зажимает масштаб в допустимые пределы. */
export function clampScale(scale: number, min = 0.2, max = 2.5): number {
  return Math.min(Math.max(scale, min), max);
}

/**
 * Масштабирование с сохранением точки под курсором.
 *
 * Вся суть: мировая точка под курсором до и после зума должна оказаться в
 * той же точке экрана. Иначе колесо мыши таскает канву в сторону, и
 * прицелиться в узел становится невозможно. Поэтому смещение подстраивается
 * так, чтобы `screen` осталась неподвижной.
 */
export function zoomAt(view: Viewport, screen: Point, factor: number, min = 0.2, max = 2.5): Viewport {
  const scale = clampScale(view.scale * factor, min, max);
  // Если масштаб упёрся в предел, реальный множитель уже не равен factor —
  // берём фактический, иначе точка всё же чуть сместится
  const applied = scale / view.scale;
  return {
    scale,
    x: screen.x - (screen.x - view.x) * applied,
    y: screen.y - (screen.y - view.y) * applied,
  };
}

/** Сдвиг камеры на экранный вектор — обычное перетаскивание фона. */
export function panBy(view: Viewport, dx: number, dy: number): Viewport {
  return { ...view, x: view.x + dx, y: view.y + dy };
}

/** Лежит ли мировая точка внутри прямоугольника. */
export function hitTest(rect: Rect, world: Point): boolean {
  return (
    world.x >= rect.x &&
    world.x <= rect.x + rect.width &&
    world.y >= rect.y &&
    world.y <= rect.y + rect.height
  );
}

/**
 * Верхний прямоугольник под точкой.
 *
 * Список просматривается с конца: то, что нарисовано позже, лежит выше — и
 * клик должен попасть в него, а не в перекрытый им нижний.
 */
export function topHit<R extends Rect & { id: string }>(rects: R[], world: Point): R | null {
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    if (hitTest(rects[i]!, world)) return rects[i]!;
  }
  return null;
}

/** Прямоугольники, пересекающие рамку выделения. */
export function rectsInBox<R extends Rect & { id: string }>(rects: R[], box: Rect): R[] {
  return rects.filter(
    (r) =>
      r.x < box.x + box.width &&
      r.x + r.width > box.x &&
      r.y < box.y + box.height &&
      r.y + r.height > box.y
  );
}

/** Рамка из двух углов — нормализованная, с неотрицательными размерами. */
export function normalizeRect(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

/** Привязка к сетке. Шаг 0 или меньше отключает привязку. */
export function snapToGrid(value: number, grid: number): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

/** Привязка точки к сетке по обеим осям. */
export function snapPoint(point: Point, grid: number): Point {
  return { x: snapToGrid(point.x, grid), y: snapToGrid(point.y, grid) };
}

/** Габаритный прямоугольник набора — для «уместить всё в экран». */
export function boundingBox(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Камера, вмещающая прямоугольник в экран заданного размера.
 *
 * Пустой набор не двигает камеру: «уместить ничто» — это оставить как есть,
 * а не прыгнуть в нулевую точку с непонятным масштабом.
 */
export function fitView(
  content: Rect | null,
  screenWidth: number,
  screenHeight: number,
  padding = 40,
  min = 0.2,
  max = 2.5
): Viewport {
  if (!content || content.width === 0 || content.height === 0) return IDENTITY_VIEWPORT;

  const scaleX = (screenWidth - padding * 2) / content.width;
  const scaleY = (screenHeight - padding * 2) / content.height;
  const scale = clampScale(Math.min(scaleX, scaleY), min, max);

  // Центр содержимого совмещаем с центром экрана
  const cx = content.x + content.width / 2;
  const cy = content.y + content.height / 2;
  return {
    scale,
    x: screenWidth / 2 - cx * scale,
    y: screenHeight / 2 - cy * scale,
  };
}

/** Точка привязки порта на краю узла — откуда и куда рисовать связь. */
export type PortSide = "left" | "right" | "top" | "bottom";

export function portPoint(rect: Rect, side: PortSide): Point {
  switch (side) {
    case "left":
      return { x: rect.x, y: rect.y + rect.height / 2 };
    case "right":
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
    case "top":
      return { x: rect.x + rect.width / 2, y: rect.y };
    case "bottom":
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
  }
}

/**
 * Кубическая кривая между двумя портами.
 *
 * Управляющие точки вынесены по горизонтали пропорционально расстоянию:
 * связь выходит из узла перпендикулярно краю и не липнет к нему, даже когда
 * узлы стоят вплотную.
 */
export function edgePath(from: Point, to: Point): string {
  const dx = Math.max(40, Math.abs(to.x - from.x) / 2);
  return `M${from.x} ${from.y} C${from.x + dx} ${from.y} ${to.x - dx} ${to.y} ${to.x} ${to.y}`;
}
