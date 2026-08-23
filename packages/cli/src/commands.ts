import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  CONFIG_FILE,
  DEFAULT_CONFIG,
  readConfig,
  requireConfig,
  writeConfig,
  type Config,
} from "./config.js";
import { loadRegistry, registryRoot, resolveItems, type RegistryItem } from "./registry.js";

/**
 * Цвета в терминале. Отключаются, когда вывод не в TTY (пайп, файл, CI-лог)
 * или когда выставлен NO_COLOR: escape-последовательности в логе сборки
 * читаются хуже, чем простой текст.
 */
const ESC = String.fromCharCode(27);
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (code: string) => (s: string) =>
  useColor ? ESC + '[' + code + 'm' + s + ESC + '[0m' : s;
export const bold = paint("1");
export const dim = paint("2");
export const green = paint("32");
export const yellow = paint("33");
export const cyan = paint("36");

const STYLE_IMPORTS = [
  '@import "@toimetdev/pathlogs-tokens/styles/index.css";',
  '@import "@toimetdev/pathlogs-core/styles/components.css";',
];
const TAILWIND_BRIDGE = '@import "@toimetdev/pathlogs-tokens/styles/tailwind.css";';

export interface CommandOptions {
  cwd: string;
  /** Показать, что произошло бы, ничего не записывая. */
  dryRun?: boolean;
  /** Перезаписывать существующие файлы без вопроса. */
  force?: boolean;
}

/** Строка уже есть в файле — повторно её дописывать не нужно. */
function hasLine(content: string, line: string): boolean {
  return content.includes(line);
}

/**
 * Дописывает импорты стилей фреймворка.
 *
 * Мост к Tailwind идёт последним: `@theme inline` должен видеть уже
 * объявленные токены, иначе утилиты соберутся с пустыми значениями.
 */
