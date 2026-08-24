import { describe, expect, it } from "vitest";
import { estimateWidth, fitSegments, type StatusSegment } from "@toimetdev/pathlogs-core";

function seg(id: string, width: number, priority = 0, pinned = false): StatusSegment {
  return { id, width, priority, pinned };
}

describe("fitSegments", () => {
  it("всё влезает — ничего не прячет", () => {
    const r = fitSegments([seg("a", 50), seg("b", 50)], 500, { gap: 10 });
    expect(r.hidden).toHaveLength(0);
    expect(r.shown).toHaveLength(2);
  });

  it("убирает наименее важный первым", () => {
    const r = fitSegments([seg("a", 100, 5), seg("b", 100, 1), seg("c", 100, 9)], 250, {
      gap: 10,
      overflowWidth: 30,
    });
    expect(r.hidden.map((s) => s.id)).toContain("b");
    expect(r.shown.map((s) => s.id)).toContain("c");
  });

  it("при равном приоритете первым уходит правый", () => {
    const r = fitSegments([seg("a", 100, 0), seg("b", 100, 0), seg("c", 100, 0)], 250, {
      gap: 10,
      overflowWidth: 20,
    });
    expect(r.hidden.map((s) => s.id)).toContain("c");
  });

  it("закреплённый сегмент не убирается даже при нехватке места", () => {
    const r = fitSegments([seg("net", 100, 0, true), seg("b", 100, 5)], 120, { gap: 10 });
    expect(r.shown.map((s) => s.id)).toContain("net");
  });

  it("скрытые возвращаются в исходном порядке", () => {
    const r = fitSegments(
      [seg("a", 100, 0), seg("b", 100, 1), seg("c", 100, 0), seg("d", 100, 2)],
      150,
      { gap: 10, overflowWidth: 20 }
    );
    const ids = r.hidden.map((s) => s.id);
    const sorted = [...ids].sort((x, y) => "abcd".indexOf(x) - "abcd".indexOf(y));
    expect(ids).toEqual(sorted);
  });
});

describe("estimateWidth", () => {
  it("растёт с длиной текста", () => {
    expect(estimateWidth("long text here")).toBeGreaterThan(estimateWidth("hi"));
  });
});
