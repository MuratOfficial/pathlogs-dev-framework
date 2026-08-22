"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn.js";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "gradient";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Показывает крутилку и блокирует кнопку. */
  loading?: boolean;
  /** Иконка слева от подписи. */
  icon?: ReactNode;
  /** Кнопка занимает всю ширину контейнера. */
  block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "pl-btn--primary",
  secondary: "pl-btn--secondary",
  ghost: "pl-btn--ghost",
  danger: "pl-btn--danger",
  gradient: "pl-btn-gradient",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "pl-btn--sm",
  md: "pl-btn--md",
  lg: "pl-btn--lg",
};

/**
 * Кнопка. `type="button"` по умолчанию: кнопка внутри формы, которая
 * неожиданно её отправляет, — источник самых обидных багов, а осознанный
 * submit всегда можно указать явно.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    icon,
    block = false,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn("pl-btn", VARIANTS[variant], SIZES[size], block && "pl-btn--block", className)}
      {...rest}
    >
      {loading ? <span className="pl-spinner pl-animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});
