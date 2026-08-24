/**
 * Слоистая раскладка ориентированного графа — без React и без DOM.
 *
 * Это упрощённый Сугияма: разрыв циклов, разбивка по слоям, снижение
 * пересечений и только потом координаты. Ни один из четырёх шагов не
 * проверяется взглядом на картинку: «стало меньше пересечений» — это число,
 * а «граф не потерял вершину на цикле» — тест.
 *
 * Родня диаграмме Ганта: там из тех же связей считается критический путь,
 * здесь из них строится картинка.
 */

/** Вершина: раскладке нужен только идентификатор. */
export interface DagNodeLike {
  id: string;
}

/** Связь «from → to». */
export interface DagEdge {
  from: string;
  to: string;
}

/** Куда растёт граф. */
export type DagDirection = "LR" | "TB";

export interface DagLayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  /** Зазор между слоями. */
  layerGap?: number;
  /** Зазор внутри слоя. */
  nodeGap?: number;
  direction?: DagDirection;
  /** Сколько проходов делать при снижении пересечений. */
  passes?: number;
}

/** Ключ связи. Отдельной функцией, чтобы разделитель был ровно один. */
function edgeKey(from: string, to: string): string {
  return `${from} ${to}`;
}

/**
 * Убирает обратные связи, чтобы граф стал ациклическим.
 *
 * Слои существуют только в графе без циклов. Отказаться от раскладки при
 * цикле нельзя — цикл в зависимостях задач встречается сплошь и рядом, и
 * пользователю нужно его увидеть, а не получить пустой экран. Поэтому
 * обратные связи снимаются и возвращаются отдельным списком: их рисуют
 * пунктиром как «здесь граф замкнулся».
 */
export function breakCycles(
  nodeIds: string[],
  edges: DagEdge[]
): { acyclic: DagEdge[]; removed: DagEdge[] } {
  const out = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
  for (const edge of edges) {
    if (out.has(edge.from) && out.has(edge.to)) out.get(edge.from)!.push(edge.to);
  }

  /** 0 — не посещали, 1 — в текущем пути, 2 — закрыта. */
  const state = new Map<string, 0 | 1 | 2>(nodeIds.map((id) => [id, 0]));
  const back = new Set<string>();

  // Обход итеративный, а не рекурсивный: на графе в тысячи вершин рекурсия
  // упирается в предел стека, и раскладка падает вместо того, чтобы работать
  for (const root of nodeIds) {
    if (state.get(root) !== 0) continue;
    const stack: { id: string; at: number }[] = [{ id: root, at: 0 }];
    state.set(root, 1);

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!;
      const children = out.get(frame.id)!;

      if (frame.at >= children.length) {
        state.set(frame.id, 2);
        stack.pop();
        continue;
      }

      const next = children[frame.at]!;
      frame.at += 1;

      if (state.get(next) === 1) {
        // Связь ведёт в вершину текущего пути — это и есть цикл
        back.add(edgeKey(frame.id, next));
        continue;
      }
      if (state.get(next) === 0) {
        state.set(next, 1);
        stack.push({ id: next, at: 0 });
      }
    }
  }

  const acyclic: DagEdge[] = [];
  const removed: DagEdge[] = [];
  for (const edge of edges) {
    // Связь в несуществующую вершину молча выбрасываем: она приходит из
    // данных, где элемент уже удалён, и падать из-за неё не за что
    if (!out.has(edge.from) || !out.has(edge.to)) continue;
    if (back.has(edgeKey(edge.from, edge.to))) removed.push(edge);
    else acyclic.push(edge);
  }

  return { acyclic, removed };
}

/**
 * Раскладывает вершины по слоям методом длиннейшего пути.
 *
 * Вершина встаёт на слой, следующий за самым дальним из её предшественников.
 * Так связь всегда идёт вперёд, а задача без зависимостей оказывается
 * в первом слое — там, где её и ищут.
 */
export function assignLayers(
  nodeIds: string[],
  edges: DagEdge[]
): { layers: string[][]; layerOf: Map<string, number> } {
  const incoming = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  const out = new Map<string, string[]>(nodeIds.map((id) => [id, []]));

  for (const edge of edges) {
    if (!out.has(edge.from) || !incoming.has(edge.to)) continue;
    out.get(edge.from)!.push(edge.to);
    incoming.set(edge.to, incoming.get(edge.to)! + 1);
  }

  const layerOf = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  const queue = nodeIds.filter((id) => incoming.get(id) === 0);

  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const next of out.get(id)!) {
      layerOf.set(next, Math.max(layerOf.get(next)!, layerOf.get(id)! + 1));
      incoming.set(next, incoming.get(next)! - 1);
      if (incoming.get(next) === 0) queue.push(next);
    }
  }

  const depth = Math.max(0, ...layerOf.values()) + 1;
  const layers: string[][] = Array.from({ length: depth }, () => []);
  // Порядок внутри слоя — порядок исходного списка вершин: он предсказуем,
  // а значит раскладка одних и тех же данных не «пляшет» между отрисовками
  for (const id of nodeIds) layers[layerOf.get(id)!]!.push(id);

  return { layers, layerOf };
}

