import { describe, expect, it } from "vitest";
import {
  dropUndo,
  expireUndo,
  pushUndo,
  remainingMs,
  undoLabel,
  undoProgress,
  type UndoAction,
} from "@toimetdev/pathlogs-core";

function action(over: Partial<UndoAction> = {}): Parameters<typeof pushUndo>[1] {
  return { label: "Удалено", at: 1000, ttlMs: 5000, ...over };
}

describe("pushUndo", () => {
  it("кладёт новое действие сверху", () => {
    let stack = pushUndo<unknown>([], action({ label: "Первое", at: 1000 }));
    stack = pushUndo(stack, action({ label: "Второе", at: 2000 }));
    expect(stack[0]!.label).toBe("Второе");
  });

  it("сливает однотипные по ключу внутри окна", () => {
    let stack = pushUndo<unknown>([], action({ mergeKey: "del", at: 1000 }));
    stack = pushUndo(stack, action({ mergeKey: "del", at: 2000 }), { mergeWindowMs: 4000 });
    expect(stack).toHaveLength(1);
    expect(stack[0]!.count).toBe(2);
  });

  it("слияние продлевает жизнь от последнего действия", () => {
    let stack = pushUndo<unknown>([], action({ mergeKey: "del", at: 1000, ttlMs: 5000 }));
    stack = pushUndo(stack, action({ mergeKey: "del", at: 3000, ttlMs: 5000 }));
    // окно отсчитывается от 3000, а не от 1000
    expect(remainingMs(stack[0]!, 5000)).toBe(3000);
  });

  it("за пределами окна слияния — новая запись", () => {
    let stack = pushUndo<unknown>([], action({ mergeKey: "del", at: 1000 }));
    stack = pushUndo(stack, action({ mergeKey: "del", at: 9000 }), { mergeWindowMs: 4000 });
    expect(stack).toHaveLength(2);
  });

  it("разные ключи не сливаются", () => {
    let stack = pushUndo<unknown>([], action({ mergeKey: "del", at: 1000 }));
    stack = pushUndo(stack, action({ mergeKey: "archive", at: 1500 }));
    expect(stack).toHaveLength(2);
  });

  it("глубина ограничена", () => {
    let stack: UndoAction[] = [];
    for (let i = 0; i < 10; i += 1) stack = pushUndo(stack, action({ at: i * 100, label: `${i}` }), { max: 3 });
    expect(stack).toHaveLength(3);
  });
});

describe("remainingMs / undoProgress", () => {
  it("остаток убывает со временем", () => {
    const a = pushUndo<unknown>([], action({ at: 0, ttlMs: 1000 }))[0]!;
    expect(remainingMs(a, 250)).toBe(750);
    expect(remainingMs(a, 2000)).toBe(0);
  });

  it("прогресс идёт от 0 к 1", () => {
    const a = pushUndo<unknown>([], action({ at: 0, ttlMs: 1000 }))[0]!;
    expect(undoProgress(a, 0)).toBe(0);
    expect(undoProgress(a, 500)).toBeCloseTo(0.5);
    expect(undoProgress(a, 2000)).toBe(1);
  });
});

describe("expireUndo / dropUndo", () => {
  it("делит на живые и истёкшие", () => {
    const stack = [
      pushUndo<unknown>([], action({ at: 0, ttlMs: 1000 }))[0]!,
      pushUndo<unknown>([], action({ at: 5000, ttlMs: 1000 }))[0]!,
    ];
    const { kept, expired } = expireUndo(stack, 3000);
    expect(kept).toHaveLength(1);
    expect(expired).toHaveLength(1);
  });

  it("dropUndo убирает по id", () => {
    const stack = pushUndo<unknown>([], action({ id: "x" } as never));
    expect(dropUndo(stack, stack[0]!.id)).toHaveLength(0);
  });
});

describe("undoLabel", () => {
  it("одиночное действие без счётчика", () => {
    expect(undoLabel({ label: "Удалено", count: 1 } as UndoAction)).toBe("Удалено");
  });

  it("серия с счётчиком", () => {
    expect(undoLabel({ label: "Удалено", count: 3 } as UndoAction)).toBe("Удалено ×3");
  });
});
