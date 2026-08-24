/**
 * Раскладка плиточной сетки — без React и без DOM.
 *
 * Плитки живут в целочисленной сетке колонок и строк. Двигаешь одну — она
 * толкает соседей, освободилось место — всё оседает вверх. Ни то, ни другое
 * не видно, пока не столкнёшь две плитки в одну клетку: тогда либо они
 * налезают друг на друга, либо одна исчезает. Поэтому упаковка отдельно
 * и под тестом. Родня `kanbanOrder`: там порядок карточек, здесь — плиток.
 */

/** Плитка: положение и размер в клетках сетки. */
export interface GridItem {
  id: string;
  /** Левая колонка, с нуля. */
  x: number;
  /** Верхняя строка, с нуля. */
  y: number;
  /** Ширина в колонках. */
  w: number;
  /** Высота в строках. */
  h: number;
  /** Нельзя двигать и толкать. */
  static?: boolean;
}

/** Пересекаются ли две плитки по площади. */
export function collides(a: GridItem, b: GridItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Все плитки, задевающие данную. */
export function collisionsFor(item: GridItem, items: GridItem[]): GridItem[] {
  return items.filter((other) => collides(item, other));
}

/** Держит плитку в пределах числа колонок. */
export function clampToColumns(item: GridItem, columns: number): GridItem {
  // Плитка шире сетки ужимается до её ширины, а не вылезает за край:
  // за краем её всё равно не видно, а раскладку она бы сломала
  const w = Math.min(item.w, columns);
  const x = Math.min(Math.max(0, item.x), columns - w);
  return { ...item, w, x };
}

/**
 * Осаживает плитки вверх, убирая вертикальные пустоты.
 *
 * Без сжатия удаление верхней плитки оставляло бы дыру, а сетка выглядела
 * бы дырявой и неопрятной. Плитки обрабатываются сверху вниз, поэтому
 * поднявшаяся не перепрыгивает ещё не обработанную.
 */
export function compact(items: GridItem[]): GridItem[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: GridItem[] = [];

  for (const item of sorted) {
    if (item.static) {
      placed.push(item);
      continue;
    }

    let y = item.y;
    // Опускаем плитку вверх, пока не упрётся в другую или в потолок
    while (y > 0) {
      const probe = { ...item, y: y - 1 };
      if (placed.some((p) => collides(probe, p))) break;
      y -= 1;
    }
    placed.push({ ...item, y });
  }

  return placed;
}

/**
 * Двигает плитку на новое место, расталкивая тех, кто там оказался.
 *
 * Расталкивание вниз, а не отмена хода: пользователь тянет плитку туда, куда
 * хочет её поставить, и остановить его на полпути — значит проигнорировать
 * жест. Поэтому цель уступается перетаскиваемой, а занимавшие клетки съезжают.
 */
export function moveItem(
  items: GridItem[],
  id: string,
  to: { x: number; y: number },
  columns: number
): GridItem[] {
  const moving = items.find((i) => i.id === id);
  if (!moving || moving.static) return items;

  const next = clampToColumns({ ...moving, x: to.x, y: Math.max(0, to.y) }, columns);
  let result = items.map((i) => (i.id === id ? next : i));

  // Расталкиваем всех, кого задела перемещённая плитка, каскадом вниз
  result = resolveCollisions(result, next);
  return compact(result);
}

/**
 * Сдвигает вниз всех, кто пересекается с якорем, и рекурсивно — задетых ими.
 *
 * Обход в ширину от якоря: плитка сдвигается ровно настолько, чтобы уйти
 * из-под него, и толкает уже своих соседей. Статические не двигаются —
 * об них раздвигаются остальные.
 */
function resolveCollisions(items: GridItem[], anchor: GridItem): GridItem[] {
  const byId = new Map(items.map((i) => [i.id, { ...i }]));
  const queue: string[] = [anchor.id];

  // Ограничение проходов страхует от зацикливания на патологических данных:
  // на честной сетке каскад всегда сходится, но входные данные бывают битыми
  let guard = items.length * items.length + 1;

  while (queue.length > 0 && guard-- > 0) {
    const current = byId.get(queue.shift()!)!;
    for (const other of byId.values()) {
      if (other.id === current.id || other.static) continue;
      if (!collides(current, other)) continue;
      // Сдвигаем ровно под нижний край текущей плитки
      other.y = current.y + current.h;
      queue.push(other.id);
    }
  }

  return [...byId.values()];
}

/**
 * Находит первое свободное место сверху вниз, слева направо.
 *
 * Нужна при добавлении плитки: класть её поверх существующих нельзя, а
 * искать место руками — незачем. Возвращает координаты, а не готовую плитку:
 * идентификатор и содержимое проставляет вызывающий код.
 */
export function findFreeSpot(
  items: GridItem[],
  w: number,
  h: number,
  columns: number
): { x: number; y: number } {
  const width = Math.min(w, columns);
  for (let y = 0; y < 1000; y += 1) {
    for (let x = 0; x <= columns - width; x += 1) {
      const probe: GridItem = { id: "__probe__", x, y, w: width, h };
      if (!items.some((i) => collides(probe, i))) return { x, y };
    }
  }
  // Недостижимо на разумных данных, но тип обязан вернуть координаты
  return { x: 0, y: bottomRow(items) };
}

/** Первая свободная строка под всеми плитками. */
export function bottomRow(items: GridItem[]): number {
  return items.reduce((max, i) => Math.max(max, i.y + i.h), 0);
}

/** Меняет размер плитки, расталкивая задетых и осаживая сетку. */
export function resizeItem(
  items: GridItem[],
  id: string,
  size: { w: number; h: number },
  columns: number
): GridItem[] {
  const target = items.find((i) => i.id === id);
  if (!target || target.static) return items;

  const resized = clampToColumns(
    { ...target, w: Math.max(1, size.w), h: Math.max(1, size.h) },
    columns
  );
  const result = items.map((i) => (i.id === id ? resized : i));
  return compact(resolveCollisions(result, resized));
}

/**
 * Переводит пиксельную позицию в клетки сетки — при перетаскивании.
 *
 * Округление, а не отсечение: плитка встаёт в ближайшую клетку, а не в ту,
 * что чуть левее и выше, — иначе перетаскивание всё время «недотягивает»
 * на одну клетку.
 */
export function pixelToCell(
  px: number,
  py: number,
  cellWidth: number,
  rowHeight: number,
  gap: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round(px / (cellWidth + gap))),
    y: Math.max(0, Math.round(py / (rowHeight + gap))),
  };
}

/** Пиксельные границы плитки — то, что уходит в inline-стиль. */
export function cellToPixel(
  item: GridItem,
  cellWidth: number,
  rowHeight: number,
  gap: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: item.x * (cellWidth + gap),
    top: item.y * (rowHeight + gap),
    width: item.w * cellWidth + (item.w - 1) * gap,
    height: item.h * rowHeight + (item.h - 1) * gap,
  };
}

/** Полная высота сетки в пикселях — под неё растягивается контейнер. */
export function gridHeight(items: GridItem[], rowHeight: number, gap: number): number {
  const rows = bottomRow(items);
  return rows > 0 ? rows * rowHeight + (rows - 1) * gap : 0;
}
