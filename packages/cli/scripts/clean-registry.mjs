/**
 * Убирает копию реестра из пакета после упаковки.
 *
 * Копию кладёт bundle-registry.mjs, и в тарболле она нужна — CLI ищет
 * реестр рядом с собой. Но в монорепо эта копия перекрывает настоящий
 * каталог registry/: `pathlogs-ui list` начинает показывать состояние
 * на момент последней упаковки, а не то, что есть на диске.
 *
 * Поэтому после pack копию удаляем. Тарболл к этому моменту уже собран.
 */
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const target = join(dirname(fileURLToPath(import.meta.url)), "..", "registry");
await rm(target, { recursive: true, force: true });
console.log("Копия реестра убрана из пакета");
