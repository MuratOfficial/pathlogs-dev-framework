"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Portal } from "./Portal.js";
import {
  dropUndo,
  expireUndo,
  pushUndo,
  undoLabel,
  undoProgress,
  type NewUndoAction,
  type UndoAction,
} from "./undoStack.js";

/** Что передают в `notify`: `at` и `ttlMs` необязательны — подставятся сами. */
export type UndoInput<P> = Omit<NewUndoAction<P>, "at" | "ttlMs"> & {
  at?: number;
  ttlMs?: number;
};

export interface UndoController<P> {
  /** Показать «Отменить» для выполненного действия. */
  notify: (action: UndoInput<P>) => void;
}

export interface UndoToasterProps<P> {
  /** Что сделать при нажатии «Отменить». */
  onUndo: (action: UndoAction<P>) => void;
  /** Получить управление: `notify` вызывают из обработчиков действий. */
  children: (controller: UndoController<P>) => ReactNode;
  /** Подпись кнопки отмены. */
  undoLabelText?: string;
  /** Куда прижать: снизу по центру по умолчанию. */
  placement?: "bottom" | "bottom-left" | "bottom-right";
  /** Сколько живёт предложение по умолчанию (мс). */
  ttlMs?: number;
}

/**
 * «Отменить» с видимым таймером вместо диалога подтверждения.
 *
 * Действие выполняется сразу, а рядом на несколько секунд появляется отмена
 * с тающим кольцом. Диалог подтверждения спрашивает всегда и потому
 * перестаёт читаться; отмена стоит ровно столько, сколько стоит ошибка.
 * Стек, слияние серий и истечение — в `undoStack.ts` под тестами.
 */
export function UndoToaster<P = unknown>({
  onUndo,
  children,
  undoLabelText = "Отменить",
  placement = "bottom",
  ttlMs = 5000,
}: UndoToasterProps<P>) {
  const [stack, setStack] = useState<UndoAction<P>[]>([]);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const raf = useRef<number | undefined>(undefined);

  const notify = useCallback(
    (action: UndoInput<P>) => {
      setStack((prev) =>
        pushUndo(prev, { ...action, at: action.at ?? Date.now(), ttlMs: action.ttlMs ?? ttlMs })
      );
    },
    [ttlMs]
  );

  // Один кадровый цикл на всё: двигает кольца и вычищает истёкшие
  useEffect(() => {
    if (stack.length === 0) return;
    let running = true;
    const loop = () => {
      if (!running) return;
      const now = Date.now();
      setNowTick(now);
      setStack((prev) => {
        const { kept, expired } = expireUndo(prev, now);
        return expired.length > 0 ? kept : prev;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [stack.length]);

  function handleUndo(action: UndoAction<P>) {
    onUndo(action);
    setStack((prev) => dropUndo(prev, action.id));
  }

  return (
    <>
      {children({ notify })}
      <Portal>
        <div className={`pl-undo pl-undo--${placement}`} role="region" aria-label="Отмена действий">
          {stack.map((action) => {
            const left = 1 - undoProgress(action, nowTick);
            return (
              <div key={action.id} className="pl-undo__toast pl-animate-fade-up" role="status">
                <span className="pl-undo__label">{undoLabel(action)}</span>
                <button type="button" className="pl-undo__action" onClick={() => handleUndo(action)}>
                  <svg viewBox="0 0 36 36" className="pl-undo__ring" aria-hidden>
                    <circle className="pl-undo__ring-track" cx="18" cy="18" r="15" />
                    <circle
                      className="pl-undo__ring-fill"
                      cx="18"
                      cy="18"
                      r="15"
                      style={{ strokeDasharray: `${2 * Math.PI * 15}`, strokeDashoffset: `${2 * Math.PI * 15 * (1 - left)}` }}
                    />
                  </svg>
                  {undoLabelText}
                </button>
                <button
                  type="button"
                  className="pl-undo__close"
                  aria-label="Скрыть"
                  onClick={() => setStack((prev) => dropUndo(prev, action.id))}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </Portal>
    </>
  );
}
