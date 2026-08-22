"use client";

import { Dialog } from "./Dialog.js";
import { Button } from "./Button.js";

export type ConfirmTone = "danger" | "accent";

const TONES: Record<ConfirmTone, { className: string; path: string }> = {
  danger: {
    className: "pl-confirm__icon--danger",
    // восклицательный знак в треугольнике
    path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
  accent: {
    className: "pl-confirm__icon--accent",
    // вопросительный знак в круге
    path: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Текст кнопки, пока идёт действие. */
  pendingLabel?: string;
  tone?: ConfirmTone;
  /** Действие выполняется — кнопки заблокированы, окно не закрыть. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Модальное подтверждение вместо window.confirm.
 *
 * Управляется снаружи через `open` — состояние живёт у вызывающего кода,
 * поэтому одно и то же окно обслуживает и «удалить», и «архивировать»,
 * не заводя себе внутреннего режима.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pendingLabel = "Working…",
  tone = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = TONES[tone];

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      label={title}
      size="sm"
      busy={pending}
      footer={
        <>
          <Button variant="ghost" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            loading={pending}
            onClick={onConfirm}
          >
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="pl-confirm">
        <span className={`pl-confirm__icon ${t.className}`} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
          </svg>
        </span>
        <div className="pl-confirm__text">
          <h2 className="pl-confirm__title">{title}</h2>
          {message && <p className="pl-confirm__message">{message}</p>}
        </div>
      </div>
    </Dialog>
  );
}
