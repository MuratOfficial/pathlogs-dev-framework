"use client";

import { useMemo } from "react";
import {
  buildHunks,
  diffLines,
  diffStats,
  diffWords,
  pairRows,
  splitLines,
  type DiffLine,
  type SideRow,
} from "./diffModel";

export interface DiffViewProps {
  /** Исходный текст. */
  before: string;
  /** Изменённый текст. */
  after: string;
  /** Режим: построчно (unified) или в две колонки (split). */
  mode?: "unified" | "split";
  /** Подсвечивать изменения внутри строки по словам. */
  inline?: boolean;
  /** Сворачивать неизменённое, оставляя контекст (unified). */
  collapse?: boolean;
  /** Сколько строк контекста вокруг изменений. */
  context?: number;
  /** Заголовок над диффом — обычно имя файла. */
  filename?: string;
  className?: string;
}

/**
 * Дифф двух текстов: построчный и в две колонки, с подсветкой по словам.
 *
 * Наибольшая общая подпоследовательность, сборка кусков с контекстом и
 * попарное сопоставление строк для колонок — в `diffModel.ts` под тестами.
 * Здесь — отрисовка, жёлоб с номерами и внутристрочная подсветка.
 */
export function DiffView({
  before,
  after,
  mode = "unified",
  inline = true,
  collapse = true,
  context = 3,
  filename,
  className,
}: DiffViewProps) {
  const lines = useMemo(() => diffLines(splitLines(before), splitLines(after)), [before, after]);
  const stats = useMemo(() => diffStats(lines), [lines]);

  return (
    <div className={`overflow-hidden rounded-xl border border-edge bg-surface ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-edge bg-surface-2/40 px-3 py-2 text-xs">
        <span className="font-mono text-muted">{filename ?? "изменения"}</span>
        <span className="flex items-center gap-2 font-medium tabular-nums">
          <span className="text-success">+{stats.added}</span>
          <span className="text-danger">−{stats.removed}</span>
        </span>
      </div>

      <div className="overflow-x-auto font-mono text-[12.5px] leading-[1.6]">
        {mode === "unified" ? (
          <UnifiedDiff lines={lines} inline={inline} collapse={collapse} context={context} />
        ) : (
          <SplitDiff lines={lines} inline={inline} />
        )}
      </div>
    </div>
  );
}

function UnifiedDiff({
  lines,
  inline,
  collapse,
  context,
}: {
  lines: DiffLine[];
  inline: boolean;
  collapse: boolean;
  context: number;
}) {
  if (collapse) {
    const hunks = buildHunks(lines, context);
    if (hunks.length === 0) {
      return <div className="px-4 py-6 text-center text-xs text-muted">Тексты совпадают.</div>;
    }
    return (
      <>
        {hunks.map((hunk, i) => (
          <div key={i}>
            <div className="bg-accent/[0.06] px-3 py-0.5 text-[11px] text-muted">{hunk.header}</div>
            {hunk.lines.map((line, j) => (
              <UnifiedRow key={j} line={line} inline={inline} />
            ))}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      {lines.map((line, i) => (
        <UnifiedRow key={i} line={line} inline={inline} />
      ))}
    </>
  );
}

const SIGN: Record<DiffLine["type"], string> = { add: "+", del: "−", equal: " " };

function rowClass(type: DiffLine["type"]): string {
  if (type === "add") return "bg-success/[0.1]";
  if (type === "del") return "bg-danger/[0.1]";
  return "";
}

function UnifiedRow({ line, inline }: { line: DiffLine; inline: boolean }) {
  return (
    <div className={`flex ${rowClass(line.type)}`}>
      <span className="w-10 shrink-0 select-none px-1 text-right text-muted/60 tabular-nums">
        {line.leftNo ?? ""}
      </span>
      <span className="w-10 shrink-0 select-none px-1 text-right text-muted/60 tabular-nums">
        {line.rightNo ?? ""}
      </span>
      <span
        className={`w-5 shrink-0 select-none text-center ${
          line.type === "add" ? "text-success" : line.type === "del" ? "text-danger" : "text-muted/40"
        }`}
      >
        {SIGN[line.type]}
      </span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-3 text-foreground/90">
        {line.text || " "}
      </span>
    </div>
  );
}

function SplitDiff({ lines, inline }: { lines: DiffLine[]; inline: boolean }) {
  const rows = useMemo(() => pairRows(lines), [lines]);
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map((row, i) => (
          <SplitRow key={i} row={row} inline={inline} />
        ))}
      </tbody>
    </table>
  );
}

function SplitRow({ row, inline }: { row: SideRow; inline: boolean }) {
  // Для изменённой строки считаем внутристрочный дифф один раз на пару
  const wordDiff = inline && row.modified ? diffWords(row.left!.text, row.right!.text) : null;

  return (
    <tr className="align-top">
      <td className="w-10 select-none border-r border-edge/40 px-1 text-right text-muted/60 tabular-nums">
        {row.left?.leftNo ?? ""}
      </td>
      <td
        className={`w-1/2 whitespace-pre-wrap break-words px-2 ${
          row.left && row.left.type !== "equal" ? "bg-danger/[0.1]" : ""
        }`}
      >
        {wordDiff
          ? wordDiff.filter((s) => s.type !== "add").map((s, i) => (
              <span key={i} className={s.type === "del" ? "rounded-sm bg-danger/30" : ""}>
                {s.text}
              </span>
            ))
          : row.left?.text || (row.left ? " " : "")}
      </td>
      <td className="w-10 select-none border-r border-l border-edge/40 px-1 text-right text-muted/60 tabular-nums">
        {row.right?.rightNo ?? ""}
      </td>
      <td
        className={`w-1/2 whitespace-pre-wrap break-words px-2 ${
          row.right && row.right.type !== "equal" ? "bg-success/[0.1]" : ""
        }`}
      >
        {wordDiff
          ? wordDiff.filter((s) => s.type !== "del").map((s, i) => (
              <span key={i} className={s.type === "add" ? "rounded-sm bg-success/30" : ""}>
                {s.text}
              </span>
            ))
          : row.right?.text || (row.right ? " " : "")}
      </td>
    </tr>
  );
}
