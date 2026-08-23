"use client";

import { useRef, useState } from "react";
import {
  useDismiss,
  useDragScroll,
  useHotkeys,
  usePolling,
  useTheme,
  type Hotkey,
} from "@toimetdev/pathlogs-hooks";
import { Button, LiveIndicator } from "@toimetdev/pathlogs-core";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#4ade80", "#22d3ee", "#60a5fa", "#f43f5e"];

export function DragScrollDemo() {
  const ref = useDragScroll<HTMLDivElement>({ axis: "x", keyboard: true });

  return (
    <div className="w-full max-w-xl">
      <div
        ref={ref}
        role="region"
        aria-label="Лента: тяните мышью, стрелки прокручивают"
        className="flex gap-3 overflow-x-auto rounded-xl border border-edge bg-surface p-4"
      >
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-white"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Зажмите и потяните. Отпустите на движении — лента доедет по инерции.
        Края растворяются там, где спрятан контент.
      </p>
    </div>
  );
}

export function DragScrollAxisDemo() {
  const ref = useDragScroll<HTMLDivElement>({ axis: "both", momentum: false });

  return (
    <div
      ref={ref}
      className="h-56 w-full max-w-xl overflow-auto rounded-xl border border-edge bg-surface"
    >
      <div className="grid w-[48rem] grid-cols-8 gap-2 p-4">
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            className="flex h-16 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HotkeysDemo() {
  const [log, setLog] = useState<string[]>([]);

  function push(text: string) {
    // Держим только последние пять: список нужен, чтобы увидеть срабатывание,
    // а не чтобы вести историю
    setLog((prev) => [text, ...prev].slice(0, 5));
  }

  const hotkeys: Hotkey[] = [
    { keys: "g d", label: "Дашборд", handler: () => push("g d → переход на дашборд") },
    { keys: "g m", label: "Мои задачи", handler: () => push("g m → мои задачи") },
    { keys: "d", label: "Отметить готовой", handler: () => push("d → отметить готовой") },
    {
      keys: "mod+k",
      label: "Поиск",
      allowInInput: true,
      handler: () => push("mod+k → палитра (работает и из поля ввода)"),
    },
  ];

  useHotkeys(hotkeys);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {hotkeys.map((h) => (
          <span key={h.keys} className="flex items-center gap-1.5 text-xs text-muted">
            {h.keys.split(/[\s+]/).map((k) => (
              <kbd key={k} className="pl-kbd">
                {k}
              </kbd>
            ))}
            {h.label}
          </span>
        ))}
      </div>

      <input
        placeholder="Наберите здесь «g d» — обычные клавиши в поле не срабатывают"
        className="pl-input"
      />

      <ul className="min-h-[6rem] rounded-xl border border-edge bg-surface p-3 text-sm">
        {log.length === 0 ? (
          <li className="text-muted">Нажмите сочетание — сюда попадёт срабатывание</li>
        ) : (
          log.map((line, i) => (
            <li key={i} className={i === 0 ? "text-foreground" : "text-muted"}>
              {line}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function PollingDemo() {
  const [enabled, setEnabled] = useState(true);

  // Настоящего сервера здесь нет: «запрос» просто возвращает время.
  // Важно другое — опрос сам встаёт на паузу, когда вкладка скрыта.
  const { data, refresh } = usePolling(
    async () => new Date().toLocaleTimeString("ru-RU"),
    { initial: "—", interval: 3000, enabled, immediate: true }
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-2xl tabular-nums">{data}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={refresh}>
          Обновить сейчас
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEnabled((v) => !v)}>
          {enabled ? "Остановить" : "Запустить"}
        </Button>
      </div>
      <p className="max-w-sm text-center text-xs text-muted">
        Опрос каждые 3 секунды. Переключитесь на другую вкладку и вернитесь —
        время обновится сразу, а не через интервал.
      </p>
    </div>
  );
}

export function DismissDemo() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(box, { enabled: open, onDismiss: () => setOpen(false) });

  return (
    <div ref={box} className="relative">
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? "Панель открыта" : "Открыть панель"}
      </Button>
      {open && (
        <div className="pl-animate-pop-in absolute left-0 top-full z-20 mt-2 w-60 rounded-xl border border-edge bg-surface p-4 text-sm shadow-2xl">
          Кликните мимо панели или нажмите Escape — она закроется.
        </div>
      )}
    </div>
  );
}

export function ThemeDemo() {
  const { preference, resolved, setTheme, toggle } = useTheme();

  return (
    <div className="flex flex-col items-center gap-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted">Выбор пользователя</dt>
        <dd className="font-mono">{preference}</dd>
        <dt className="text-muted">Что на экране</dt>
        <dd className="font-mono">{resolved}</dd>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => setTheme("light")}>
          Светлая
        </Button>
        <Button size="sm" onClick={() => setTheme("dark")}>
          Тёмная
        </Button>
        <Button size="sm" onClick={() => setTheme("system")}>
          Системная
        </Button>
        <Button size="sm" variant="primary" onClick={toggle}>
          Переключить
        </Button>
      </div>
      <p className="max-w-sm text-center text-xs text-muted">
        Меняется тема всего сайта — состояние живёт в атрибуте на <code>&lt;html&gt;</code>,
        а не внутри компонента.
      </p>
    </div>
  );
}

export function EventStreamDemo() {
  // Живого потока в документации нет — показываем три состояния,
  // между которыми переключается индикатор
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("live");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-edge bg-surface px-4 py-3">
        <LiveIndicator
          status={status}
          updatedAt={status === "live" ? new Date() : null}
          locale="ru-RU"
          labels={{
            updated: "обновлено в {time}",
            connecting: "подключаемся…",
            offline: "нет связи — обновления приостановлены",
          }}
        />
      </div>
      <div className="flex gap-2">
        {(["connecting", "live", "offline"] as const).map((s) => (
          <Button key={s} size="sm" variant={status === s ? "primary" : "ghost"} onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
