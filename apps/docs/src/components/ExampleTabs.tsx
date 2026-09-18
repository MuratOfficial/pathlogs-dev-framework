"use client";

import { useState, type ReactNode } from "react";
import { useDict } from "./LangProvider";

export interface ExampleTabsProps {
  preview: ReactNode;
  code: ReactNode;
  /** Открыть сразу на коде — для примеров, где смотреть особо не на что. */
  defaultTab?: "preview" | "code";
  /** Убрать «шахматный» фон: у широких виджетов он только рябит. */
  plain?: boolean;
}

/**
 * Живой пример: превью и исходник под одними вкладками.
 *
 * Оба слота приходят готовыми узлами, а не собираются здесь: подсветка кода
 * делается на сервере, и втягивать её в клиентский компонент значило бы
 * тащить Shiki в браузер.
 */
export function ExampleTabs({
  preview,
  code,
  defaultTab = "preview",
  plain = false,
}: ExampleTabsProps) {
  const [tab, setTab] = useState(defaultTab);
  const t = useDict();

  return (
    <div className="not-prose overflow-hidden rounded-xl border border-edge bg-surface">
      <div className="flex items-center gap-1 border-b border-edge bg-surface-2/40 px-2 py-1.5">
        {(["preview", "code"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              tab === value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {value === "preview" ? t.tabPreview : t.tabCode}
          </button>
        ))}
      </div>

      {/* Обе вкладки остаются в дереве: у превью бывает состояние — открытый
          диалог, набранный текст, — и размонтирование сбрасывало бы его
          при каждом взгляде на код. */}
      <div hidden={tab !== "preview"}>
        <div
          className={`flex min-h-[11rem] items-center justify-center p-8 ${
            plain ? "" : "docs-canvas"
          }`}
        >
          {preview}
        </div>
      </div>
      <div hidden={tab !== "code"}>{code}</div>
    </div>
  );
}
