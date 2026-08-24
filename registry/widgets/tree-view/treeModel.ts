/**
 * Модель дерева — без React и без DOM.
 *
 * Дерево кажется простым, пока не начинаешь его двигать и отмечать. Здесь
 * живут четыре вещи, которые ломаются молча: разворачивание в плоский список,
 * запрет переноса узла внутрь самого себя, тройное состояние чекбоксов и
 * клавиатурная навигация. Ни одно из них не видно, пока не сломается на
 * пользователе.
 */

/** Узел дерева. Рекурсивная связка: `children` — узлы того же типа. */
export type TreeNodeOf<N> = { id: string; children?: N[] };

/** Строка плоского списка — то, что реально рисуется. */
export interface FlatRow<N> {
  id: string;
  node: N;
  /** Глубина: 0 — корень. Из неё берётся отступ. */
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  /** Номер строки в плоском списке — нужен клавиатуре и виртуализации. */
  index: number;
}

/**
 * Разворачивает дерево в плоский список видимых строк.
 *
 * Плоский список, а не рекурсивная разметка: только так дерево на десять
 * тысяч узлов можно отдать оконному рендеру. Рекурсивные компоненты
 * виртуализировать нельзя — они не знают своего номера строки.
 */
export function flattenTree<N extends TreeNodeOf<N>>(
  nodes: N[],
  expanded: ReadonlySet<string>
): FlatRow<N>[] {
  const out: FlatRow<N>[] = [];

  function walk(list: N[], depth: number, parentId: string | null) {
    for (const node of list) {
      const children = node.children ?? [];
      const isOpen = expanded.has(node.id);
      out.push({
        id: node.id,
        node,
        depth,
        parentId,
        hasChildren: children.length > 0,
        expanded: isOpen && children.length > 0,
        index: out.length,
      });
      if (isOpen && children.length > 0) walk(children, depth + 1, node.id);
    }
  }

  walk(nodes, 0, null);
  return out;
}

/** Узел, его родитель и путь от корня. */
export interface NodeLocation<N> {
  node: N;
  parent: N | null;
  /** Идентификаторы от корня до узла включительно. */
  path: string[];
}

/** Ищет узел по id вместе с его окружением. */
export function findNode<N extends TreeNodeOf<N>>(nodes: N[], id: string): NodeLocation<N> | null {
  function walk(list: N[], parent: N | null, path: string[]): NodeLocation<N> | null {
    for (const node of list) {
      const here = [...path, node.id];
      if (node.id === id) return { node, parent, path: here };
      const found = node.children ? walk(node.children, node, here) : null;
      if (found) return found;
    }
    return null;
  }
  return walk(nodes, null, []);
}

/** Все идентификаторы поддерева, включая корень поддерева. */
export function collectIds<N extends TreeNodeOf<N>>(node: N): string[] {
  const out = [node.id];
  for (const child of node.children ?? []) out.push(...collectIds(child));
  return out;
}

/** Все идентификаторы, у которых есть дети — для «развернуть всё». */
export function branchIds<N extends TreeNodeOf<N>>(nodes: N[]): string[] {
  const out: string[] = [];
  function walk(list: N[]) {
    for (const node of list) {
      if ((node.children ?? []).length > 0) {
        out.push(node.id);
        walk(node.children!);
      }
    }
  }
  walk(nodes);
  return out;
}

/** Лежит ли `id` внутри поддерева `ancestorId`. */
export function isDescendant<N extends TreeNodeOf<N>>(
  nodes: N[],
  ancestorId: string,
  id: string
): boolean {
  const found = findNode(nodes, ancestorId);
  if (!found) return false;
  return collectIds(found.node).includes(id) && ancestorId !== id;
}

/** Куда кладут узел относительно цели. */
export type DropPosition = "before" | "after" | "inside";

