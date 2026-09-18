/**
 * Пересобирает src/content/pages.ts по файлам в src/content/pages/<язык>.
 *
 * Импорты в реестре статические — иначе недостающая страница превращалась бы
 * в 404 у пользователя вместо ошибки сборки. Писать их руками при сотне
 * страниц на двух языках утомительно, поэтому список генерируется.
 */
import { readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content");
const pagesDir = join(root, "pages");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const files = (await walk(pagesDir)).sort();

const entries = files.map((file) => {
  // pages/en/components/dialog.tsx -> lang "en", slug "components/dialog"
  const rel = relative(pagesDir, file).replace(/\\/g, "/").replace(/\.tsx$/, "");
  const slash = rel.indexOf("/");
  const lang = rel.slice(0, slash);
  const slug = rel.slice(slash + 1);
  // Имя переменной из пути: en/components/dialog -> en_components_dialog
  const ident = rel.replace(/[^a-zA-Z0-9]+/g, "_");
  return { rel, lang, slug, ident };
});

const langs = [...new Set(entries.map((e) => e.lang))].sort();

const byLang = langs
  .map((lang) => {
    const rows = entries
      .filter((e) => e.lang === lang)
      .map((e) => `    "${e.slug}": ${e.ident},`)
      .join("\n");
    return `  ${lang}: {\n${rows}\n  },`;
  })
  .join("\n");

const source = `import type { ComponentType } from "react";
import type { TocEntry } from "@/components/Toc";
import { ALL_ITEMS } from "./nav";
import { LANGS, type Lang } from "./locale";

${entries.map((e) => `import * as ${e.ident} from "./pages/${e.rel}";`).join("\n")}

/** Модуль страницы: оглавление и сама разметка. */
export interface DocModule {
  toc: TocEntry[];
  default: ComponentType;
}

/**
 * Все страницы документации по языку и slug.
 *
 * Файл собирается скриптом \`node scripts/gen-pages.mjs\` — не правьте руками.
 * Импорты статические, а не динамические по имени файла: так недостающая
 * страница ломает сборку, а не превращается в 404 у пользователя.
 */
export const PAGES: Record<Lang, Record<string, DocModule>> = {
${byLang}
};

/**
 * Навигация и набор страниц должны совпадать — на каждом языке.
 *
 * Пункт меню, ведущий в никуда, иначе обнаруживается только кликом; страница
 * без пункта — вообще никак. Проверка идёт по всем языкам сразу, поэтому
 * перевод, забытый на одном из них, роняет сборку, а не выкатывается наружу
 * пустым разделом.
 */
const problems: string[] = [];

for (const lang of LANGS) {
  const pages = PAGES[lang] ?? {};
  const missing = ALL_ITEMS.filter((item) => !pages[item.slug]).map((item) => item.slug);
  const orphans = Object.keys(pages).filter((slug) => !ALL_ITEMS.some((i) => i.slug === slug));

  if (missing.length > 0) problems.push(\`[\${lang}] нет страниц: \${missing.join(", ")}\`);
  if (orphans.length > 0) problems.push(\`[\${lang}] страницы вне меню: \${orphans.join(", ")}\`);
}

if (problems.length > 0) {
  throw new Error(\`Навигация и страницы разошлись — \${problems.join("; ")}\`);
}
`;

await writeFile(join(root, "pages.ts"), source, "utf8");

const summary = langs.map((l) => `${l}: ${entries.filter((e) => e.lang === l).length}`).join(", ");
console.log(`Собрано страниц — ${summary}`);