function withStyleImports(content: string, tailwind: boolean): string {
  const lines = [...STYLE_IMPORTS];
  if (tailwind) lines.push(TAILWIND_BRIDGE);
  const missing = lines.filter((line) => !hasLine(content, line));
  if (missing.length === 0) return content;

  // Импорты фреймворка идут после `@import "tailwindcss"`, если он есть:
  // порядок в CSS значим, и слой токенов должен лечь поверх базового
  const anchor = /^@import\s+["']tailwindcss["'];?\s*$/m;
  const match = anchor.exec(content);
  if (match) {
    const at = match.index + match[0].length;
    return `${content.slice(0, at)}\n${missing.join("\n")}${content.slice(at)}`;
  }
  return `${missing.join("\n")}\n${content}`;
}

export async function init(options: CommandOptions & { config?: Partial<Config> }): Promise<void> {
  const { cwd, dryRun } = options;
  const existing = await readConfig(cwd);
  const config: Config = { ...DEFAULT_CONFIG, ...existing, ...options.config };

  console.log(bold("\nНастройка PathLogs UI\n"));
  console.log(`  ${dim("каталог виджетов")}  ${config.componentsDir}`);
  console.log(`  ${dim("алиас импорта")}     ${config.alias || dim("(относительные пути)")}`);
  console.log(`  ${dim("файл стилей")}       ${config.css}`);
  console.log(`  ${dim("Tailwind")}          ${config.tailwind ? "да" : "нет"}\n`);

  if (dryRun) {
    console.log(yellow("  Пробный запуск: ничего не записано.\n"));
    return;
  }

  await writeConfig(cwd, config);
  console.log(`  ${green("+")} ${CONFIG_FILE}`);

  await mkdir(join(cwd, config.componentsDir), { recursive: true });
  console.log(`  ${green("+")} ${config.componentsDir}/`);

  const cssPath = join(cwd, config.css);
  if (existsSync(cssPath)) {
    const content = await readFile(cssPath, "utf8");
    const next = withStyleImports(content, config.tailwind);
    if (next === content) {
      console.log(`  ${dim("=")} ${config.css} ${dim("(импорты уже на месте)")}`);
    } else {
      await writeFile(cssPath, next, "utf8");
      console.log(`  ${green("~")} ${config.css} ${dim("(добавлены импорты стилей)")}`);
    }
  } else {
    // Файла нет — не выдумываем чужую структуру, а показываем, что вставить
    console.log(`\n  ${yellow("!")} ${config.css} не найден. Добавьте в свой CSS:\n`);
    for (const line of [...STYLE_IMPORTS, ...(config.tailwind ? [TAILWIND_BRIDGE] : [])]) {
      console.log(`      ${line}`);
    }
  }

  console.log(`\n  ${dim("Дальше:")} npx @toimetdev/pathlogs-ui add kanban\n`);
}

export async function list(): Promise<void> {
  const items = await loadRegistry();
  console.log(bold("\nВиджеты реестра\n"));
  for (const item of items) {
    console.log(`  ${cyan(item.name.padEnd(12))} ${item.title}`);
    if (item.description) console.log(`  ${" ".repeat(12)} ${dim(item.description)}`);
    console.log();
  }
  console.log(`  ${dim("Установка:")} npx @toimetdev/pathlogs-ui add <имя>\n`);
}

/** Импорты между файлами виджета: относительные заменяются на алиас проекта. */
function rewriteImports(source: string, item: RegistryItem, config: Config): string {
  if (!config.alias) return source;
  // Только импорты внутри самого виджета: «./kanbanOrder» → «@/…/kanban/kanbanOrder».
  // Пакеты фреймворка (@toimetdev/pathlogs-*) не трогаем — они ставятся из npm.
  return source.replace(
    /from\s+"\.\/([A-Za-z0-9_-]+)"/g,
    (_match, file: string) => `from "${config.alias}/${item.name}/${file}"`
  );
}

export async function add(
  names: string[],
  options: CommandOptions
): Promise<void> {
  const { cwd, dryRun, force } = options;
  const config = await requireConfig(cwd);
  const items = await resolveItems(names);
  const root = registryRoot();

  console.log(bold(`\nУстановка: ${items.map((i) => i.name).join(", ")}\n`));

  const packages = new Set<string>();
  const skipped: string[] = [];

  for (const item of items) {
    for (const dep of [...item.dependencies, ...item.packageDependencies]) {
      packages.add(dep);
    }

    for (const file of item.files) {
      const from = join(root, "widgets", item.name, file.path);
      const to = join(cwd, config.componentsDir, file.target);
      const shown = join(config.componentsDir, file.target).replace(/\\/g, "/");

      if (existsSync(to) && !force) {
        // Молча перезаписать чужую правку — худшее, что может сделать CLI:
        // виджеты копируются в проект именно затем, чтобы их правили
        skipped.push(shown);
        console.log(`  ${yellow("=")} ${shown} ${dim("(уже есть, пропущен)")}`);
        continue;
      }

      if (dryRun) {
        console.log(`  ${dim("+")} ${shown} ${dim("(пробный запуск)")}`);
        continue;
      }

      const source = await readFile(from, "utf8");
      await mkdir(dirname(to), { recursive: true });
      await writeFile(to, rewriteImports(source, item, config), "utf8");
      console.log(`  ${green("+")} ${shown}`);
    }
  }

  if (skipped.length > 0) {
    console.log(`\n  ${dim("Перезаписать пропущенные:")} добавьте --force`);
  }

  if (packages.size > 0) {
    console.log(`\n  ${dim("Убедитесь, что установлены:")}`);
    console.log(`      npm install ${[...packages].sort().join(" ")}`);
  }

  if (items.some((i) => i.tailwind) && !config.tailwind) {
    console.log(
      `\n  ${yellow("!")} Виджеты размечены классами Tailwind, а в ${CONFIG_FILE} указано tailwind: false.`
    );
    console.log(`      Без Tailwind они будут без стилей.`);
  }

  console.log();
}