/**
 * Можно ли выполнить перенос.
 *
 * Главный запрет — перенос узла в собственного потомка: такая операция
 * отрезает поддерево от дерева, и оно исчезает целиком. Отдельная проверка,
 * а не «как-нибудь обработаем при перестройке»: восстанавливать потерянную
 * ветку уже нечем.
 */
export function canDrop<N extends TreeNodeOf<N>>(
  nodes: N[],
  dragId: string,
  targetId: string,
  position: DropPosition
): boolean {
  if (dragId === targetId) return false;
  if (isDescendant(nodes, dragId, targetId)) return false;

  // Перенос на прежнее место — не ошибка, но и не изменение: разрешать его
  // значит гонять серверный запрос впустую
  const from = findNode(nodes, dragId);
  if (!from) return false;
  if (position === "inside" && from.parent?.id === targetId) {
    const siblings = from.parent.children ?? [];
    if (siblings[siblings.length - 1]?.id === dragId) return false;
  }

  return findNode(nodes, targetId) !== null;
}

/** Перестраивает список без указанного узла. */
function removeFrom<N extends TreeNodeOf<N>>(list: N[], id: string): N[] {
  const out: N[] = [];
  for (const node of list) {
    if (node.id === id) continue;
    out.push(
      node.children
        ? // Пересобираем узел, а не правим на месте: изменённое дерево должно
          // отличаться ссылкой, иначе React не увидит изменения
          ({ ...node, children: removeFrom(node.children, id) } as N)
        : node
    );
  }
  return out;
}

function insertInto<N extends TreeNodeOf<N>>(
  list: N[],
  moved: N,
  targetId: string,
  position: DropPosition
): N[] {
  const out: N[] = [];
  for (const node of list) {
    if (node.id === targetId) {
      if (position === "before") out.push(moved, node);
      else if (position === "after") out.push(node, moved);
      else {
        out.push({ ...node, children: [...(node.children ?? []), moved] } as N);
      }
      continue;
    }
    out.push(
      node.children ? ({ ...node, children: insertInto(node.children, moved, targetId, position) } as N) : node
    );
  }
  return out;
}

/**
 * Переносит узел. Возвращает прежнее дерево, если перенос недопустим.
 *
 * Сначала удаление, потом вставка — и именно в этом порядке: при обратном
 * узел на мгновение существовал бы в двух местах, а поиск цели нашёл бы
 * копию внутри перемещаемого поддерева.
 */
export function moveNode<N extends TreeNodeOf<N>>(
  nodes: N[],
  dragId: string,
  targetId: string,
  position: DropPosition
): N[] {
  if (!canDrop(nodes, dragId, targetId, position)) return nodes;
  const found = findNode(nodes, dragId);
  if (!found) return nodes;
  return insertInto(removeFrom(nodes, dragId), found.node, targetId, position);
}

/** Состояние чекбокса. */
export type CheckState = "on" | "off" | "partial";

/**
 * Состояние чекбоксов для всего дерева.
 *
 * Родитель не хранит своё состояние, а выводит его из детей: иначе после
 * снятия одной галочки в глубине родитель остался бы отмеченным и соврал бы
 * о содержимом ветки. Хранится только множество отмеченных листьев и явно
 * отмеченных узлов.
 */
export function checkStates<N extends TreeNodeOf<N>>(
  nodes: N[],
  checked: ReadonlySet<string>
): Map<string, CheckState> {
  const states = new Map<string, CheckState>();

  function walk(node: N): CheckState {
    const children = node.children ?? [];
    if (children.length === 0) {
      const state: CheckState = checked.has(node.id) ? "on" : "off";
      states.set(node.id, state);
      return state;
    }

    const childStates = children.map(walk);
    const all = childStates.every((s) => s === "on");
    const none = childStates.every((s) => s === "off");
    const state: CheckState = all ? "on" : none ? "off" : "partial";
    states.set(node.id, state);
    return state;
  }

  for (const node of nodes) walk(node);
  return states;
}

