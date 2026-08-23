#!/usr/bin/env node
/**
 * pathlogs-ui — установка виджетов PathLogs в проект.
 *
 * Виджеты копируются в код проекта, а не подключаются пакетом: доска
 * и диаграмма почти всегда требуют правок под конкретный домен, и держать
 * такое за стеной версионирования — значит вынуждать обходить его пропсами.
 * Примитивы и хуки, наоборот, ставятся из npm: @toimetdev/pathlogs-core
 * и @toimetdev/pathlogs-hooks.
 */

import { add, bold, cyan, dim, init, list } from "./commands.js";
import { DEFAULT_CONFIG } from "./config.js";

const HELP = `
${bold("pathlogs-ui")} — виджеты PathLogs

${bold("Команды")}
  ${cyan("init")}              создать pathlogs.json и подключить стили
  ${cyan("add <виджет…>")}     скопировать виджеты в проект
  ${cyan("list")}              показать, что есть в реестре

${bold("Флаги")}
  --cwd <путь>       корень проекта (по умолчанию текущий каталог)
  --dir <путь>       каталог виджетов (init), по умолчанию ${DEFAULT_CONFIG.componentsDir}
  --alias <алиас>    алиас импорта (init), по умолчанию ${DEFAULT_CONFIG.alias}
  --css <путь>       файл стилей (init), по умолчанию ${DEFAULT_CONFIG.css}
  --no-tailwind      проект без Tailwind (init)
  --force            перезаписать существующие файлы (add)
  --dry-run          показать план, ничего не записывая
  -h, --help         эта справка

${bold("Примеры")}
  npx @toimetdev/pathlogs-ui init
  npx @toimetdev/pathlogs-ui add kanban gantt
  npx @toimetdev/pathlogs-ui add filter-bar --dry-run
`;

interface Parsed {
  command: string | undefined;
  positional: string[];
  flags: Map<string, string | boolean>;
}

/**
 * Разбор аргументов вручную: зависимость ради трёх флагов не окупается,
 * а поведение здесь нужно ровно одно — `--key value` и `--key`.
 */
function parseArgv(argv: string[]): Parsed {
  const positional: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("-")) {
      positional.push(arg);
      continue;
    }
    const key = arg.replace(/^--?/, "");
    const next = argv[i + 1];
    // Значение — только то, что само не выглядит флагом: иначе
    // «--dry-run add» съело бы команду
    if (next !== undefined && !next.startsWith("-")) {
      flags.set(key, next);
      i++;
    } else {
      flags.set(key, true);
    }
  }

  return { command: positional[0], positional: positional.slice(1), flags };
}

function str(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

async function main(): Promise<void> {
  const { command, positional, flags } = parseArgv(process.argv.slice(2));

  if (!command || flags.has("help") || flags.has("h")) {
    console.log(HELP);
    return;
  }

  const cwd = str(flags, "cwd") ?? process.cwd();
  const options = {
    cwd,
    dryRun: flags.get("dry-run") === true,
    force: flags.get("force") === true,
  };

  switch (command) {
    case "init": {
      const config: Record<string, unknown> = {};
      const dir = str(flags, "dir");
      const alias = str(flags, "alias");
      const css = str(flags, "css");
      if (dir !== undefined) config.componentsDir = dir;
      if (alias !== undefined) config.alias = alias;
      if (css !== undefined) config.css = css;
      if (flags.get("no-tailwind") === true) config.tailwind = false;
      await init({ ...options, config });
      return;
    }

    case "add": {
      if (positional.length === 0) {
        console.error(`\n  Укажите хотя бы один виджет. Список: ${dim("pathlogs-ui list")}\n`);
        process.exitCode = 1;
        return;
      }
      await add(positional, options);
      return;
    }

    case "list":
      await list();
      return;

    default:
      console.error(`\n  Неизвестная команда: ${command}`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`\n  ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
