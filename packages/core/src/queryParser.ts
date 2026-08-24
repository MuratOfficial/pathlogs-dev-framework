/**
 * Структурный поиск: разбор строки вида `is:open author:me due:<now+7d -label:bug`.
 *
 * Без React и без DOM — здесь только текст. Разбор отделён от поля ввода не
 * ради чистоты: подсказки должны знать, что именно набирают под курсором
 * прямо сейчас, и это единственная нетривиальная часть всей затеи. Такое
 * проверяется тестами на строку и позицию каретки, а не кликами.
 *
 * Отношение к `FilterBar`: тот собирает те же условия щелчками по полям,
 * этот — набором с клавиатуры. Модель условий у них общая по смыслу,
 * но `FilterBar` не умеет ни отрицания, ни сравнений.
 */

import { parseTimeExpr } from "./timeRange.js";

/** Оператор сравнения. */
export type CompareOp = "eq" | "gt" | "lt" | "gte" | "lte";

/** Тип поля — определяет, как сравнивать значения и что подсказывать. */
export type QueryFieldType = "text" | "enum" | "number" | "date";

/** Вариант значения для подсказок. */
export interface QueryOption {
  value: string;
  /** Что показать в списке. По умолчанию — само значение. */
  label?: string;
  /** Пояснение справа: счётчик, описание. */
  hint?: string;
}

/** Описание поля, по которому можно искать. */
export interface QueryField<T> {
  key: string;
  /** Подпись в подсказках. */
  label?: string;
  type?: QueryFieldType;
  /** Готовые значения либо их поставщик по набранному префиксу. */
  options?: QueryOption[] | ((prefix: string) => QueryOption[]);
  /**
   * Как достать значение из элемента. Массив означает «любое из» —
   * так работают исполнители и метки.
   */
  get?: (item: T) => unknown;
}

/** Одно разобранное условие. */
export interface QueryFilter {
  key: string;
  op: CompareOp;
  /** Значения через запятую: внутри одного условия это ИЛИ. */
  values: string[];
  negated: boolean;
}

/** Токен строки запроса — с позициями, потому что из них рисуются чипы. */
export interface QueryToken {
  start: number;
  end: number;
  raw: string;
  kind: "filter" | "text";
  negated: boolean;
  key?: string;
  op?: CompareOp;
  values: string[];
  /** Где в строке начинается часть со значениями. */
  valueStart?: number;
  /** Кавычка не закрыта — поле ввода подсвечивает это, не ломая разбор. */
  unterminated?: boolean;
}

/** Результат разбора строки. */
export interface ParsedQuery {
  filters: QueryFilter[];
  /** Свободные слова — то, что набрано без `ключ:`. */
  text: string[];
  tokens: QueryToken[];
  /** Ключи, которых нет в описании полей: обычно опечатка. */
  unknownKeys: string[];
}

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

/**
 * Режет строку на токены, не разрывая кавычек.
 *
 * Своя посимвольная разборка вместо `split(/\s+/)`: значение в кавычках
 * содержит пробелы (`title:"падает на импорте"`), и любое разбиение по
 * пробелам разорвало бы его на части.
 */
export function tokenizeQuery(input: string): QueryToken[] {
  const tokens: QueryToken[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i]!)) i += 1;
    if (i >= input.length) break;

    const start = i;
    let quote: string | null = null;
    while (i < input.length) {
      const ch = input[i]!;
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (/\s/.test(ch)) {
        break;
      }
      i += 1;
    }

    tokens.push(parseToken(input.slice(start, i), start, quote !== null));
  }

  return tokens;
}

function unquote(raw: string): string {
  if (raw.length >= 2) {
    const first = raw[0]!;
    if ((first === '"' || first === "'") && raw[raw.length - 1] === first) {
      return raw.slice(1, -1);
    }
  }
  // Незакрытая кавычка: снимаем открывающую, чтобы подсказки работали
  // по уже набранному тексту, а не по мусору вместе с кавычкой
  if (raw[0] === '"' || raw[0] === "'") return raw.slice(1);
  return raw;
}

