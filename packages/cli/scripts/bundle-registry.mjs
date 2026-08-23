/**
 * Кладёт реестр внутрь пакета CLI перед публикацией.
 *
 * Пакет должен везти виджеты с собой: `npx @toimetdev/pathlogs-ui add` не должен
 * ходить в сеть второй раз, а версия виджетов обязана совпадать с версией
 * CLI, которую поставил пользователь. В монорепо реестр лежит выше,
 * и без копирования он не попал бы в tarball.
 */
import { cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "..", "registry");
const target = join(here, "..", "registry");

if (!existsSync(source)) {
  console.error(`Не найден реестр: ${source}`);
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
// tsconfig реестра нужен только в монорепо — для типизации виджетов на месте.
// В пакете он бесполезен и лишь путает того, кто заглянет внутрь.
await cp(source, target, {
  recursive: true,
  filter: (path) => !path.endsWith("tsconfig.json"),
});
console.log(`Реестр скопирован в ${target}`);
