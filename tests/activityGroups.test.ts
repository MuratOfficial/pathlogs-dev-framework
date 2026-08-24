import { describe, expect, it } from "vitest";
import {
  collapseBursts,
  dayLabel,
  groupActivity,
  relativeTime,
  type ActivityEventLike,
} from "@toimetdev/pathlogs-core";

function ev(id: string, at: string, kind = "comment", actorId = "u1"): ActivityEventLike {
  return { id, at, kind, actorId };
}

describe("groupActivity — деление по дням", () => {
  it("режет события по календарным дням", () => {
    const days = groupActivity([
      ev("a", "2026-02-14T10:00:00"),
      ev("b", "2026-02-14T12:00:00"),
      ev("c", "2026-02-13T09:00:00"),
    ]);
    expect(days).toHaveLength(2);
    expect(days[0]!.key).toBe("2026-02-14");
    expect(days[0]!.total).toBe(2);
  });

  it("по умолчанию новые дни сверху", () => {
    const days = groupActivity([
      ev("a", "2026-02-10T10:00:00"),
      ev("b", "2026-02-12T10:00:00"),
    ]);
    expect(days[0]!.key).toBe("2026-02-12");
  });

  it("серия не пересекает границу дня", () => {
    // три события подряд, но одно — в другой день
    const days = groupActivity(
      [
        ev("a", "2026-02-14T23:50:00"),
        ev("b", "2026-02-14T23:55:00"),
        ev("c", "2026-02-15T00:05:00"),
      ],
      { burstThreshold: 2, burstWindowMs: 60 * 60_000, order: "asc" }
    );
    // 14-е: серия из двух; 15-е: одиночка
    const day14 = days.find((d) => d.key === "2026-02-14")!;
    expect(day14.entries).toHaveLength(1);
    expect(day14.entries[0]!.type).toBe("burst");
  });
});

describe("collapseBursts", () => {
  it("сворачивает подряд идущие однотипные", () => {
    const entries = collapseBursts(
      [
        ev("a", "2026-02-14T10:00:00"),
        ev("b", "2026-02-14T10:05:00"),
        ev("c", "2026-02-14T10:10:00"),
      ],
      { burstThreshold: 3, burstWindowMs: 30 * 60_000 }
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ type: "burst" });
    if (entries[0]!.type === "burst") expect(entries[0].events).toHaveLength(3);
  });

  it("ниже порога остаются одиночками", () => {
    const entries = collapseBursts(
      [ev("a", "2026-02-14T10:00:00"), ev("b", "2026-02-14T10:05:00")],
      { burstThreshold: 3 }
    );
    expect(entries.every((e) => e.type === "single")).toBe(true);
  });

  it("разный тип обрывает серию", () => {
    const entries = collapseBursts(
      [
        ev("a", "2026-02-14T10:00:00", "comment"),
        ev("b", "2026-02-14T10:01:00", "status"),
        ev("c", "2026-02-14T10:02:00", "comment"),
      ],
      { burstThreshold: 2 }
    );
    expect(entries).toHaveLength(3);
  });

  it("разрыв больше окна начинает новую серию", () => {
    const entries = collapseBursts(
      [
        ev("a", "2026-02-14T10:00:00"),
        ev("b", "2026-02-14T10:05:00"),
        ev("c", "2026-02-14T13:00:00"),
        ev("d", "2026-02-14T13:02:00"),
      ],
      { burstThreshold: 2, burstWindowMs: 30 * 60_000 }
    );
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.type === "burst")).toBe(true);
  });

  it("разрыв считается между соседями, а не от начала", () => {
    // десять правок по одной в 20 минут — одна серия, не пять
    const events = Array.from({ length: 6 }, (_, i) =>
      ev(`e${i}`, new Date(2026, 1, 14, 10, i * 20).toISOString())
    );
    const entries = collapseBursts(events, { burstThreshold: 2, burstWindowMs: 30 * 60_000 });
    expect(entries).toHaveLength(1);
  });

  it("другой автор обрывает серию при sameActor", () => {
    const entries = collapseBursts(
      [
        ev("a", "2026-02-14T10:00:00", "comment", "u1"),
        ev("b", "2026-02-14T10:01:00", "comment", "u2"),
      ],
      { burstThreshold: 2, sameActor: true }
    );
    expect(entries).toHaveLength(2);
  });
});

describe("relativeTime / dayLabel", () => {
  const now = new Date(2026, 1, 14, 12, 0, 0);

  it("минуты назад", () => {
    const at = new Date(now.getTime() - 5 * 60_000);
    expect(relativeTime(at, now, "en-US")).toMatch(/min/);
  });

  it("меньше минуты — «только что», не «0 секунд»", () => {
    const at = new Date(now.getTime() - 10_000);
    expect(relativeTime(at, now, "en-US")).toBeTruthy();
  });

  it("сегодня и вчера — словами", () => {
    expect(dayLabel(now, now, "en-US").toLowerCase()).toContain("today");
    const yest = new Date(now.getTime() - 86_400_000);
    expect(dayLabel(yest, now, "en-US").toLowerCase()).toContain("yesterday");
  });

  it("прошлый год показывается с годом", () => {
    const old = new Date(2024, 5, 1);
    expect(dayLabel(old, now, "en-US")).toMatch(/2024/);
  });
});
