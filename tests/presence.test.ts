import { describe, expect, it } from "vitest";
import {
  applyPresence,
  colorFor,
  emptyPresence,
  initials,
  interpolate,
  pruneStale,
  selectionOwners,
  visibleCursors,
  type PresenceEvent,
} from "../registry/widgets/presence-layer/presence";

function event(over: Partial<PresenceEvent> = {}): PresenceEvent {
  return { actorId: "u1", name: "Мурат Тоймет", cursor: { x: 10, y: 10 }, at: 1000, ...over };
}

describe("colorFor", () => {
  it("один и тот же id — один и тот же цвет", () => {
    expect(colorFor("user-42")).toBe(colorFor("user-42"));
  });

  it("цвет из палитры", () => {
    expect(colorFor("x")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("applyPresence", () => {
  it("добавляет участника", () => {
    const state = applyPresence(emptyPresence(), event());
    expect(state.get("u1")!.name).toBe("Мурат Тоймет");
    expect(state.get("u1")!.target).toEqual({ x: 10, y: 10 });
  });

  it("свой курсор игнорируется", () => {
    const state = applyPresence(emptyPresence(), event({ actorId: "me" }), "me");
    expect(state.size).toBe(0);
  });

  it("устаревшее событие не откатывает позицию", () => {
    let state = applyPresence(emptyPresence(), event({ at: 2000, cursor: { x: 50, y: 50 } }));
    state = applyPresence(state, event({ at: 1000, cursor: { x: 0, y: 0 } }));
    expect(state.get("u1")!.target).toEqual({ x: 50, y: 50 });
  });

  it("цвет сохраняется между событиями", () => {
    let state = applyPresence(emptyPresence(), event());
    const color = state.get("u1")!.color;
    state = applyPresence(state, event({ at: 2000 }));
    expect(state.get("u1")!.color).toBe(color);
  });
});

describe("pruneStale", () => {
  it("убирает давно молчавших", () => {
    const state = applyPresence(emptyPresence(), event({ at: 1000 }));
    const pruned = pruneStale(state, 20_000, 15_000);
    expect(pruned.size).toBe(0);
  });

  it("свежих оставляет и не создаёт новую карту зря", () => {
    const state = applyPresence(emptyPresence(), event({ at: 1000 }));
    const pruned = pruneStale(state, 5000, 15_000);
    expect(pruned).toBe(state);
  });
});

describe("interpolate", () => {
  it("двигает нарисованный курсор к цели", () => {
    let state = applyPresence(emptyPresence(), event({ cursor: { x: 0, y: 0 } }));
    // сдвигаем цель, оставляя rendered на месте
    state = applyPresence(state, event({ at: 2000, cursor: { x: 100, y: 0 } }));
    const before = state.get("u1")!.rendered!.x;
    const next = interpolate(state, 16, 0.2);
    const after = next.get("u1")!.rendered!.x;
    expect(after).toBeGreaterThan(before);
    expect(after).toBeLessThan(100);
  });

  it("субпиксельный остаток защёлкивается на цель", () => {
    let state = applyPresence(emptyPresence(), event({ cursor: { x: 0, y: 0 } }));
    state = applyPresence(state, event({ at: 2000, cursor: { x: 0.2, y: 0 } }));
    const next = interpolate(state, 16, 0.5);
    expect(next.get("u1")!.rendered).toEqual({ x: 0.2, y: 0 });
  });
});

describe("visibleCursors / selectionOwners", () => {
  it("показывает курсоры с позицией", () => {
    const state = applyPresence(emptyPresence(), event());
    expect(visibleCursors(state)).toHaveLength(1);
  });

  it("находит владельцев выделения", () => {
    const state = applyPresence(emptyPresence(), event({ selection: "card-7" }));
    expect(selectionOwners(state, "card-7")).toHaveLength(1);
    expect(selectionOwners(state, "card-9")).toHaveLength(0);
  });
});

describe("initials", () => {
  it("две части — первая буква каждой крайней", () => {
    expect(initials("Мурат Тоймет")).toBe("МТ");
  });
  it("одно слово — две буквы", () => {
    expect(initials("Данияр")).toBe("ДА");
  });
  it("пусто — вопрос", () => {
    expect(initials("   ")).toBe("?");
  });
});
