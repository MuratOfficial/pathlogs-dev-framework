"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent } from "react";
import {
  IDENTITY_VIEWPORT,
  boundingBox,
  edgePath,
  fitView,
  panBy,
  portPoint,
  screenToWorld,
  snapToGrid,
  worldToScreen,
  zoomAt,
  type Point,
  type PortSide,
  type Viewport,
} from "./viewport";

export interface FlowNode {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  /** С какого края узла выходит и в какой входит. */
  fromSide?: PortSide;
  toSide?: PortSide;
}

export interface FlowCanvasProps<N extends FlowNode> {
  nodes: N[];
  edges?: FlowEdge[];
  renderNode: (node: N, meta: { selected: boolean }) => ReactNode;
  onNodesChange?: (nodes: N[]) => void;
  onSelect?: (node: N | null) => void;
  /** Шаг сетки для привязки и фона. 0 — без сетки. */
  grid?: number;
  height?: number | string;
  defaultNodeSize?: { width: number; height: number };
  className?: string;
}

/**
 * Канва pan/zoom с узлами и связями — мини-react-flow.
 *
 * Ложится на ту же математику «мир ↔ экран», что и `DragScroll` из ядра:
 * трансформации, зум к курсору, привязка к сетке и точки портов — в
 * `viewport.ts` под тестами. Здесь — жесты мыши и отрисовка. Зум колесом
 * держит точку под курсором на месте, а не тащит холст в угол.
 */
export function FlowCanvas<N extends FlowNode>({
  nodes,
  edges = [],
  renderNode,
  onNodesChange,
  onSelect,
  grid = 20,
  height = 460,
  defaultNodeSize = { width: 150, height: 56 },
  className,
}: FlowCanvasProps<N>) {
  const surface = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<Viewport>(IDENTITY_VIEWPORT);
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ id: string | null; startWorld: Point; origin: Map<string, Point> } | null>(null);
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const sized = (n: N) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    width: n.width ?? defaultNodeSize.width,
    height: n.height ?? defaultNodeSize.height,
  });

  function screenPoint(e: { clientX: number; clientY: number }): Point {
    const box = surface.current!.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    // Тачпад-зум и колесо: множитель мягкий, чтобы шаг не был скачком
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setView((v) => zoomAt(v, screenPoint(e), factor));
  }

  function startNodeDrag(e: ReactPointerEvent, node: N) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSelected(node.id);
    onSelect?.(node);
    drag.current = {
      id: node.id,
      startWorld: screenToWorld(screenPoint(e), view),
      origin: new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
    };
  }

  function startPan(e: ReactPointerEvent) {
    setSelected(null);
    onSelect?.(null);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pan.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (drag.current?.id && onNodesChange) {
      const world = screenToWorld(screenPoint(e), view);
      const dx = world.x - drag.current.startWorld.x;
      const dy = world.y - drag.current.startWorld.y;
      const origin = drag.current.origin.get(drag.current.id)!;
      const nx = snapToGrid(origin.x + dx, grid);
      const ny = snapToGrid(origin.y + dy, grid);
      onNodesChange(nodes.map((n) => (n.id === drag.current!.id ? { ...n, x: nx, y: ny } : n)));
    } else if (pan.current) {
      setView((v) => ({ ...v, x: pan.current!.vx + (e.clientX - pan.current!.x), y: pan.current!.vy + (e.clientY - pan.current!.y) }));
    }
  }

  function endGesture() {
    drag.current = null;
    pan.current = null;
  }

  function resetView() {
    const box = surface.current?.getBoundingClientRect();
    if (!box) return;
    setView(fitView(boundingBox(nodes.map(sized)), box.width, box.height));
  }

  const gridStyle = grid > 0
    ? {
        backgroundSize: `${grid * view.scale}px ${grid * view.scale}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, var(--muted) 35%, transparent) 1px, transparent 1px)",
      }
    : undefined;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-edge bg-surface ${className ?? ""}`} style={{ height }}>
      <div
        ref={surface}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        style={gridStyle}
        onWheel={onWheel}
        onPointerDown={startPan}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerLeave={endGesture}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {edges.map((edge, i) => {
            const from = nodes.find((n) => n.id === edge.from);
            const to = nodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            const a = worldToScreen(portPoint(sized(from), edge.fromSide ?? "right"), view);
            const b = worldToScreen(portPoint(sized(to), edge.toSide ?? "left"), view);
            return (
              <path key={i} d={edgePath(a, b)} fill="none" className="stroke-accent/70" strokeWidth={2} />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const s = sized(node);
          const screen = worldToScreen({ x: s.x, y: s.y }, view);
          return (
            <div
              key={node.id}
              onPointerDown={(e) => startNodeDrag(e, node)}
              className={`absolute cursor-grab touch-none rounded-xl border bg-surface-2 shadow-sm transition-colors active:cursor-grabbing ${
                selected === node.id ? "border-accent ring-1 ring-accent" : "border-edge"
              }`}
              style={{
                left: screen.x,
                top: screen.y,
                width: s.width * view.scale,
                height: s.height * view.scale,
                transformOrigin: "top left",
              }}
            >
              <div style={{ transform: `scale(${view.scale})`, transformOrigin: "top left", width: s.width, height: s.height }}>
                {renderNode(node, { selected: selected === node.id })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1">
        <CanvasButton onClick={() => setView((v) => zoomAt(v, { x: (surface.current?.clientWidth ?? 0) / 2, y: (surface.current?.clientHeight ?? 0) / 2 }, 1.2))}>+</CanvasButton>
        <CanvasButton onClick={() => setView((v) => zoomAt(v, { x: (surface.current?.clientWidth ?? 0) / 2, y: (surface.current?.clientHeight ?? 0) / 2 }, 1 / 1.2))}>−</CanvasButton>
        <CanvasButton onClick={resetView} title="Уместить всё">⤢</CanvasButton>
      </div>
      <span className="absolute bottom-3 left-3 rounded bg-surface/80 px-1.5 py-0.5 text-[11px] tabular-nums text-muted">
        {Math.round(view.scale * 100)}%
      </span>
    </div>
  );
}

function CanvasButton({ children, onClick, title }: { children: ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-edge bg-surface text-sm text-foreground shadow-sm hover:border-accent"
    >
      {children}
    </button>
  );
}
