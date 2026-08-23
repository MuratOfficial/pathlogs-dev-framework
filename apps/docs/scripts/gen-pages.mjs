/**
 * Пересобирает src/content/pages.ts по файлам в src/content/pages.
 *
 * Импорты в реестре статические — иначе недостающая страница превращалась бы
 * в 404 у пользователя вместо ошибки сборки. Писать их руками при трёх десятках
 * страниц утомительно, поэтому список генерируется.
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
  const slug = relative(pagesDir, file).replace(/\\/g, "/").replace(/\.tsx$/, "");
  // Имя переменной из slug: components/dialog -> components_dialog
  const ident = slug.replace(/[^a-zA-Z0-9]+/g, "_");
  return { slug, ident };
});

const source = `import type { ComponentType } from "react";
import type { TocEntry } from "@/components/Toc";
import { ALL_ITEMS } from "./nav";

${entries.map((e) => `import * as ${e.ident} from "./pages/${e.slug}";`).join("\n")}

/** Модуль страницы: оглавление и сама разметка. */
export interface DocModule {
  toc: TocEntry[];
  default: ComponentType;
}

/**
 * Все страницы документации по их slug.
 *
 * Файл собирается скриптом \`node scripts/gen-pages.mjs\` — не правьте руками.
 * Импорты статические, а не динамические по имени файла: так недостающая
 * страница ломает сборку, а не превращается в 404 у пользователя.
 */
export const PAGES: Record<string, DocModule> = {
${entries.map((e) => `  "${e.slug}": ${e.ident},`).join("\n")}
};

/**
 * Навигация и набор страниц должны совпадать. Пункт меню, ведущий в никуда,
 * иначе обнаруживается только кликом.
 */
const missing = ALL_ITEMS.filter((item) => !PAGES[item.slug]).map((item) => item.slug);
const orphans = Object.keys(PAGES).filter((slug) => !ALL_ITEMS.some((i) => i.slug === slug));

if (missing.length > 0 || orphans.length > 0) {
  const details = [
    missing.length > 0 ? \`нет страниц: \${missing.join(", ")}\` : "",
    orphans.length > 0 ? \`страницы вне меню: \${orphans.join(", ")}\` : "",
  ]
    .filter(Boolean)
    .join("; ");
  throw new Error(\`Навигация и страницы разошлись — \${details}\`);
}
`;

await writeFile(join(root, "pages.ts"), source, "utf8");
console.log(`Собрано страниц: ${entries.length}`);
