/**
 * Построчный и внутристрочный дифф — без React и без DOM.
 *
 * Диффом называют две разные задачи: найти наибольшую общую
 * подпоследовательность и красиво её показать. Здесь обе, но первая —
 * настоящий алгоритм с настоящими краями (пустой ввод, одинаковые файлы,
 * файл целиком переписан), и проверять её глазами бессмысленно.
 */

/** Что случилось со строкой. */
export type DiffType = "equal" | "add" | "del";

/** Строка результата. Номера — те, что показывают в жёлобе. */
export interface DiffLine {
  type: DiffType;
  text: string;
  /** Номер в исходном тексте (с 1). Нет у добавленных строк. */
  leftNo?: number;
  /** Номер в новом тексте. Нет у удалённых. */
  rightNo?: number;
}

/**
 * Предел для полной матрицы: 4 миллиона ячеек — примерно 2000×2000 строк.
 *
 * Дальше алгоритм честно сдаётся и отдаёт грубый результат. Съесть 500 МБ
 * памяти и заморозить вкладку было бы хуже, чем показать «блок заменён
 * целиком»: во втором случае пользователь хотя бы видит файл.
 */
export const MAX_MATRIX_CELLS = 4_000_000;

/** Режет текст на строки, не оставляя пустой хвост от последнего перевода. */
export function splitLines(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/** Длины совпадающих начала и конца — их не нужно диффить вовсе. */
function trimCommon<T>(a: T[], b: T[]): { head: number; tail: number } {
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head += 1;

  let tail = 0;
  while (
    tail < a.length - head &&
    tail < b.length - head &&
    a[a.length - 1 - tail] === b[b.length - 1 - tail]
  ) {
    tail += 1;
  }
  return { head, tail };
}

/** Наибольшая общая подпоследовательность через матрицу длин. */
function lcsOps<T>(a: T[], b: T[]): DiffType[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) return Array.from({ length: m }, () => "add" as DiffType);
  if (m === 0) return Array.from({ length: n }, () => "del" as DiffType);

  if ((n + 1) * (m + 1) > MAX_MATRIX_CELLS) {
    // Грубый путь: считаем весь блок заменённым
    return [
      ...Array.from({ length: n }, () => "del" as DiffType),
      ...Array.from({ length: m }, () => "add" as DiffType),
    ];
  }

  const width = m + 1;
  const table = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1]! + 1
          : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
    }
  }

  const ops: DiffType[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push("equal");
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j]! >= table[i * width + j + 1]!) {
      // При равенстве выбираем удаление: удалённая строка встаёт выше
      // добавленной, и дифф читается как «было → стало»
      ops.push("del");
      i += 1;
    } else {
      ops.push("add");
      j += 1;
    }
  }
  while (i < n) {
    ops.push("del");
    i += 1;
  }
  while (j < m) {
    ops.push("add");
    j += 1;
  }
  return ops;
}

/**
 * Построчный дифф.
 *
 * Совпадающие начало и конец отрезаются до основного алгоритма: в правке
 * реального файла они составляют почти всё, и без этого матрица считалась бы
 * для тысяч заведомо одинаковых строк.
 */
export function diffLines(before: string[], after: string[]): DiffLine[] {
  const { head, tail } = trimCommon(before, after);
  const out: DiffLine[] = [];

  let leftNo = 1;
  let rightNo = 1;

  for (let i = 0; i < head; i += 1) {
    out.push({ type: "equal", text: before[i]!, leftNo: leftNo++, rightNo: rightNo++ });
  }

  const midA = before.slice(head, before.length - tail);
  const midB = after.slice(head, after.length - tail);
  const ops = lcsOps(midA, midB);

  let ai = 0;
  let bi = 0;
  for (const op of ops) {
    if (op === "equal") {
      out.push({ type: "equal", text: midA[ai]!, leftNo: leftNo++, rightNo: rightNo++ });
      ai += 1;
      bi += 1;
    } else if (op === "del") {
      out.push({ type: "del", text: midA[ai]!, leftNo: leftNo++ });
      ai += 1;
    } else {
      out.push({ type: "add", text: midB[bi]!, rightNo: rightNo++ });
      bi += 1;
    }
  }

  for (let i = after.length - tail; i < after.length; i += 1) {
    out.push({ type: "equal", text: after[i]!, leftNo: leftNo++, rightNo: rightNo++ });
  }

  return out;
}

/** Кусок строки при внутристрочном диффе. */
export interface InlineSpan {
  type: DiffType;
  text: string;
}

