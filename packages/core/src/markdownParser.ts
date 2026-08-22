/**
 * Разбор ограниченного Markdown — без React, чтобы грамматику можно было
 * проверить тестами, а результат переиспользовать (например, для оглавления
 * или поиска по документу).
 *
 * Поддерживается: **жирный**, *курсив*, ~~зачёркнутый~~, `код`,
 * ```блоки кода```, [ссылки](https://…), заголовки #…###, списки -/* и 1.,
 * цитаты >, горизонтальная черта ---.
 *
 * Картинки и сырой HTML не поддерживаются намеренно: текст пишут
 * пользователи, и разметка, способная принести в документ чужой тег
 * или чужой запрос, здесь просто не разбирается.
 */

/** Протоколы, которым разрешено становиться ссылкой. */
export const SAFE_PROTOCOLS = /^(https?:\/\/|mailto:)/i;

export type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; level: number; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "code"; lines: string[]; lang?: string }
  | { kind: "hr" };

/** Разбивает текст на блоки. Пустые строки — разделители, а не блоки. */
export function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) body.push(lines[i++]!);
      i++; // закрывающая ```
      blocks.push(lang ? { kind: "code", lines: body, lang } : { kind: "code", lines: body });
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      // Уровень ограничен тремя: пользовательский текст не должен
      // перебивать заголовки самой страницы
      blocks.push({ kind: "h", level: Math.min(h[1]!.length, 3), text: h[2]! });
      i++;
      continue;
    }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i]!)) {
        body.push(lines[i]!.replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "quote", lines: body });
      continue;
    }

    const body: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !/^(#{1,6}\s|```|\s*[-*]\s|\s*\d+[.)]\s|\s*>)/.test(lines[i]!)
    ) {
      body.push(lines[i]!);
      i++;
    }
    blocks.push({ kind: "p", lines: body });
  }

  return blocks;
}

/** Кусок инлайн-разметки. */
export type Inline =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "link"; href: string; children: Inline[] }
  | { kind: "strong"; children: Inline[] }
  | { kind: "em"; children: Inline[] }
  | { kind: "del"; children: Inline[] }
  | { kind: "mention"; text: string };

// Порядок ветвей важен: код раньше остального (внутри `код` разметки нет),
// ** раньше * (иначе жирный разобрался бы как два курсива подряд).
const INLINE_RE =
  /(`[^`\n]+`)|(\[([^\]\n]+)\]\(([^)\s]+)\))|(\*\*([^*\n]+)\*\*)|(__([^_\n]+)__)|(\*([^*\n]+)\*)|(_([^_\n]+)_)|(~~([^~\n]+)~~)/g;

/** Разбирает инлайн-разметку строки. */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = new RegExp(INLINE_RE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });

    if (m[1]) {
      out.push({ kind: "code", text: m[1].slice(1, -1) });
    } else if (m[2]) {
      const href = m[4]!;
      // Небезопасный протокол ссылкой не становится — остаётся видимым
      // текстом, чтобы автор заметил, что разметка не сработала
      if (SAFE_PROTOCOLS.test(href)) {
        out.push({ kind: "link", href, children: parseInline(m[3]!) });
      } else {
        out.push({ kind: "text", text: m[2] });
      }
    } else if (m[5] || m[7]) {
      out.push({ kind: "strong", children: parseInline((m[6] ?? m[8])!) });
    } else if (m[9] || m[11]) {
      out.push({ kind: "em", children: parseInline((m[10] ?? m[12])!) });
    } else if (m[13]) {
      out.push({ kind: "del", children: parseInline(m[14]!) });
    }

    last = m.index + m[0].length;
  }

  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/**
 * То же, но с подсветкой @упоминаний из списка известных имён.
 *
 * Имена сортируются от длинных к коротким: иначе «@Иван» съел бы начало
 * «@Иван Петров», и упоминание распалось бы на подсветку и хвост текста.
 */
export function parseInlineWithMentions(text: string, names: string[]): Inline[] {
  const escaped = names
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escaped.length === 0) return parseInline(text);

  const re = new RegExp(`@(?:${escaped.join("|")})`, "g");
  const out: Inline[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(...parseInline(text.slice(last, m.index)));
    out.push({ kind: "mention", text: m[0] });
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(...parseInline(text.slice(last)));
  return out;
}