/**
 * Переключает узел вместе со всем поддеревом.
 *
 * Частично отмеченный узел по нажатию становится отмеченным полностью, а не
 * пустым: нажатие на «наполовину» читается как «хочу всё», иначе для выбора
 * ветки пришлось бы нажимать дважды.
 */
export function toggleChecked<N extends TreeNodeOf<N>>(
  nodes: N[],
  checked: ReadonlySet<string>,
  id: string
): Set<string> {
  const found = findNode(nodes, id);
  const next = new Set(checked);
  if (!found) return next;

  const ids = collectIds(found.node);
  const states = checkStates(nodes, checked);
  const turnOn = states.get(id) !== "on";

  for (const each of ids) {
    if (turnOn) next.add(each);
    else next.delete(each);
  }
  return next;
}

/** Что должно произойти по нажатию клавиши. */
export type TreeKeyAction =
  | { type: "focus"; id: string }
  | { type: "expand"; id: string }
  | { type: "collapse"; id: string }
  | { type: "activate"; id: string }
  | null;

/**
 * Клавиатура по правилам ARIA для дерева.
 *
 * Стрелка вправо разворачивает узел, а на уже развёрнутом — уходит к первому
 * ребёнку; влево сворачивает, а на свёрнутом — поднимается к родителю. Именно
 * так работают файловые менеджеры, и переучивать пользователя здесь нечему.
 */
export function treeKeyAction<N>(
  rows: FlatRow<N>[],
  currentId: string | null,
  key: string
): TreeKeyAction {
  if (rows.length === 0) return null;

  const at = currentId ? rows.findIndex((r) => r.id === currentId) : -1;
  const row = at >= 0 ? rows[at]! : null;

  if (key === "ArrowDown") {
    const next = rows[Math.min(rows.length - 1, at + 1)] ?? rows[0]!;
    return { type: "focus", id: next.id };
  }
  if (key === "ArrowUp") {
    const prev = at <= 0 ? rows[0]! : rows[at - 1]!;
    return { type: "focus", id: prev.id };
  }
  if (key === "Home") return { type: "focus", id: rows[0]!.id };
  if (key === "End") return { type: "focus", id: rows[rows.length - 1]!.id };

  if (!row) return null;

  if (key === "ArrowRight") {
    if (row.hasChildren && !row.expanded) return { type: "expand", id: row.id };
    const child = rows[at + 1];
    return child && child.parentId === row.id ? { type: "focus", id: child.id } : null;
  }
  if (key === "ArrowLeft") {
    if (row.expanded) return { type: "collapse", id: row.id };
    return row.parentId ? { type: "focus", id: row.parentId } : null;
  }
  if (key === "Enter" || key === " ") return { type: "activate", id: row.id };

  return null;
}

/** Результат поиска по дереву. */
export interface FilteredTree<N> {
  nodes: N[];
  /** Ветки, которые надо развернуть, чтобы найденное было видно. */
  expand: Set<string>;
  matches: Set<string>;
}

/**
 * Оставляет узлы, подходящие под условие, вместе с их предками.
 *
 * Предки обязаны остаться: без них найденный узел висел бы в воздухе, и было
 * бы непонятно, где именно он лежит. Найденные ветки сразу разворачиваются —
 * иначе результат поиска пришлось бы раскрывать руками.
 */
export function filterTree<N extends TreeNodeOf<N>>(
  nodes: N[],
  predicate: (node: N) => boolean
): FilteredTree<N> {
  const expand = new Set<string>();
  const matches = new Set<string>();

  function walk(list: N[]): N[] {
    const out: N[] = [];
    for (const node of list) {
      const children = node.children ? walk(node.children) : [];
      const hit = predicate(node);
      if (hit) matches.add(node.id);
      if (!hit && children.length === 0) continue;

      if (children.length > 0) expand.add(node.id);
      out.push(node.children ? ({ ...node, children } as N) : node);
    }
    return out;
  }

  return { nodes: walk(nodes), expand, matches };
}
