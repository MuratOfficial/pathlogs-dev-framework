import { describe, expect, it } from "vitest";
import {
  assignLayers,
  breakCycles,
  countCrossings,
  layoutDag,
  median,
  orderLayers,
  type DagEdge,
} from "../registry/widgets/dep-graph/dagLayout";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `n${i}`);

describe("breakCycles", () => {
  it("ацикличный граф остаётся нетронутым", () => {
    const edges: DagEdge[] = [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ];
    const r = breakCycles(["a", "b", "c"], edges);
    expect(r.removed).toHaveLength(0);
    expect(r.acyclic).toHaveLength(2);
  });

  it("разрывает цикл, снимая обратную связь", () => {
    const edges: DagEdge[] = [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
      { from: "c", to: "a" },
    ];
    const r = breakCycles(["a", "b", "c"], edges);
    expect(r.removed).toHaveLength(1);
    // после снятия граф ацикличен — раскладка по слоям завершится
    expect(() => assignLayers(["a", "b", "c"], r.acyclic)).not.toThrow();
  });

  it("связь в несуществующую вершину выбрасывается", () => {
    const r = breakCycles(["a"], [{ from: "a", to: "ghost" }]);
    expect(r.acyclic).toHaveLength(0);
    expect(r.removed).toHaveLength(0);
  });
});

describe("assignLayers", () => {
  it("вершина встаёт за самым дальним предшественником", () => {
    const { layerOf } = assignLayers(["a", "b", "c"], [
      { from: "a", to: "c" },
      { from: "b", to: "c" },
    ]);
    expect(layerOf.get("a")).toBe(0);
    expect(layerOf.get("c")).toBe(1);
  });

  it("длинная цепочка растёт по слоям", () => {
    const { layerOf } = assignLayers(["a", "b", "c", "d"], [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
      { from: "c", to: "d" },
    ]);
    expect(layerOf.get("d")).toBe(3);
  });

  it("вершина без связей в первом слое", () => {
    const { layerOf } = assignLayers(["x"], []);
    expect(layerOf.get("x")).toBe(0);
  });
});

describe("countCrossings / orderLayers", () => {
  it("считает очевидное пересечение", () => {
    // два слоя: [a,b] -> [c,d], связи a->d и b->c пересекаются
    const layers = [
      ["a", "b"],
      ["c", "d"],
    ];
    const segments = [
      { from: "a", to: "d" },
      { from: "b", to: "c" },
    ];
    expect(countCrossings(layers, segments)).toBe(1);
  });

  it("упорядочивание не увеличивает число пересечений", () => {
    const layers = [
      ["a", "b", "c"],
      ["d", "e", "f"],
    ];
    const segments = [
      { from: "a", to: "f" },
      { from: "b", to: "e" },
      { from: "c", to: "d" },
    ];
    const before = countCrossings(layers, segments);
    const after = countCrossings(orderLayers(layers, segments, 4), segments);
    expect(after).toBeLessThanOrEqual(before);
  });
});

describe("median", () => {
  it("нечётное — средний элемент", () => {
    expect(median([3, 1, 2])).toBe(2);
  });
  it("чётное — среднее двух средних", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("пусто — минус один", () => {
    expect(median([])).toBe(-1);
  });
});

describe("layoutDag", () => {
  it("пустой граф даёт пустую раскладку", () => {
    const layout = layoutDag([], []);
    expect(layout.nodes).toHaveLength(0);
    expect(layout.width).toBe(0);
  });

  it("раскладывает вершины и строит пути связей", () => {
    const nodes = ids(3).map((id) => ({ id }));
    const layout = layoutDag(nodes, [
      { from: "n0", to: "n1" },
      { from: "n1", to: "n2" },
    ]);
    expect(layout.nodes).toHaveLength(3);
    expect(layout.edges).toHaveLength(2);
    expect(layout.edges[0]!.path.startsWith("M")).toBe(true);
  });

  it("длинная связь получает изгибы через служебные вершины", () => {
    const nodes = ids(3).map((id) => ({ id }));
    // n0 -> n2 перескакивает слой (n0->n1->n2 задаёт слои 0,1,2)
    const layout = layoutDag(nodes, [
      { from: "n0", to: "n1" },
      { from: "n1", to: "n2" },
      { from: "n0", to: "n2" },
    ]);
    const long = layout.edges.find((e) => e.from === "n0" && e.to === "n2")!;
    // точек больше двух — значит есть изгиб
    expect(long.points.length).toBeGreaterThan(2);
    // служебные вершины не попадают в список узлов
    expect(layout.nodes).toHaveLength(3);
  });

  it("цикл отражается в cycleEdges, но раскладка строится", () => {
    const nodes = ids(3).map((id) => ({ id }));
    const layout = layoutDag(nodes, [
      { from: "n0", to: "n1" },
      { from: "n1", to: "n2" },
      { from: "n2", to: "n0" },
    ]);
    expect(layout.cycleEdges).toHaveLength(1);
    expect(layout.nodes).toHaveLength(3);
  });
});
