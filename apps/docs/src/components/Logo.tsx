/**
 * Знак PathLogs: путь, расходящийся на две ветки.
 *
 * Мотив взят из предметной области — задачи в трекере ветвятся, и та же
 * метафора лежит в основе доски и диаграммы зависимостей. Буква «P»
 * в квадрате не говорила бы ни о чём.
 *
 * Рисуется в `currentColor`, поэтому один и тот же знак годится и для шапки,
 * и для фавикона, и для тёмного фона — цвет задаёт окружение.
 */
export function LogoMark({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      {/* Ствол и две ветви одним росчерком: развилка должна читаться
          как одно движение, а не как три отдельные палки */}
      <path d="M12 21v-7" />
      <path d="M12 14c0-3.2 1.6-4.8 4.8-5.4" />
      <path d="M12 14c0-3.2-1.6-4.8-4.8-5.4" />
      <circle cx="12" cy="21" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="7.5" r="2.2" />
      <circle cx="6" cy="7.5" r="2.2" />
    </svg>
  );
}

export interface LogoProps {
  /** Показывать название рядом со знаком. */
  withText?: boolean;
  className?: string;
}

/** Знак в акцентном квадрате плюс название — то, что стоит в шапке. */
export function Logo({ withText = true, className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent via-accent-2 to-accent-pink text-white">
        <LogoMark className="h-4 w-4" />
      </span>
      {withText && (
        <span className="text-sm font-bold tracking-tight">
          PathLogs<span className="text-muted"> UI</span>
        </span>
      )}
    </span>
  );
}
