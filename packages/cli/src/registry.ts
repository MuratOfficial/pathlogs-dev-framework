import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Один файл виджета: где лежит в реестре и куда кладётся в проекте. */
export interface RegistryFile {
  path: string;
  target: string;
}

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  type: "widget";
  /** npm-пакеты, которые нужно доустановить (@xyflow/react и подобные). */
  dependencies: string[];
  /** Другие элементы реестра, без которых этот не работает. */
  registryDependencies: string[];
  /** Пакеты фреймворка, от которых зависит виджет. */
  packageDependencies: string[];
  /** Виджет размечен классами Tailwind. */
  tailwind: boolean;
  files: RegistryFile[];
}

/**
 * Где лежит реестр.
 *
 * Пакет CLI везёт реестр с собой (см. `files` в его package.json): установка
 * из npm не должна требовать сети во второй раз, а версия виджетов должна
 * совпадать с версией CLI, которую поставил пользователь.
 *
 * В самом монорепо реестр лежит выше по дереву — поднимаемся, пока не найдём.
 */
export function registryRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "registry"),
    join(here, "..", "..", "registry"),
    join(here, "..", "..", "..", "registry"),
    join(here, "..", "..", "..", "..", "registry"),
  ];
  for (const candidate of candidates) {
    if (existsSync(join(candidate, "widgets"))) return resolve(candidate);
  }
  throw new Error(
    "Не найден каталог реестра. Ожидался ./registry/widgets рядом с пакетом CLI."
  );
}

function assertItem(value: unknown, name: string): RegistryItem {
  const item = value as Partial<RegistryItem>;
  if (!item || typeof item.name !== "string" || !Array.isArray(item.files)) {
    throw new Error(`Повреждён meta.json виджета «${name}»: нет name или files.`);
  }
  return {
    name: item.name,
    title: item.title ?? item.name,
    description: item.description ?? "",
    type: "widget",
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    packageDependencies: item.packageDependencies ?? [],
    tailwind: item.tailwind ?? false,
    files: item.files,
  };
}

/** Все виджеты реестра, по алфавиту. */
export async function loadRegistry(root = registryRoot()): Promise<RegistryItem[]> {
  const widgetsDir = join(root, "widgets");
  const entries = await readdir(widgetsDir, { withFileTypes: true });

  const items: RegistryItem[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const metaPath = join(widgetsDir, entry.name, "meta.json");
    if (!existsSync(metaPath)) continue;
    const raw = JSON.parse(await readFile(metaPath, "utf8")) as unknown;
    items.push(assertItem(raw, entry.name));
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function findItem(name: string, root = registryRoot()): Promise<RegistryItem> {
  const items = await loadRegistry(root);
  const item = items.find((i) => i.name === name);
  if (!item) {
    const known = items.map((i) => i.name).join(", ");
    throw new Error(`Виджет «${name}» не найден. Доступны: ${known}`);
  }
  return item;
}

/**
 * Раскрывает зависимости между элементами реестра в порядке установки.
 *
 * Обход в глубину с отметкой посещённых: реестр небольшой, а цикл в нём
 * повесил бы CLI, поэтому повторный вход в элемент просто пропускается.
 */
export async function resolveItems(
  names: string[],
  root = registryRoot()
): Promise<RegistryItem[]> {
  const all = await loadRegistry(root);
  const byName = new Map(all.map((i) => [i.name, i]));
  const seen = new Set<string>();
  const out: RegistryItem[] = [];

  function visit(name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = byName.get(name);
    if (!item) {
      const known = all.map((i) => i.name).join(", ");
      throw new Error(`Виджет «${name}» не найден. Доступны: ${known}`);
    }
    for (const dep of item.registryDependencies) visit(dep);
    out.push(item);
  }

  for (const name of names) visit(name);
  return out;
}
