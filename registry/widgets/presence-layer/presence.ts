/**
 * Присутствие соучастников: курсоры и выделения поверх поверхности —
 * без React и без DOM.
 *
 * Данные приходят рывками по сети: то три события за кадр, то тишина
 * секунду. Показывать их как есть — значит получить дёргающиеся курсоры и
 * «призраков», которые остались висеть после ухода человека. Поэтому здесь
 * сглаживание, устаревание по TTL и устойчивый цвет по идентификатору.
 * Питается это тем же потоком, что и `useEventStream`.
 */

/** Позиция. */
export interface Point {
  x: number;
  y: number;
}

/** Сырое событие присутствия из потока. */
export interface PresenceEvent {
  actorId: string;
  name: string;
  /** Курсор в координатах поверхности. `null` — курсор ушёл за пределы. */
  cursor?: Point | null;
  /** Что человек сейчас выделил или держит: id узла, карточки, строки. */
  selection?: string | null;
  /** Метка времени события (мс). */
  at: number;
}

/** Состояние одного участника. */
export interface Participant {
  actorId: string;
  name: string;
  /** Куда курсор едет — последняя присланная позиция. */
  target: Point | null;
  /** Где курсор нарисован — догоняет target сглаживанием. */
  rendered: Point | null;
  selection: string | null;
  /** Когда пришло последнее событие (мс). */
  lastSeen: number;
  /** Цвет участника — стабильный между сессиями. */
  color: string;
}

/**
 * Палитра присутствия: различимые тона, разнесённые по кругу оттенков.
 *
 * Порядок подобран так, чтобы первые несколько участников получили заведомо
 * разные цвета: в комнате обычно двое-трое, и именно их цвета не должны
 * оказаться похожими.
 */
export const PRESENCE_COLORS = [
  "#6366f1",
  "#ec4899",
  "#22c55e",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
] as const;

/**
 * Устойчивый цвет по идентификатору.
 *
 * Хеш, а не счётчик по порядку подключения: цвет должен зависеть только от
 * того, кто это, — тогда один и тот же человек узнаётся по цвету и после
 * переподключения, и на экране у другого участника.
 */
export function colorFor(actorId: string, palette: readonly string[] = PRESENCE_COLORS): string {
  let hash = 0;
  for (let i = 0; i < actorId.length; i += 1) {
    // Классический полиномиальный хеш с обрезкой до 32 бит
    hash = (hash * 31 + actorId.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(hash) % palette.length]!;
}

/** Пустая карта участников. */
export function emptyPresence(): Map<string, Participant> {
  return new Map();
}

/**
 * Вносит событие в карту участников.
 *
 * Событие старше уже известного игнорируется: пакеты по сети приходят с
 * опозданием и не по порядку, и без этой проверки курсор дёргался бы назад
 * к устаревшей позиции. Свой актор отсекается заранее — рисовать себе
 * собственный курсор незачем.
 */
export function applyPresence(
  state: Map<string, Participant>,
  event: PresenceEvent,
  selfId?: string
): Map<string, Participant> {
  if (event.actorId === selfId) return state;

  const existing = state.get(event.actorId);
  if (existing && event.at < existing.lastSeen) return state;

  const next = new Map(state);
  next.set(event.actorId, {
    actorId: event.actorId,
    name: event.name,
    target: event.cursor ?? null,
    // При первом появлении рисуем сразу в target: сглаживать не от чего,
    // а иначе курсор бы «прилетал» из левого верхнего угла
    rendered: existing?.rendered ?? event.cursor ?? null,
    selection: event.selection ?? null,
    lastSeen: event.at,
    color: existing?.color ?? colorFor(event.actorId),
  });
  return next;
}

/**
 * Убирает участников, от которых давно нет вестей.
 *
 * TTL, а не явное событие «ушёл»: вкладку закрывают, связь рвётся, и
 * прощального события просто не приходит. Без истечения такие «призраки»
 * копились бы на экране навсегда.
 */
export function pruneStale(
  state: Map<string, Participant>,
  now: number,
  ttlMs = 15_000
): Map<string, Participant> {
  let changed = false;
  const next = new Map(state);
  for (const [id, p] of state) {
    if (now - p.lastSeen > ttlMs) {
      next.delete(id);
      changed = true;
    }
  }
  return changed ? next : state;
}

/**
 * Двигает нарисованные курсоры к целям на один кадр.
 *
 * Экспоненциальное сглаживание, привязанное к прошедшему времени: курсор
 * проходит долю пути к цели за кадр, поэтому при редких событиях он не
 * телепортируется, а плавно доезжает. `factor` нормируется на 16 мс, чтобы
 * скорость догона не зависела от частоты кадров.
 */
export function interpolate(
  state: Map<string, Participant>,
  dtMs: number,
  smoothing = 0.2
): Map<string, Participant> {
  const factor = 1 - Math.pow(1 - smoothing, Math.max(0, dtMs) / 16);
  let changed = false;
  const next = new Map(state);

  for (const [id, p] of state) {
    if (!p.target) continue;
    if (!p.rendered) {
      next.set(id, { ...p, rendered: p.target });
      changed = true;
      continue;
    }

    const dx = p.target.x - p.rendered.x;
    const dy = p.target.y - p.rendered.y;
    // Меньше половины пикселя — считаем, что доехали: иначе курсор
    // бесконечно дрожит на субпиксельных остатках
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      if (p.rendered.x !== p.target.x || p.rendered.y !== p.target.y) {
        next.set(id, { ...p, rendered: p.target });
        changed = true;
      }
      continue;
    }

    next.set(id, {
      ...p,
      rendered: { x: p.rendered.x + dx * factor, y: p.rendered.y + dy * factor },
    });
    changed = true;
  }

  return changed ? next : state;
}

/** Участники с курсором на экране — то, что реально рисуется. */
export function visibleCursors(state: Map<string, Participant>): Participant[] {
  return [...state.values()].filter((p) => p.rendered !== null);
}

/** Кто держит данный объект выделенным — для подсветки чужого выбора. */
export function selectionOwners(state: Map<string, Participant>, itemId: string): Participant[] {
  return [...state.values()].filter((p) => p.selection === itemId);
}

/** Инициалы для метки курсора: одна-две буквы из имени. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
