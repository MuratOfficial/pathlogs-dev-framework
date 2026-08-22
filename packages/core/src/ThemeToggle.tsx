"use client";

import { useTheme } from "@pathlogs/hooks";
import { cn } from "./cn.js";

export interface ThemeToggleProps {
  /** Ключ в localStorage. Совпадает с ключом в themeScript(). */
  storageKey?: string;
  labels?: {
    toDark?: string;
    toLight?: string;
    /** Доступное имя кнопки. */
    action?: string;
  };
  className?: string;
}

/**
 * Переключатель светлой и тёмной темы.
 *
 * Тема лежит в localStorage и в атрибуте [data-theme] на <html>; начальное
 * значение ставит инлайн-скрипт themeScript() из @pathlogs/tokens — без него
 * страница мигнёт чужой темой до гидратации.
 */
export function ThemeToggle({ storageKey, labels, className }: ThemeToggleProps = {}) {
  const { resolved, toggle } = useTheme(storageKey);
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      data-tip={isDark ? (labels?.toLight ?? "Light theme") : (labels?.toDark ?? "Dark theme")}
      aria-label={labels?.action ?? "Toggle theme"}
      className={cn("pl-theme-toggle", className)}
    >
      {/* Иконки лежат друг на друге и меняются поворотом — переключение
          читается как одно движение, а не как подмена картинки. */}
      <svg
        className={cn("pl-theme-toggle__icon", isDark && "pl-theme-toggle__icon--on")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
      <svg
        className={cn("pl-theme-toggle__icon", !isDark && "pl-theme-toggle__icon--on")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    </button>
  );
}
