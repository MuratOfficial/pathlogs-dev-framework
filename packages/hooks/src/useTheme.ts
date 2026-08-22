"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  getResolvedTheme,
  getThemePreference,
  setThemePreference,
  subscribeTheme,
  toggleTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@pathlogs/tokens";

/**
 * Текущая тема как внешнее состояние DOM.
 *
 * useSyncExternalStore, а не useState + useEffect: тему ставит инлайн-скрипт
 * ещё до гидратации, и чтение через состояние React дало бы кадр с чужой
 * темой и предупреждение о рассинхроне. Здесь же серверный снимок честно
 * говорит «тема по умолчанию», а клиент сразу читает настоящую.
 */
export function useTheme(storageKey?: string): {
  /** Что выбрал пользователь: light, dark или system. */
  preference: ThemePreference;
  /** Что видно на экране: system уже развёрнут. */
  resolved: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Переключает светлую и тёмную. */
  toggle: () => void;
} {
  const preference = useSyncExternalStore(
    subscribeTheme,
    getThemePreference,
    () => DEFAULT_THEME
  );
  const resolved = useSyncExternalStore(
    subscribeTheme,
    getResolvedTheme,
    () => DEFAULT_THEME as ResolvedTheme
  );

  return {
    preference,
    resolved,
    setTheme: (theme) => setThemePreference(theme, storageKey),
    toggle: () => void toggleTheme(storageKey),
  };
}