/** Отрезок между соседними слоями: обычная связь либо часть длинной. */
export interface DagSegment {
  from: string;
  to: string;
}

/** Считает пересечения между всеми соседними слоями. */
export function countCrossings(layers: string[][], segments: DagSegment[]): number {
  const position = new Map<string, { layer: number; index: number }>();
  layers.forEach((layer, l) => layer.forEach((id, i) => position.set(id, { layer: l, index: i })));

  let crossings = 0;
  for (let l = 0; l < layers.length - 1; l += 1) {
    const between = segments.filter((s) => position.get(s.from)?.layer === l);

    for (let i = 0; i < between.length; i += 1) {
      for (let j = i + 1; j < between.length; j += 1) {
        const a = between[i]!;
        const b = between[j]!;
        const a1 = position.get(a.from)?.index;
        const a2 = position.get(a.to)?.index;
        const b1 = position.get(b.from)?.index;
        const b2 = position.get(b.to)?.index;
        if (a1 === undefined || a2 === undefined || b1 === undefined || b2 === undefined) continue;
        // Пересечение — это когда порядок концов противоположен порядку начал
        if ((a1 - b1) * (a2 - b2) < 0) crossings += 1;
      }
    }
  }
  return crossings;
}

/** Медиана позиций соседей. `-1` — соседей нет. */
export function median(values: number[]): number {
  if (values.length === 0) return -1;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Снижает число пересечений медианной эвристикой.
 *
 * Вершина стремится встать напротив середины своих соседей в соседнем слое;
 * проходы идут туда и обратно. Точное решение задачи о минимуме пересечений
 * NP-полно, поэтому здесь эвристика — но лучший результат выбирается по
 * настоящему числу пересечений, а не по вере в неё. Поэтому раскладка
 * никогда не выходит хуже исходной.
 */
export function orderLayers(layers: string[][], segments: DagSegment[], passes = 4): string[][] {
  let best = layers.map((layer) => [...layer]);
  let bestCrossings = countCrossings(best, segments);
  const current = best.map((layer) => [...layer]);

  const predecessors = new Map<string, string[]>();
  const successors = new Map<string, string[]>();
  for (const segment of segments) {
    const into = predecessors.get(segment.to) ?? [];
    into.push(segment.from);
    predecessors.set(segment.to, into);

    const from = successors.get(segment.from) ?? [];
    from.push(segment.to);
    successors.set(segment.from, from);
  }

  function reorder(layer: string[], neighbours: Map<string, string[]>, reference: string[]) {
    const index = new Map(reference.map((id, i) => [id, i]));
    const keyed = layer.map((id, i) => {
      const positions = (neighbours.get(id) ?? [])
        .map((n) => index.get(n) ?? -1)
        .filter((v) => v >= 0);
      // Вершина без соседей остаётся на своём месте: двигать её некуда,
      // а любое перемещение — лишнее «дрожание» картинки
      const key = positions.length === 0 ? i : median(positions);
      return { id, key, tie: i };
    });
    keyed.sort((a, b) => a.key - b.key || a.tie - b.tie);
    return keyed.map((k) => k.id);
  }

  for (let pass = 0; pass < passes; pass += 1) {
    if (pass % 2 === 0) {
      for (let l = 1; l < current.length; l += 1) {
        current[l] = reorder(current[l]!, predecessors, current[l - 1]!);
      }
    } else {
      for (let l = current.length - 2; l >= 0; l -= 1) {
        current[l] = reorder(current[l]!, successors, current[l + 1]!);
      }
    }

    const crossings = countCrossings(current, segments);
    if (crossings < bestCrossings) {
      bestCrossings = crossings;
      best = current.map((layer) => [...layer]);
    }
  }

  return best;
}

/** Вершина с координатами. */
export interface PositionedNode {
  id: string;
  layer: number;
  /** Номер внутри слоя после упорядочивания. */
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Служебная вершина-изгиб длинной связи: рисовать её не нужно. */
  virtual: boolean;
}

/** Связь с готовым путём. */
export interface RoutedEdge extends DagEdge {
  /** Точки от начала к концу, включая изгибы. */
  points: { x: number; y: number }[];
  /** Значение атрибута `d` для `<path>`. */
  path: string;
  /** Связь была обратной и снята при разрыве цикла. */
  reversed: boolean;
}

export interface DagLayout {
  nodes: PositionedNode[];
  edges: RoutedEdge[];
  /** Слои без служебных вершин. */
  layers: string[][];
  width: number;
  height: number;
  crossings: number;
  /** Обратные связи: их наличие означает цикл в графе. */
  cycleEdges: DagEdge[];
}

/** Кубическая кривая через точки — плавная и без изломов на изгибах. */
function bezierThrough(points: { x: number; y: number }[], direction: DagDirection): string {
  if (points.length < 2) return "";
  const parts = [`M${points[0]!.x} ${points[0]!.y}`];

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]!;
    const b = points[i]!;
    if (direction === "LR") {
      const dx = (b.x - a.x) / 2;
      parts.push(`C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`);
    } else {
      const dy = (b.y - a.y) / 2;
      parts.push(`C${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`);
    }
  }
  return parts.join(" ");
}

