/**
 * Поднимает версию во всех пакетах монорепо и готовит его к публикации.
 *
 * Почему не `npm version --workspaces`: она меняет номера, но не трогает
 * ссылки пакетов друг на друга, а сразу после этого пытается поставить
 * зависимости. Ссылки в этот момент указывают на версию, которой в реестре
 * ещё нет, — и установка падает с ETARGET. Даже когда не падает, npm тянет
 * из реестра опубликованный пакет во вложенный node_modules, тот перекрывает
 * рабочую копию, и сборка ломается на «нет такого экспорта» у кода, который
 * лежит рядом.
 *
 * Поэтому номера и ссылки правятся здесь одним проходом, и только потом
 * запускается установка.
 *
 *   npm run bump 0.3.0
 *   npm run bump minor
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies"];

/** Все package.json рабочих пакетов: и публикуемые, и приложения. */
function workspaceFiles() {
  const out = [];
  for (const group of ["packages", "apps"]) {
    const dir = join(root, group);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(dir, entry.name, "package.json");
      if (existsSync(file)) out.push(file);
    }
  }
  return out;
}

const read = (file) => JSON.parse(readFileSync(file, "utf8"));

const files = workspaceFiles();
const current = read(join(root, "packages", "core", "package.json")).version;

const target = process.argv.slice(2).find((a) => !a.startsWith("-"));

if (!target) {
  console.error(`
Укажите версию или тип повышения.

  npm run bump 0.3.0
  npm run bump patch|minor|major

Сейчас в пакетах: ${current}
`);
  process.exit(1);
}

/** Следующая версия: явное значение или шаг от текущей. */
function resolveVersion(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) throw new Error(`Не разобрать текущую версию: ${current}`);
  const [major, minor, patch] = match.slice(1).map(Number);

  if (input === "major") return `${major + 1}.0.0`;
  if (input === "minor") return `${major}.${minor + 1}.0`;
  if (input === "patch") return `${major}.${minor}.${patch + 1}`;

  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(input)) {
    throw new Error(`Не похоже на версию: ${input}`);
  }
  return input;
}

const next = resolveVersion(target);
const names = new Set(files.map((f) => read(f).name));

console.log(`\n▸ ${current} → ${next}\n`);

for (const file of files) {
  const pkg = read(file);
  pkg.version = next;

  // Ссылки между своими пакетами двигаются вместе с номерами — в том же
  // проходе, иначе между записью и установкой остаётся окно, в котором
  // репозиторий ссылается на несуществующую версию
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (names.has(name)) deps[name] = next;
    }
  }

  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`  ${pkg.name}`);
}

console.log("\n▸ установка");
// На Windows исполняемый файл называется npm.cmd. Зовём его по имени,
// а не через shell: true — иначе Node справедливо предупреждает, что
// аргументы уходят в командную строку без экранирования.
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const install = spawnSync(npm, ["install"], { cwd: root, stdio: "inherit" });

if (install.status !== 0) {
  console.error("\nУстановка не прошла. Остановились.");
  process.exit(install.status ?? 1);
}

console.log(`
Готово: ${next}

Дальше:
  npm run release:dry   посмотреть, что уедет
  npm run release       опубликовать
`);