/** Делит значения по запятым, не трогая запятые внутри кавычек. */
function splitValues(raw: string): string[] {
  const out: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (const ch of raw) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ",") {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);

  // Пустые куски выбрасываем: висящая запятая — это ещё не набранное
  // значение, а не условие «или ничто»
  return out.map((v) => v.trim()).filter((v) => v !== "");
}

function parseToken(raw: string, start: number, unterminated: boolean): QueryToken {
  const base: QueryToken = {
    start,
    end: start + raw.length,
    raw,
    kind: "text",
    negated: false,
    values: [],
    ...(unterminated ? { unterminated: true } : {}),
  };

  let body = raw;
  let offset = 0;
  if ((body.startsWith("-") || body.startsWith("!")) && body.length > 1) {
    base.negated = true;
    body = body.slice(1);
    offset = 1;
  }

  const colon = findColon(body);
  if (colon <= 0) {
    base.values = [unquote(raw)];
    return base;
  }

  const key = body.slice(0, colon);
  // Ключ обязан выглядеть как имя поля, а за двоеточием не должно стоять
  // `//`: иначе `http://example.com` стал бы условием «http равно //example.com».
  // Схему URL узнаём именно по двойному слэшу — он не встречается в значениях
  if (!KEY_RE.test(key) || body.slice(colon + 1, colon + 3) === "//") {
    base.values = [unquote(raw)];
    return base;
  }

  let rest = body.slice(colon + 1);
  let restOffset = offset + colon + 1;
  let op: CompareOp = "eq";
  if (rest.startsWith(">=")) [op, rest, restOffset] = ["gte", rest.slice(2), restOffset + 2];
  else if (rest.startsWith("<=")) [op, rest, restOffset] = ["lte", rest.slice(2), restOffset + 2];
  else if (rest.startsWith(">")) [op, rest, restOffset] = ["gt", rest.slice(1), restOffset + 1];
  else if (rest.startsWith("<")) [op, rest, restOffset] = ["lt", rest.slice(1), restOffset + 1];

  base.kind = "filter";
  base.key = key;
  base.op = op;
  base.values = splitValues(rest);
  base.valueStart = start + restOffset;
  return base;
}

/** Позиция двоеточия вне кавычек. */
function findColon(body: string): number {
  let quote: string | null = null;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]!;
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === ":") return i;
  }
  return -1;
}

/**
 * Разбирает строку в условия и свободный текст.
 *
 * Условия с одним ключом складываются в И: `label:bug label:ui` — это
 * «и то, и другое». Для ИЛИ значения перечисляются запятой: `label:bug,ui`.
 * Так же ведут себя GitHub и Linear, и переучивать здесь незачем.
 */
export function parseQuery<T>(input: string, fields: QueryField<T>[] = []): ParsedQuery {
  const tokens = tokenizeQuery(input);
  const known = new Set(fields.map((f) => f.key));
  const filters: QueryFilter[] = [];
  const text: string[] = [];
  const unknownKeys: string[] = [];

  for (const token of tokens) {
    if (token.kind === "text") {
      const value = token.values[0];
      if (value) text.push(value);
      continue;
    }
    // Условие без значения — это ещё не набранный фильтр (`author:`),
    // а не приказ «автор равен пустоте»
    if (token.values.length === 0) continue;

    if (fields.length > 0 && !known.has(token.key!)) unknownKeys.push(token.key!);
    filters.push({
      key: token.key!,
      op: token.op ?? "eq",
      values: token.values,
      negated: token.negated,
    });
  }

  return { filters, text, tokens, unknownKeys };
}

/** Где стоит каретка и что уместно подсказать. */
export interface SuggestContext {
  kind: "key" | "value" | "none";
  /** Поле, значение которого набирают. */
  key?: string;
  /** Что уже набрано в подсказываемом фрагменте. */
  prefix: string;
  /** Границы фрагмента, который заменит выбранная подсказка. */
  range: [number, number];
  suggestions: QueryOption[];
}

