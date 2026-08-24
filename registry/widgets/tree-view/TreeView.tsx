"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  checkStates,
  flattenTree,
  moveNode,
  toggleChecked,
  treeKeyAction,
  type CheckState,
  type DropPosition,
  type FlatRow,
  type TreeNodeOf,
} from "./treeModel";

export interface TreeViewProps<N extends TreeNodeOf<N>> {
  nodes: N[];
  /** Подпись узла. */
  renderLabel: (node: N, meta: { expanded: boolean; depth: number }) => ReactNode;
  /** Иконка слева от подписи. */
  renderIcon?: (node: N, expanded: boolean) => ReactNode;
  /** Управляемый набор развёрнутых узлов. */
  expanded?: Set<string>;
  onExpandedChange?: (expanded: Set<string>) => void;
  /** Включить чекбоксы с tri-state. */
  checkable?: boolean;
  checked?: Set<string>;
  onCheckedChange?: (checked: Set<string>) => void;
  /** Разрешить перенос узлов мышью. */
  onMove?: (nodes: N[], moved: string) => void;
  /** Клик по узлу. */
  onActivate?: (node: N) => void;
  /** Отступ на уровень (px). */
  indent?: number;
  className?: string;
}

/**
 * Дерево с клавиатурой, tri-state чекбоксами и переносом узлов.
 *
 * В shadcn/ui дерева нет вовсе, а нужно оно постоянно — файлы, разделы,
 * вложенные задачи. Плоский список видимых строк, распространение галочек
 * и запрет переноса узла в собственного потомка — в `treeModel.ts` под
 * тестами; здесь отрисовка, фокус и перетаскивание.
 */
export function TreeView<N extends TreeNodeOf<N>>({
  nodes,
  renderLabel,
  renderIcon,
  expanded: controlledExpanded,
  onExpandedChange,
  checkable = false,
  checked,
  onCheckedChange,
  onMove,
  onActivate,
  indent = 18,
  className,
}: TreeViewProps<N>) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(new Set());
  const expanded = controlledExpanded ?? uncontrolledExpanded;
  const [focusId, setFocusId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null);

  const rows = useMemo(() => flattenTree(nodes, expanded), [nodes, expanded]);
  const states = useMemo(
    () => (checkable ? checkStates(nodes, checked ?? new Set()) : new Map<string, CheckState>()),
    [checkable, nodes, checked]
  );

  function setExpanded(next: Set<string>) {
    if (controlledExpanded === undefined) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  }

  function toggle(id: string, open?: boolean) {
    const next = new Set(expanded);
    const shouldOpen = open ?? !next.has(id);
    if (shouldOpen) next.add(id);
    else next.delete(id);
    setExpanded(next);
  }

  function onKeyDown(e: React.KeyboardEvent, row: FlatRow<N>) {
    const action = treeKeyAction(rows, focusId ?? row.id, e.key);
    if (!action) return;
    e.preventDefault();
    if (action.type === "focus") setFocusId(action.id);
    else if (action.type === "expand") toggle(action.id, true);
    else if (action.type === "collapse") toggle(action.id, false);
    else if (action.type === "activate") onActivate?.(row.node);
  }

  function handleDrop(target: FlatRow<N>) {
    if (!dragId || !dropTarget || !onMove) return;
    const next = moveNode(nodes, dragId, target.id, dropTarget.position);
    if (next !== nodes) onMove(next, dragId);
    setDragId(null);
    setDropTarget(null);
  }

  return (
    <div
      className={`select-none text-sm ${className ?? ""}`}
      role="tree"
      aria-multiselectable={checkable}
    >
      {rows.map((row) => {
        const state = states.get(row.id);
        const isDropInside = dropTarget?.id === row.id && dropTarget.position === "inside";
        return (
          <div
            key={row.id}
            role="treeitem"
            aria-expanded={row.hasChildren ? row.expanded : undefined}
            aria-selected={focusId === row.id}
            tabIndex={focusId === row.id || (focusId === null && row.index === 0) ? 0 : -1}
            draggable={Boolean(onMove)}
            onKeyDown={(e) => onKeyDown(e, row)}
            onFocus={() => setFocusId(row.id)}
            onClick={() => {
              setFocusId(row.id);
              onActivate?.(row.node);
            }}
            onDragStart={() => setDragId(row.id)}
            onDragEnd={() => {
              setDragId(null);
              setDropTarget(null);
            }}
            onDragOver={(e) => {
              if (!dragId) return;
              e.preventDefault();
              // Верхняя треть — «до», нижняя — «после», середина — «внутрь»
              const box = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientY - box.top) / box.height;
              const position: DropPosition = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
              setDropTarget({ id: row.id, position });
            }}
            onDrop={() => handleDrop(row)}
            className={`group flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-2 transition ${
              focusId === row.id ? "bg-accent/12" : "hover:bg-surface-2/60"
            } ${isDropInside ? "ring-1 ring-accent" : ""} ${
              dropTarget?.id === row.id && dropTarget.position === "before" ? "border-t-2 border-accent" : ""
            } ${dropTarget?.id === row.id && dropTarget.position === "after" ? "border-b-2 border-accent" : ""}`}
            style={{ paddingLeft: 6 + row.depth * indent }}
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                if (row.hasChildren) toggle(row.id);
              }}
              className={`flex h-4 w-4 shrink-0 items-center justify-center text-muted transition ${
                row.hasChildren ? "hover:text-foreground" : "invisible"
              }`}
              aria-hidden={!row.hasChildren}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-3 w-3 transition-transform ${row.expanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {checkable && (
              <button
                type="button"
                tabIndex={-1}
                role="checkbox"
                aria-checked={state === "partial" ? "mixed" : state === "on"}
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckedChange?.(toggleChecked(nodes, checked ?? new Set(), row.id));
                }}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                  state === "on" || state === "partial"
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-edge"
                }`}
              >
                {state === "on" && (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {state === "partial" && <span className="h-0.5 w-2 rounded bg-current" />}
              </button>
            )}

            {renderIcon && <span className="shrink-0 text-muted">{renderIcon(row.node, row.expanded)}</span>}
            <span className="min-w-0 flex-1 truncate">
              {renderLabel(row.node, { expanded: row.expanded, depth: row.depth })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
