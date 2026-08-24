/**
 * Приводит внутренние зависимости монорепо к текущим версиям пакетов.
 *
 * Зачем: пакеты ссылаются друг на друга точной версией
 * (`"@toimetdev/pathlogs-hooks": "0.2.0"`), а `npm version --workspaces`
 * поднимает только сами версии и эти ссылки не трогает. Публикация
 * с разъехавшимися пинами выглядит успешной, но у пользователя
 * `core@0.2.0` тянет `hooks@0.1.0` — и код, которого там ещё нет,
 * падает уже в его проекте.
 *
 * Запускается сам перед публикацией (см. `release` в корневом package.json).
 * С флагом `--check` ничего не пишет, а падает, если что-то разъехалось, —
 * это форма для CI.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

/** Все рабочие пакеты монорепо: и публикуемые, и приложения. */
async function workspaces() {
  const out = [];
  for (const group of ["packages", "apps"]) {
    const dir = join(root, group);
    if (!existsSync(dir)) continue;
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(dir, entry.name, "package.json");
      if (existsSync(file)) out.push(file);
    }
  }
  return out;
}

const files = await workspaces();

// Имя пакета → его текущая версия
const versions = new Map();
for (const file of files) {
  const pkg = JSON.parse(await readFile(file, "utf8"));
  versions.set(pkg.name, pkg.version);
}

const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies"];
const problems = [];
let changed = 0;

for (const file of files) {
  const raw = await readFile(file, "utf8");
  const pkg = JSON.parse(raw);
  let touched = false;

  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;

    for (const [name, range] of Object.entries(deps)) {
      const version = versions.get(name);
      // Чужие зависимости не трогаем — только те, что живут в этом же репо
      if (!version || range === version) continue;

      problems.push(`${pkg.name} → ${name}: ${range} вместо ${version}`);
      deps[name] = version;
      touched = true;
    }
  }

  if (touched && !checkOnly) {
    // Порядок ключей сохраняется: JSON.parse/stringify не переставляет их,
    // поэтому diff остаётся читаемым
    await writeFile(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    changed++;
  }
}

if (problems.length === 0) {
  console.log("Внутренние версии согласованы");
  process.exit(0);
}

if (checkOnly) {
  console.error("Внутренние версии разъехались:");
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nЗапустите: npm run sync-versions");
  process.exit(1);
}

console.log(`Обновлено пакетов: ${changed}`);
for (const p of problems) console.log(`  ${p}`);
console.log("\nВыполните npm install, чтобы связи пересобрались.");