function optionsOf<T>(field: QueryField<T>, prefix: string): QueryOption[] {
  const raw = typeof field.options === "function" ? field.options(prefix) : field.options ?? [];
  const needle = prefix.toLowerCase();
  return raw.filter(
    (o) =>
      o.value.toLowerCase().includes(needle) || (o.label ?? "").toLowerCase().includes(needle)
  );
}

/** Границы фрагмента значения под кареткой — с учётом запятых. */
function valueFragment(input: string, from: number, to: number, caret: number): [number, number] {
  let start = from;
  let end = to;
  for (let i = from; i < to; i += 1) {
    if (input[i] !== ",") continue;
    if (i < caret) start = i + 1;
    else {
      end = i;
      break;
    }
  }
  return [start, end];
}

/**
 * Что подсказать при данной позиции каретки.
 *
 * Работает от строки и числа, а не от состояния поля: подсказки — это
 * чистая функция от того, что набрано, и именно поэтому их можно проверить
 * тестом, не поднимая браузер.
 */
export function suggestAt<T>(
  input: string,
  caret: number,
  fields: QueryField<T>[]
): SuggestContext {
  const position = Math.min(Math.max(0, caret), input.length);
  const tokens = tokenizeQuery(input);
  const token = tokens.find((t) => position >= t.start && position <= t.end);

  const keySuggestions = (prefix: string): QueryOption[] => {
    const needle = prefix.toLowerCase();
    return fields
      .filter((f) => f.key.toLowerCase().includes(needle))
      .map((f) => ({ value: `${f.key}:`, label: f.key, ...(f.label ? { hint: f.label } : {}) }));
  };

  // Каретка в пробеле — начинают новое условие
  if (!token) {
    return { kind: "key", prefix: "", range: [position, position], suggestions: keySuggestions("") };
  }

  const negationShift = token.negated ? 1 : 0;

  if (token.kind === "filter") {
    const valueStart = token.valueStart!;
    if (position >= valueStart) {
      const field = fields.find((f) => f.key === token.key);
      const [start, end] = valueFragment(input, valueStart, token.end, position);
      const prefix = unquote(input.slice(start, end));
      return {
        kind: "value",
        key: token.key!,
        prefix,
        range: [start, end],
        suggestions: field ? optionsOf(field, prefix) : [],
      };
    }
    // Каретка внутри имени поля — правят ключ
    const keyEnd = token.start + negationShift + token.key!.length;
    const prefix = input.slice(token.start + negationShift, Math.min(position, keyEnd));
    return {
      kind: "key",
      prefix,
      range: [token.start + negationShift, keyEnd],
      suggestions: keySuggestions(prefix),
    };
  }

  // Свободное слово: пока в нём нет двоеточия, это может быть началом ключа
  const prefix = input.slice(token.start + negationShift, position);
  return {
    kind: "key",
    prefix,
    range: [token.start + negationShift, token.end],
    suggestions: keySuggestions(prefix),
  };
}

/** Оборачивает значение в кавычки, если без них оно распадётся на токены. */
export function quoteValue(value: string): string {
  return /[\s,:]/.test(value) ? `"${value}"` : value;
}

/**
 * Подставляет выбранную подсказку в строку.
 *
 * Возвращает и новую каретку: после выбора ключа она обязана встать за
 * двоеточием, иначе следующее нажатие клавиши уедет в середину слова.
 */
export function applySuggestion(
  input: string,
  context: SuggestContext,
  option: QueryOption
): { text: string; caret: number } {
  const [start, end] = context.range;
  const insert = context.kind === "value" ? quoteValue(option.value) : option.value;

  // После значения ставим пробел — следующее условие начинают сразу,
  // не нажимая его руками. После ключа пробел, наоборот, разорвал бы условие
  const tail = context.kind === "value" ? " " : "";
  const rest = input.slice(end);
  const spacer = tail && rest.startsWith(" ") ? "" : tail;

  return {
    text: `${input.slice(0, start)}${insert}${spacer}${rest}`,
    caret: start + insert.length + spacer.length,
  };
}

