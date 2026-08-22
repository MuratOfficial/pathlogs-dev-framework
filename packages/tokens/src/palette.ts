/**
 * Палитры и работа с цветом. Всё чистые функции — их одинаково зовут
 * серверные валидаторы и клиентские превью, поэтому цвет, сохранённый
 * в базе, и цвет на экране не расходятся.
 */

/** Палитра для перекраски карточек, колонок и меток. Приглушённая. */
export const BOARD_PALETTE = [
  "#94a3b8",
  "#60a5fa",
  "#6366f1",
  "#c084fc",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#84cc16",
  "#4ade80",
  "#14b8a6",
] as const;

/**
 * Палитра фоновых подложек — ярче, чем у карточек: фон полупрозрачный,
 * приглушённые оттенки на нём просто не видны.
 */
export const SURFACE_PALETTE = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#a855f7",
  "#8b5cf6",
  "#64748b",
] as const;

/** Цвет в формате #rrggbb. Проверяется и на клиенте, и на сервере. */
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

/** Раскладывает #rrggbb на составляющие. Невалидный цвет даёт null. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isHexColor(hex)) return null;
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Относительная яркость по WCAG 2.1. Нужна не сама по себе, а чтобы выбрать
 * читаемый цвет текста на произвольном фоне — цвета меток и колонок задаёт
 * пользователь, и белый текст на жёлтом не читается.
 */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** Чёрный или белый — тот, что контрастнее на этом фоне. */
export function readableTextOn(hex: string): "#000000" | "#ffffff" {
  return luminance(hex) > 0.45 ? "#000000" : "#ffffff";
}

/**
 * Цвет с прозрачностью: `alpha("#6366f1", 0.3)` → `#6366f14d`.
 * Восьмизначный hex, а не rgba(), — такую строку можно склеивать
 * в градиенты и подставлять в CSS-переменные без разбора.
 */
export function alpha(hex: string, opacity: number): string {
  if (!isHexColor(hex)) return hex;
  const clamped = Math.min(1, Math.max(0, opacity));
  const suffix = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${suffix}`;
}

/** Подложка: сплошной цвет или градиент, оба — полупрозрачные. */
export interface SurfaceBackdrop {
  color: string;
  /** null — однотонная подложка без градиента. */
  colorTo?: string | null;
  /** Направление градиента в градусах. */
  angle?: number;
}

/**
 * CSS-фон подложки. Цвета берём с прозрачностью: фон подкрашивает страницу,
 * но не спорит с текстом и одинаково работает в тёмной и светлой теме.
 * Одна функция на саму подложку и на превью в настройках — они не разъедутся.
 */
export function backdropCss(bg: SurfaceBackdrop): string {
  const base = alpha(bg.color, 0.3);
  if (bg.colorTo) {
    return `linear-gradient(${bg.angle ?? 135}deg, ${base}, ${alpha(bg.colorTo, 0.3)})`;
  }
  return `radial-gradient(120% 80% at 12% 0%, ${base}, transparent 62%), ${alpha(bg.color, 0.1)}`;
}
