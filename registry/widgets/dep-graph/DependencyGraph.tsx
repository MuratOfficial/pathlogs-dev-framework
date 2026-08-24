"use client";

import { useMemo, useState, type ReactNode } from "react";
import { layoutDag, type DagEdge, type DagDirection, type DagNodeLike } from "./dagLayout";

export interface DependencyGraphProps<N extends DagNodeLike> {
  nodes: N[];
  edges: DagEdge[];
  /** Содержимое блока узла. */
  renderNode: (node: N, meta: { highlighted: boolean }) => ReactNode;
  /** Направление роста: слева направо (по умолчанию) или сверху вниз. */
  direction?: DagDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  /** Клик по узлу. */
  onSelect?: (node: N) => void;
  /** Подсвечивать соседей выбранного узла. */
  highlightNeighbours?: boolean;
  className?: string;
}

/**
 * Граф зависимостей: слоистая раскладка ориентированного графа.
 *
 * Сосед диаграммы Ганта — из тех же связей «A блокирует B» там считается
 * критический путь, здесь строится картинка. Разрыв циклов, разбивка по
 * слоям и снижение пересечений (упрощённый Сугияма) — в `dagLayout.ts` под
 * тестами; здесь SVG-рёбра, блоки и подсветка соседей. Цикл не ломает
 * раскладку: обратная связь рисуется пунктиром.
 */
export function DependencyGraph<N extends DagNodeLike>({
  nodes,
  edges,
  renderNode,
  direction = "LR",
  nodeWidth = 168,
  nodeHeight = 48,
  onSelect,
  highlightNeighbours = true,
  className,
}: DependencyGraphProps<N>) {
  const [active, setActive] = useState<string | null>(null);

  const layout = useMemo(
    () => layoutDag(nodes, edges, { direction, nodeWidth, nodeHeight }),
    [nodes, edges, direction, nodeWidth, nodeHeight]
  );
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Соседи выбранного узла — по обе стороны связей
  const neighbours = useMemo(() => {
    if (!active || !highlightNeighbours) return new Set<string>();
    const set = new Set<string>([active]);
    for (const edge of layout.edges) {
      if (edge.from === active) set.add(edge.to);
      if (edge.to === active) set.add(edge.from);
    }
    return set;
  }, [active, highlightNeighbours, layout.edges]);

  const dim = active !== null && highlightNeighbours;
  const pad = 12;

  return (
    <div className={`overflow-auto rounded-2xl border border-edge bg-surface p-3 ${className ?? ""}`}>
      <div className="relative" style={{ width: layout.width + pad * 2, height: layout.height + pad * 2 }}>
        <svg
          className="absolute left-0 top-0 overflow-visible"
          width={layout.width + pad * 2}
          height={layout.height + pad * 2}
          aria-hidden
        >
          <defs>
            <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="fill-muted" />
            </marker>
            <marker id="dep-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="fill-accent" />
            </marker>
          </defs>
          <g transform={`translate(${pad} ${pad})`}>
            {layout.edges.map((edge, i) => {
              const on = neighbours.has(edge.from) && neighbours.has(edge.to);
              const faded = dim && !on;
              return (
                <path
                  key={i}
                  d={edge.path}
                  fill="none"
                  className={on ? "stroke-accent" : "stroke-muted"}
                  strokeWidth={on ? 2 : 1.5}
                  strokeDasharray={edge.reversed ? "5 4" : undefined}
                  markerEnd={`url(#dep-arrow${on ? "-active" : ""})`}
                  style={{ opacity: faded ? 0.15 : edge.reversed ? 0.7 : 1, transition: "opacity .2s" }}
                />
              );
            })}
          </g>
        </svg>

        {layout.nodes.map((pos) => {
          const node = byId.get(pos.id);
          if (!node) return null;
          const on = neighbours.has(pos.id);
          const faded = dim && !on;
          return (
            <button
              key={pos.id}
              type="button"
              onClick={() => {
                setActive((a) => (a === pos.id ? null : pos.id));
                onSelect?.(node);
              }}
              className={`absolute rounded-xl border bg-surface-2 px-3 text-left text-sm shadow-sm transition hover:border-accent ${
                active === pos.id ? "border-accent ring-1 ring-accent" : "border-edge"
              }`}
              style={{
                left: pos.x + pad,
                top: pos.y + pad,
                width: pos.width,
                height: pos.height,
                opacity: faded ? 0.3 : 1,
              }}
            >
              {renderNode(node, { highlighted: on })}
            </button>
          );
        })}
      </div>

      {layout.cycleEdges.length > 0 && (
        <p className="mt-2 text-xs text-warning">
          В графе есть цикл ({layout.cycleEdges.length} обратных связей нарисованы пунктиром).
        </p>
      )}
    </div>
  );
}