/** Собирает строку обратно из условий — для ссылок и сохранённых фильтров. */
export function stringifyQuery(parsed: Pick<ParsedQuery, "filters" | "text">): string {
  const OPS: Record<CompareOp, string> = { eq: "", gt: ">", lt: "<", gte: ">=", lte: "<=" };
  const parts = parsed.filters.map((f) => {
    const values = f.values.map(quoteValue).join(",");
    return `${f.negated ? "-" : ""}${f.key}:${OPS[f.op]}${values}`;
  });
  return [...parts, ...parsed.text.map(quoteValue)].join(" ");
}

function compare(actual: unknown, expected: string, now: Date, type?: QueryFieldType): number | null {
  if (type === "date") {
    const left = actual instanceof Date ? actual : new Date(String(actual));
    const right = parseTimeExpr(expected, now);
    if (!right || Number.isNaN(left.getTime())) return null;
    return left.getTime() - right.getTime();
  }
  const left = Number(actual);
  const right = Number(expected);
  if (Number.isNaN(left) || Number.isNaN(right)) return null;
  return left - right;
}

function equals(actual: unknown, expected: string, type?: QueryFieldType): boolean {
  const needle = expected.toLowerCase();

  if (Array.isArray(actual)) return actual.some((v) => equals(v, expected, type));
  if (actual === null || actual === undefined) return needle === "none" || needle === "null";

  if (typeof actual === "object") {
    // Объект сравниваем по id и name: исполнитель приходит объектом,
    // а в запросе его называют по имени или идентификатору
    const record = actual as Record<string, unknown>;
    return ["id", "name", "slug", "title"].some(
      (k) => record[k] !== undefined && String(record[k]).toLowerCase() === needle
    );
  }

  const value = String(actual).toLowerCase();
  // Текстовые поля ищутся вхождением, перечислимые — точным равенством:
  // `status:done` не должен совпасть с `not-done`
  return type === "text" ? value.includes(needle) : value === needle;
}

export interface MatchQueryOptions<T> {
  /** Откуда брать текст для свободных слов. */
  text?: (item: T) => string;
  /** Момент, относительно которого разбираются выражения вида `now-7d`. */
  now?: Date;
}

/**
 * Проверяет элемент на соответствие запросу.
 *
 * Неизвестный ключ не совпадает ни с чем. Игнорировать его значило бы
 * показать полный список так, как будто фильтр применён, — и опечатка
 * в `assigne:me` тихо превратилась бы в «вообще без фильтра».
 */
export function matchesQuery<T>(
  item: T,
  parsed: ParsedQuery,
  fields: QueryField<T>[],
  { text, now = new Date() }: MatchQueryOptions<T> = {}
): boolean {
  for (const filter of parsed.filters) {
    const field = fields.find((f) => f.key === filter.key);
    if (!field) return false;

    const actual = field.get ? field.get(item) : (item as Record<string, unknown>)[field.key];

    let hit: boolean;
    if (filter.op === "eq") {
      hit = filter.values.some((v) => equals(actual, v, field.type));
    } else {
      hit = filter.values.some((v) => {
        const diff = compare(actual, v, now, field.type);
        if (diff === null) return false;
        if (filter.op === "gt") return diff > 0;
        if (filter.op === "gte") return diff >= 0;
        if (filter.op === "lt") return diff < 0;
        return diff <= 0;
      });
    }

    if (filter.negated ? hit : !hit) return false;
  }

  if (parsed.text.length > 0) {
    const haystack = (text ? text(item) : JSON.stringify(item)).toLowerCase();
    if (!parsed.text.every((word) => haystack.includes(word.toLowerCase()))) return false;
  }

  return true;
}