/**
 * Полная раскладка: слои, порядок, координаты и пути связей.
 *
 * Связи, перескакивающие через слой, разбиваются служебными вершинами.
 * Без них длинная связь шла бы напрямую сквозь чужие блоки — а с ними она
 * огибает слои и остаётся читаемой.
 */
export function layoutDag<N extends DagNodeLike>(
  nodes: N[],
  edges: DagEdge[],
  {
    nodeWidth = 168,
    nodeHeight = 44,
    layerGap = 72,
    nodeGap = 16,
    direction = "LR",
    passes = 4,
  }: DagLayoutOptions = {}
): DagLayout {
  const ids = nodes.map((n) => n.id);
  if (ids.length === 0) {
    return { nodes: [], edges: [], layers: [], width: 0, height: 0, crossings: 0, cycleEdges: [] };
  }

  const { acyclic, removed } = breakCycles(ids, edges);
  const { layers: rawLayers, layerOf } = assignLayers(ids, acyclic);

  const layers = rawLayers.map((layer) => [...layer]);
  const segments: DagSegment[] = [];
  const chains = new Map<string, string[]>();
  /**
   * Служебные вершины помечаются множеством, а не префиксом в идентификаторе:
   * любой выдуманный префикс однажды встретится в настоящем id — и вершина
   * пользователя молча исчезнет с картинки.
   */
  const virtualIds = new Set<string>();

  for (const edge of acyclic) {
    const from = layerOf.get(edge.from)!;
    const to = layerOf.get(edge.to)!;
    if (to - from <= 1) {
      segments.push({ from: edge.from, to: edge.to });
      continue;
    }

    const chain: string[] = [];
    let previous = edge.from;
    for (let l = from + 1; l < to; l += 1) {
      const id = `${edgeKey(edge.from, edge.to)} ${l}`;
      virtualIds.add(id);
      layers[l]!.push(id);
      chain.push(id);
      segments.push({ from: previous, to: id });
      previous = id;
    }
    segments.push({ from: previous, to: edge.to });
    chains.set(edgeKey(edge.from, edge.to), chain);
  }

  const ordered = orderLayers(layers, segments, passes);
  const crossings = countCrossings(ordered, segments);

  // Слои центруются относительно самого широкого: иначе граф прижимается
  // к одному краю и выглядит перекошенным
  const along = direction === "LR" ? nodeHeight + nodeGap : nodeWidth + nodeGap;
  const across = direction === "LR" ? nodeWidth + layerGap : nodeHeight + layerGap;
  const widest = Math.max(...ordered.map((layer) => layer.length));

  const positioned = new Map<string, PositionedNode>();
  ordered.forEach((layer, l) => {
    const offset = ((widest - layer.length) * along) / 2;
    layer.forEach((id, i) => {
      const virtual = virtualIds.has(id);
      const main = l * across;
      // Служебная вершина ставится по центру своего слота: связь через неё
      // проходит ровно между соседними блоками, а не по их краю
      const cross = offset + i * along + (virtual ? along / 2 : 0);
      positioned.set(id, {
        id,
        layer: l,
        order: i,
        x: direction === "LR" ? main : cross,
        y: direction === "LR" ? cross : main,
        width: virtual ? 0 : nodeWidth,
        height: virtual ? 0 : nodeHeight,
        virtual,
      });
    });
  });

  const exitPoint = (node: PositionedNode) =>
    direction === "LR"
      ? { x: node.x + node.width, y: node.y + node.height / 2 }
      : { x: node.x + node.width / 2, y: node.y + node.height };
  const entryPoint = (node: PositionedNode) =>
    direction === "LR"
      ? { x: node.x, y: node.y + node.height / 2 }
      : { x: node.x + node.width / 2, y: node.y };

  const routed: RoutedEdge[] = [];
  for (const edge of [...acyclic, ...removed]) {
    const from = positioned.get(edge.from);
    const to = positioned.get(edge.to);
    if (!from || !to) continue;

    const bends = (chains.get(edgeKey(edge.from, edge.to)) ?? [])
      .map((id) => positioned.get(id))
      .filter((node): node is PositionedNode => node !== undefined)
      .map((node) => ({ x: node.x, y: node.y }));

    const points = [exitPoint(from), ...bends, entryPoint(to)];
    routed.push({
      ...edge,
      points,
      path: bezierThrough(points, direction),
      reversed: removed.includes(edge),
    });
  }

  const all = [...positioned.values()];
  return {
    nodes: all.filter((node) => !node.virtual),
    edges: routed,
    layers: ordered.map((layer) => layer.filter((id) => !virtualIds.has(id))),
    width: Math.max(...all.map((node) => node.x + node.width)),
    height: Math.max(...all.map((node) => node.y + node.height)),
    crossings,
    cycleEdges: removed,
  };
}
