/**
 * Разбор многозначного ввода — без React и без DOM.
 *
 * Главный случай здесь не набор руками, а вставка из буфера: адреса из
 * письма, метки из таблицы, идентификаторы из чата. Приходит это в виде
 * `a, b;c\n d` с пустыми кусками и повторами, и превратить такую строку
 * в чистый список — вся работа модуля.
 */

/** Почему значение не приняли. */
export type TagRejection = "duplicate" | "invalid" | "limit";

export interface RejectedTag {
  value: string;
  reason: TagRejection;
}

export interface AddTagsResult {
  /** Новый список — вместе с уже бывшими значениями. */
  tags: string[];
  added: string[];
  /** Что не приняли и почему — из этого делается сообщение пользователю. */
  rejected: RejectedTag[];
}

export interface AddTagsOptions {
  /** Предел количества. */
  max?: number;
  /** Считать ли `Bug` и `bug` одним значением. По умолчанию да. */
  caseInsensitive?: boolean;
  /** Своя проверка: `false` или текст причины отклоняют значение. */
  validate?: (value: string) => boolean;
  /** Разделители при разборе вставленной строки. */
  separators?: string[];
}

const DEFAULT_SEPARATORS = [",", ";", "\n", "\t"];

/**
 * Приводит значение к каноническому виду: срезает пробелы и обрамляющие
 * кавычки.
 *
 * Кавычки снимаем потому, что вставка из таблицы приносит их вокруг каждой
 * ячейки, а метка `"bug"` и метка `bug` — это одна метка.
 */
export function normalizeTag(raw: string): string {
  let value = raw.trim();
  if (value.length >= 2) {
    const first = value[0]!;
    if ((first === '"' || first === "'") && value[value.length - 1] === first) {
      value = value.slice(1, -1).trim();
    }
  }
  return value;
}

/**
 * Режет строку по разделителям.
 *
 * Пробел в разделители не входит: значения бывают из двух слов
 * («Мурат Тоймет», «in progress»), и разбиение по пробелам крошило бы их.
 */
export function splitTags(raw: string, separators: string[] = DEFAULT_SEPARATORS): string[] {
  const pattern = new RegExp(`[${separators.map((s) => `\\${s}`).join("")}]`);
  return raw
    .split(pattern)
    .map(normalizeTag)
    .filter((v) => v !== "");
}

/**
 * Добавляет к списку одно или несколько значений.
 *
 * Порядок сохраняется: список меток — это то, что пользователь набрал,
 * и сортировка его по алфавиту выглядела бы как потеря введённого.
 */
export function addTags(
  current: string[],
  raw: string,
  {
    max,
    caseInsensitive = true,
    validate,
    separators = DEFAULT_SEPARATORS,
  }: AddTagsOptions = {}
): AddTagsResult {
  const key = (v: string) => (caseInsensitive ? v.toLowerCase() : v);
  const seen = new Set(current.map(key));

  const tags = [...current];
  const added: string[] = [];
  const rejected: RejectedTag[] = [];

  for (const value of splitTags(raw, separators)) {
    if (max !== undefined && tags.length >= max) {
      rejected.push({ value, reason: "limit" });
      continue;
    }
    if (validate && !validate(value)) {
      rejected.push({ value, reason: "invalid" });
      continue;
    }
    if (seen.has(key(value))) {
      // Повтор — не ошибка ввода, а обычное дело при вставке из письма.
      // Сообщаем о нём, но не мешаем добавить остальные
      rejected.push({ value, reason: "duplicate" });
      continue;
    }
    seen.add(key(value));
    tags.push(value);
    added.push(value);
  }

  return { tags, added, rejected };
}

/** Убирает значение из списка. */
export function removeTag(tags: string[], value: string, caseInsensitive = true): string[] {
  const key = (v: string) => (caseInsensitive ? v.toLowerCase() : v);
  return tags.filter((t) => key(t) !== key(value));
}

/**
 * Что удалить по Backspace в пустом поле — последнее значение.
 *
 * `null`, когда список пуст: иначе Backspace в пустом поле «удалял» бы
 * несуществующее значение и мигал интерфейсом впустую.
 */
export function tagToBackspace(tags: string[]): string | null {
  return tags.length > 0 ? tags[tags.length - 1]! : null;
}
