import { describe, expect, it } from "vitest";
import {
  branchIds,
  canDrop,
  checkStates,
  collectIds,
  filterTree,
  findNode,
  flattenTree,
  isDescendant,
  moveNode,
  toggleChecked,
  treeKeyAction,
} from "../registry/widgets/tree-view/treeModel";

interface Node {
  id: string;
  children?: Node[];
}

const TREE: Node[] = [
  {
    id: "src",
    children: [
      { id: "index", children: [] },
      { id: "components", children: [{ id: "Button" }, { id: "Dialog" }] },
    ],
  },
  { id: "readme" },
];

describe("flattenTree", () => {
  it("свёрнутое дерево — только корни", () => {
    const rows = flattenTree(TREE, new Set());
    expect(rows.map((r) => r.id)).toEqual(["src", "readme"]);
  });

  it("развёрнутая ветка добавляет детей с глубиной", () => {
    const rows = flattenTree(TREE, new Set(["src"]));
    expect(rows.map((r) => r.id)).toEqual(["src", "index", "components", "readme"]);
    expect(rows.find((r) => r.id === "index")!.depth).toBe(1);
  });

  it("нумерует строки по порядку", () => {
    const rows = flattenTree(TREE, new Set(["src"]));
    expect(rows.map((r) => r.index)).toEqual([0, 1, 2, 3]);
  });
});

describe("findNode / collectIds / branchIds", () => {
  it("находит узел и его путь", () => {
    const loc = findNode(TREE, "Button")!;
    expect(loc.path).toEqual(["src", "components", "Button"]);
    expect(loc.parent!.id).toBe("components");
  });

  it("collectIds собирает всё поддерево", () => {
    const loc = findNode(TREE, "components")!;
    expect(collectIds(loc.node).sort()).toEqual(["Button", "Dialog", "components"]);
  });

  it("branchIds — только узлы с детьми", () => {
    expect(branchIds(TREE).sort()).toEqual(["components", "src"]);
  });
});

describe("isDescendant / canDrop", () => {
  it("узнаёт потомка", () => {
    expect(isDescendant(TREE, "src", "Button")).toBe(true);
    expect(isDescendant(TREE, "components", "readme")).toBe(false);
  });

  it("нельзя перенести узел в собственного потомка", () => {
    expect(canDrop(TREE, "src", "Button", "inside")).toBe(false);
  });

  it("нельзя перенести на самого себя", () => {
    expect(canDrop(TREE, "Button", "Button", "before")).toBe(false);
  });

  it("обычный перенос разрешён", () => {
    expect(canDrop(TREE, "readme", "components", "inside")).toBe(true);
  });
});

describe("moveNode", () => {
  it("переносит узел в новую ветку", () => {
    const next = moveNode(TREE, "readme", "components", "inside");
    const loc = findNode(next, "readme")!;
    expect(loc.parent!.id).toBe("components");
  });

  it("недопустимый перенос возвращает прежнее дерево", () => {
    expect(moveNode(TREE, "src", "Button", "inside")).toBe(TREE);
  });

  it("перенесённое поддерево не теряется", () => {
    const next = moveNode(TREE, "components", "readme", "after");
    expect(findNode(next, "Button")).not.toBeNull();
  });
});

describe("checkStates / toggleChecked", () => {
  it("родитель частично отмечен, если отмечен один ребёнок", () => {
    const states = checkStates(TREE, new Set(["Button"]));
    expect(states.get("components")).toBe("partial");
  });

  it("родитель отмечен, когда отмечены все дети", () => {
    const states = checkStates(TREE, new Set(["Button", "Dialog"]));
    expect(states.get("components")).toBe("on");
  });

  it("переключение ветки отмечает всё поддерево", () => {
    const next = toggleChecked(TREE, new Set(), "components");
    expect(next.has("Button")).toBe(true);
    expect(next.has("Dialog")).toBe(true);
  });

  it("нажатие на частично отмеченный делает его полным", () => {
    const next = toggleChecked(TREE, new Set(["Button"]), "components");
    expect(checkStates(TREE, next).get("components")).toBe("on");
  });
});

describe("treeKeyAction", () => {
  const rows = flattenTree(TREE, new Set(["src"]));

  it("стрелка вниз двигает фокус", () => {
    expect(treeKeyAction(rows, "src", "ArrowDown")).toEqual({ type: "focus", id: "index" });
  });

  it("стрелка вправо разворачивает свёрнутый узел", () => {
    expect(treeKeyAction(rows, "components", "ArrowRight")).toEqual({ type: "expand", id: "components" });
  });

  it("стрелка вправо на развёрнутом уходит к первому ребёнку", () => {
    expect(treeKeyAction(rows, "src", "ArrowRight")).toEqual({ type: "focus", id: "index" });
  });

  it("стрелка влево на развёрнутом сворачивает", () => {
    expect(treeKeyAction(rows, "src", "ArrowLeft")).toEqual({ type: "collapse", id: "src" });
  });

  it("стрелка влево на листе поднимается к родителю", () => {
    expect(treeKeyAction(rows, "index", "ArrowLeft")).toEqual({ type: "focus", id: "src" });
  });

  it("Home и End прыгают к краям", () => {
    expect(treeKeyAction(rows, "index", "Home")).toEqual({ type: "focus", id: "src" });
    expect(treeKeyAction(rows, "src", "End")).toEqual({ type: "focus", id: "readme" });
  });
});

describe("filterTree", () => {
  it("оставляет найденное вместе с предками и разворачивает путь", () => {
    const res = filterTree(TREE, (n) => n.id === "Button");
    expect(res.matches.has("Button")).toBe(true);
    expect(res.expand.has("components")).toBe(true);
    expect(res.expand.has("src")).toBe(true);
    // readme и Dialog отфильтрованы
    expect(findNode(res.nodes, "readme")).toBeNull();
    expect(findNode(res.nodes, "Dialog")).toBeNull();
  });
});
