/**
 * Разбор ANSI-последовательностей в размеченные куски текста —
 * без React и без DOM.
 *
 * Любой лог из CI, докера или обычного `npm run build` приходит
 * с управляющими последовательностями. Показать их как текст — значит
 * засыпать экран мусором вида `[32m`; выкинуть регуляркой — потерять
 * единственную подсказку о том, где ошибка. Поэтому разбор.
 */

/** Стиль куска. */
export interface AnsiStyle {
  /** Цвет текста как готовое значение CSS. */
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/** Кусок строки с одним стилем. */
export interface AnsiSpan extends AnsiStyle {
  text: string;
}

/**
 * Палитра шестнадцати базовых цветов.
 *
 * Тона средней насыщенности: одна и та же палитра должна читаться и на
 * тёмном фоне, и на светлом. Чистый `#0000ff` на тёмном фоне не читается
 * вовсе, поэтому синий здесь заметно светлее канонического.
 */
export const ANSI_PALETTE: string[] = [
  "#3b4252", // 0 чёрный
  "#ef4444", // 1 красный
  "#22c55e", // 2 зелёный
  "#eab308", // 3 жёлтый
  "#60a5fa", // 4 синий
  "#c084fc", // 5 пурпурный
  "#22d3ee", // 6 голубой
  "#cbd5e1", // 7 белый
  "#64748b", // 8 яркий чёрный
  "#f87171", // 9 яркий красный
  "#4ade80", // 10 яркий зелёный
  "#facc15", // 11 яркий жёлтый
  "#93c5fd", // 12 яркий синий
  "#d8b4fe", // 13 яркий пурпурный
  "#67e8f9", // 14 яркий голубой
  "#f1f5f9", // 15 яркий белый
];

/** Цвет из 256-цветной таблицы. */
function color256(index: number, palette: string[]): string | undefined {
  if (index < 16) return palette[index];

  // 16..231 — куб 6×6×6
  if (index < 232) {
    const n = index - 16;
    const step = (v: number) => (v === 0 ? 0 : 55 + v * 40);
    const r = step(Math.floor(n / 36));
    const g = step(Math.floor((n % 36) / 6));
    const b = step(n % 6);
    return `rgb(${r} ${g} ${b})`;
  }

  // 232..255 — серая шкала
  const level = 8 + (index - 232) * 10;
  return `rgb(${level} ${level} ${level})`;
}

/** Применяет один набор SGR-параметров к текущему стилю. */
function applySgr(style: AnsiStyle, params: number[], palette: string[]): AnsiStyle {
  const next: AnsiStyle = { ...style };

  for (let i = 0; i < params.length; i += 1) {
    const code = params[i]!;

    if (code === 0) {
      // Сброс обнуляет всё сразу: коды после него в том же наборе
      // применяются уже к чистому стилю
      for (const key of Object.keys(next) as (keyof AnsiStyle)[]) delete next[key];
    } else if (code === 1) next.bold = true;
    else if (code === 2) next.dim = true;
    else if (code === 3) next.italic = true;
    else if (code === 4) next.underline = true;
    else if (code === 22) {
      delete next.bold;
      delete next.dim;
    } else if (code === 23) delete next.italic;
    else if (code === 24) delete next.underline;
    else if (code >= 30 && code <= 37) next.fg = palette[code - 30];
    else if (code === 39) delete next.fg;
    else if (code >= 40 && code <= 47) next.bg = palette[code - 40];
    else if (code === 49) delete next.bg;
    else if (code >= 90 && code <= 97) next.fg = palette[code - 90 + 8];
    else if (code >= 100 && code <= 107) next.bg = palette[code - 100 + 8];
    else if (code === 38 || code === 48) {
      // Расширенный цвет: 5;N — из таблицы, 2;R;G;B — точный
      const mode = params[i + 1];
      const target = code === 38 ? "fg" : "bg";
      if (mode === 5) {
        const value = color256(params[i + 2] ?? 0, palette);
        if (value) next[target] = value;
        i += 2;
      } else if (mode === 2) {
        const r = params[i + 2] ?? 0;
        const g = params[i + 3] ?? 0;
        const b = params[i + 4] ?? 0;
        next[target] = `rgb(${r} ${g} ${b})`;
        i += 4;
      }
    }
  }

  return next;
}

/**
 * SGR-последовательность: та, что несёт стиль.
 *
 * ESC записан escape-последовательностью, а не самим байтом: невидимый
 * управляющий символ в исходнике теряется при копировании файла — и правило
 * молча перестаёт срабатывать.
 */
const SGR = /\u001b\[([0-9;]*)m/;
/**
 * Прочие управляющие последовательности — их просто выбрасываем.
 *
 * Финальная буква CSI намеренно исключает строчную `m`: иначе это правило
 * съело бы и цвета, ведь применяется оно первым.
 */
const OTHER_ESCAPE = /\u001b(?:\[[0-9;?]*[a-ln-zA-Z]|\][^\u0007\u001b]*(?:\u0007|\u001b\\)|[()#][0-9A-Za-z]|[=>])/g;

/**
 * Режет строку на куски с одним стилем.
 *
 * Управляющие последовательности, не относящиеся к цвету — перемещение
 * курсора, очистка строки, заголовок окна, — выбрасываются: в прокручиваемом
 * логе их выполнить всё равно нельзя, а видеть их пользователю не нужно.
 */
export function parseAnsi(line: string, palette: string[] = ANSI_PALETTE): AnsiSpan[] {
  const clean = line.replace(OTHER_ESCAPE, "");
  const spans: AnsiSpan[] = [];
  let style: AnsiStyle = {};
  let rest = clean;

  while (rest.length > 0) {
    const m = SGR.exec(rest);
    if (!m) {
      spans.push({ text: rest, ...style });
      break;
    }

    if (m.index > 0) spans.push({ text: rest.slice(0, m.index), ...style });

    const params = (m[1] ?? "")
      .split(";")
      .map((p) => (p === "" ? 0 : Number(p)))
      .filter((n) => Number.isFinite(n));
    // Пустой набор `\u001b[m` — это сброс, а не «ничего не делать»
    style = applySgr(style, params.length > 0 ? params : [0], palette);
    rest = rest.slice(m.index + m[0].length);
  }

  // Пустые куски отбрасываем: они появляются от последовательностей вплотную
  // друг к другу и только раздували бы разметку
  return spans.filter((s) => s.text !== "");
}

/** Голый текст без разметки — для поиска и копирования. */
export function stripAnsi(line: string): string {
  return line.replace(OTHER_ESCAPE, "").replace(new RegExp(SGR.source, "g"), "");
}

/** Есть ли в строке хоть одна управляющая последовательность. */
export function hasAnsi(line: string): boolean {
  return stripAnsi(line) !== line;
}
