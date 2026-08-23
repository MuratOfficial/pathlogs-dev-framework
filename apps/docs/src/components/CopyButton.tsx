"use client";

import { useEffect, useState } from "react";

export interface CopyButtonProps {
  value: string;
  className?: string;
  label?: string;
}

/**
 * Кнопка «скопировать» с подтверждением на пару секунд.
 *
 * Подтверждение обязательно: копирование ничего не меняет на экране,
 * и без ответа непонятно, сработал клик или нет.
 */
export function CopyButton({ value, className = "", label = "Скопировать" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Сброс по таймеру, а не по следующему клику: иначе галочка висела бы
  // до конца сессии
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Буфер недоступен (нет https, отказано в правах) — молча ничего
      // не делаем: показывать ошибку за отсутствующее разрешение бесполезно
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Скопировано" : label}
      data-tip={copied ? "Скопировано" : label}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border border-edge bg-surface text-muted transition hover:border-accent/50 hover:text-foreground ${className}`}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  );
}
