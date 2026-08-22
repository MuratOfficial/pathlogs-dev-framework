/**
 * Склейка классов. Свой крошечный вариант вместо clsx — у пакета не должно
 * быть зависимостей ради тридцати строк, а поведение здесь ровно то,
 * что нужно: пропуск пустых значений и поддержка условных объектов.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      for (const [key, on] of Object.entries(value)) {
        if (on) out.push(key);
      }
    }
  }

  return out.join(" ");
}
