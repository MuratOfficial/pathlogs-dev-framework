/**
 * Управление темой на уровне DOM — без React, чтобы то же самое работало
 * в инлайн-скрипте <head> (до гидратации) и в тестах.
 *
 * Тема живёт в двух местах: атрибут [data-theme] на <html> (его читает CSS)
 * и localStorage (переживает перезагрузку). Источник правды — атрибут:
 * компоненты подписываются на него, а не на хранилище, поэтому смена темы
 * из любого места приложения доходит до всех сразу.
 */

/** Что выбрал пользователь. "system" отдаёт решение медиазапросу. */
export type ThemePreference = "light" | "dark" | "system";

/** Во что это разворачивается на экране. */
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_STORAGE_KEY = "theme";

/** Тема, которая действует, если пользователь ничего не выбирал. */
export const DEFAULT_THEME: ResolvedTheme = "dark";

function isPreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Текущий выбор пользователя (по атрибуту на <html>). */
export function getThemePreference(): ThemePreference {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute("data-theme");
  return isPreference(attr) ? attr : DEFAULT_THEME;
}

/** Тема, которую видно на экране: "system" уже развёрнут в light/dark. */
export function getResolvedTheme(): ResolvedTheme {
  const pref = getThemePreference();
  if (pref !== "system") return pref;
  if (typeof window === "undefined") return DEFAULT_THEME;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Применяет тему: пишет атрибут и запоминает выбор.
 * Запись в localStorage может упасть (приватный режим, отключённые куки) —
 * это не повод ронять переключатель, тема всё равно уже применена.
 */
export function setThemePreference(
  theme: ThemePreference,
  storageKey: string = DEFAULT_THEME_STORAGE_KEY
): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    /* хранилище недоступно — выбор просто не переживёт перезагрузку */
  }
}

/** Переключает светлую и тёмную. "system" разворачивается в противоположность текущей. */
export function toggleTheme(storageKey?: string): ResolvedTheme {
  const next: ResolvedTheme = getResolvedTheme() === "dark" ? "light" : "dark";
  setThemePreference(next, storageKey);
  return next;
}

/**
 * Подписка на смену темы. Слушает и атрибут (кто-то переключил), и системную
 * настройку (она важна, только пока выбран "system").
 */
export function subscribeTheme(callback: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", callback);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", callback);
  };
}

/**
 * Скрипт для <head>, снимающий FOUC: ставит атрибут до первой отрисовки,
 * поэтому страница не успевает мигнуть чужой темой.
 *
 * В Next.js:
 * ```tsx
 * <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
 * ```
 * Скрипт умышленно крошечный и синхронный — он блокирует отрисовку,
 * и это здесь именно то, что нужно.
 */
export function themeScript(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
  fallback: ThemePreference = DEFAULT_THEME
): string {
  return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});if(t!=="light"&&t!=="dark"&&t!=="system")t=${JSON.stringify(fallback)};document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(fallback)})}})()`;
}