/**
 * Внутристрочный дифф по словам.
 *
 * Токены — слова, пробелы и знаки по отдельности: посимвольный дифф на
 * переименовании переменной даёт кашу из отдельных букв, а по словам видно
 * ровно то, что изменилось.
 */
export function diffWords(before: string, after: string): InlineSpan[] {
  // \p{L}\p{N} с флагом u, а не \w: без Unicode-класса \w не захватывает
  // кириллицу и любой не-латинский алфавит, и дифф по словам молча
  // скатывается в посимвольный — «мир» и «космос» роднятся по букве «м»
  const tokenize = (s: string) => s.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}\s]/gu) ?? [];
  const a = tokenize(before);
  const b = tokenize(after);
  const ops = lcsOps(a, b);

  const out: InlineSpan[] = [];
  let ai = 0;
  let bi = 0;

  for (const op of ops) {
    const text = op === "add" ? b[bi]! : a[ai]!;
    if (op === "equal") {
      ai += 1;
      bi += 1;
    } else if (op === "del") ai += 1;
    else bi += 1;

    // Соседние куски одного типа склеиваем: иначе на каждое слово
    // приходился бы отдельный элемент разметки
    const last = out[out.length - 1];
    if (last && last.type === op) last.text += text;
    else out.push({ type: op, text });
  }

  return out;
}

/** Кусок диффа с контекстом вокруг изменений. */
export interface DiffHunk {
  /** Номер первой строки слева и справа. */
  leftStart: number;
  rightStart: number;
  leftCount: number;
  rightCount: number;
  /** Заголовок в формате unified diff: `@@ -1,7 +1,9 @@`. */
  header: string;
  lines: DiffLine[];
}

/**
 * Собирает изменения в куски с контекстом.
 *
 * Показывать файл целиком нельзя: в правке на две строки девяносто восемь
 * процентов экрана занимает то, что не менялось, — и изменения приходится
 * искать глазами.
 */
export function buildHunks(lines: DiffLine[], context = 3): DiffHunk[] {
  const changed = lines.map((l) => l.type !== "equal");
  if (!changed.some(Boolean)) return [];

  // Отрезки, попадающие в вывод: изменение плюс контекст с обеих сторон
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((_, i) => {
    if (!changed[i]) return;
    for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k += 1) {
      keep[k] = true;
    }
  });

  const hunks: DiffHunk[] = [];
  let current: DiffLine[] = [];

  const flush = () => {
    if (current.length === 0) return;
    const leftStart = current.find((l) => l.leftNo !== undefined)?.leftNo ?? 0;
    const rightStart = current.find((l) => l.rightNo !== undefined)?.rightNo ?? 0;
    const leftCount = current.filter((l) => l.type !== "add").length;
    const rightCount = current.filter((l) => l.type !== "del").length;
    hunks.push({
      leftStart,
      rightStart,
      leftCount,
      rightCount,
      header: `@@ -${leftStart},${leftCount} +${rightStart},${rightCount} @@`,
      lines: current,
    });
    current = [];
  };

  lines.forEach((line, i) => {
    if (keep[i]) current.push(line);
    else flush();
  });
  flush();

  return hunks;
}

/** Сводка изменений — то, что показывают числом рядом с файлом. */
export function diffStats(lines: DiffLine[]): { added: number; removed: number; unchanged: number } {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const line of lines) {
    if (line.type === "add") added += 1;
    else if (line.type === "del") removed += 1;
    else unchanged += 1;
  }
  return { added, removed, unchanged };
}

/** Строка режима «рядом»: слева было, справа стало. */
export interface SideRow {
  left: DiffLine | null;
  right: DiffLine | null;
  /** Строка изменена, а не добавлена или удалена — можно диффить по словам. */
  modified: boolean;
}

/**
 * Раскладывает дифф в две колонки.
 *
 * Идущие подряд удаления и добавления сопоставляются попарно: это почти
 * всегда одна и та же строка до и после правки, и поставить их напротив друг
 * друга — единственный способ увидеть, что именно в ней изменилось.
 */
export function pairRows(lines: DiffLine[]): SideRow[] {
  const rows: SideRow[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.type === "equal") {
      rows.push({ left: line, right: line, modified: false });
      i += 1;
      continue;
    }

    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (i < lines.length && lines[i]!.type === "del") dels.push(lines[i++]!);
    while (i < lines.length && lines[i]!.type === "add") adds.push(lines[i++]!);

    const pairs = Math.max(dels.length, adds.length);
    for (let k = 0; k < pairs; k += 1) {
      const left = dels[k] ?? null;
      const right = adds[k] ?? null;
      rows.push({ left, right, modified: left !== null && right !== null });
    }
  }

  return rows;
}
