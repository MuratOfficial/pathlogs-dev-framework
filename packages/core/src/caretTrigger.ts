/**
 * Триггеры у каретки: «@» для упоминаний, «/» для команд, «#» для меток.
 *
 * Без React и без DOM — на входе строка и позиция каретки. Правил всего
 * три, но каждое из них видно только на неудачном случае: адрес почты
 * не должен открывать меню упоминаний, путь `src/index.ts` — меню команд,
 * а закрытое меню не должно возвращаться при правке середины слова.
 */

/** Найденный триггер. */
export interface CaretTrigger {
  /** Сам символ триггера. */
  char: string;
  /** Что набрано после него до каретки. */
  query: string;
  /** Позиция символа триггера в строке. */
  start: number;
  /** Позиция каретки, на которой триггер найден. */
  caret: number;
}

export interface TriggerOptions {
  /**
   * Разрешить триггер в середине слова. По умолчанию нет: иначе `a@b.com`
   * открывал бы меню упоминаний на каждом адресе почты.
   */
  midWord?: boolean;
  /**
   * Предельная длина набранного запроса. Дальше меню закрывается: столько
   * не набирают в поиске по списку, зато легко получают, пройдя кареткой
   * по абзацу назад.
   */
  maxQuery?: number;
  /** Символы, обрывающие запрос. По умолчанию пробелы и переводы строк. */
  stop?: RegExp;
}

/**
 * Ищет активный триггер перед кареткой. `null` — меню должно быть закрыто.
 *
 * `/` в начале строки — команда, `src/index.ts` — нет: триггер обязан стоять
 * либо в самом начале, либо после пробела.
 */
export function triggerAt(
  text: string,
  caret: number,
  chars: string[],
  { midWord = false, maxQuery = 32, stop = /\s/ }: TriggerOptions = {}
): CaretTrigger | null {
  const position = Math.min(Math.max(0, caret), text.length);

  for (let i = position - 1; i >= 0 && position - i <= maxQuery + 1; i -= 1) {
    const ch = text[i]!;

    if (chars.includes(ch)) {
      const before = i > 0 ? text[i - 1]! : "";
      if (!midWord && before !== "" && !stop.test(before)) return null;
      return { char: ch, query: text.slice(i + 1, position), start: i, caret: position };
    }

    // Пробел до триггера означает, что триггера в этом слове нет
    if (stop.test(ch)) return null;
  }

  return null;
}

/**
 * Заменяет триггер вместе с набранным запросом на готовый текст.
 *
 * Возвращает и новую каретку: без неё вызывающий код поставил бы её в конец
 * всего поля, и правка середины комментария каждый раз выбрасывала бы
 * пользователя в хвост.
 */
export function replaceTrigger(
  text: string,
  trigger: CaretTrigger,
  insert: string,
  suffix = " "
): { text: string; caret: number } {
  const rest = text.slice(trigger.caret);
  // Пробел не дублируем: он уже мог быть набран после места вставки
  const spacer = suffix && rest.startsWith(suffix) ? "" : suffix;
  return {
    text: `${text.slice(0, trigger.start)}${insert}${spacer}${rest}`,
    caret: trigger.start + insert.length + spacer.length,
  };
}

/** Отбор вариантов по набранному запросу — вхождением, без учёта регистра. */
export function filterByQuery<T>(
  items: T[],
  query: string,
  label: (item: T) => string,
  limit = 8
): T[] {
  const needle = query.trim().toLowerCase();
  const matched = needle === "" ? items : items.filter((i) => label(i).toLowerCase().includes(needle));
  return matched.slice(0, limit);
}
