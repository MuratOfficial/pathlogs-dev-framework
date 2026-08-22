import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn.js";

export interface FieldProps {
  label?: ReactNode;
  /** Пояснение под полем. Скрывается, когда показана ошибка. */
  hint?: ReactNode;
  /** Текст ошибки. Пока задан, поле помечено aria-invalid. */
  error?: ReactNode;
  required?: boolean;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
  className?: string;
}

/**
 * Обёртка поля: подпись, пояснение, ошибка — и связка их с полем
 * через id и aria-describedby.
 *
 * Поле приходит функцией, а не просто детьми: только так обёртка может
 * передать ему сгенерированный id, не заставляя вызывающий код выдумывать
 * уникальные имена вручную.
 */
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("pl-field", className)}>
      {label && (
        <label htmlFor={id} className="pl-field__label">
          {label}
          {required && (
            <span className="pl-field__required" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children({
        id,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true } : {}),
      })}
      {error ? (
        <p id={`${id}-error`} className="pl-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="pl-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn("pl-input", className)} {...rest} />;
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn("pl-input", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn("pl-input", "pl-select", className)} {...rest}>
        {children}
      </select>
    );
  }
);
