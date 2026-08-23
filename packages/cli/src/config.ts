import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

/** Имя файла настроек в корне проекта пользователя. */
export const CONFIG_FILE = "pathlogs.json";

export interface Config {
  /** Куда класть скопированные виджеты, относительно корня проекта. */
  componentsDir: string;
  /**
   * Алиас, которым виджеты импортируют друг друга внутри проекта.
   * Пустая строка — относительные пути.
   */
  alias: string;
  /** Файл, в который init дописывает импорты стилей. */
  css: string;
  /** Проект использует Tailwind: виджеты копируются как есть. */
  tailwind: boolean;
}

export const DEFAULT_CONFIG: Config = {
  componentsDir: "src/components/ui",
  alias: "@/components/ui",
  css: "src/app/globals.css",
  tailwind: true,
};

export function configPath(cwd: string): string {
  return join(cwd, CONFIG_FILE);
}

export async function readConfig(cwd: string): Promise<Config | null> {
  const path = configPath(cwd);
  if (!existsSync(path)) return null;
  const raw = JSON.parse(await readFile(path, "utf8")) as Partial<Config>;
  // Недостающие поля добираем из значений по умолчанию: файл, написанный
  // для прошлой версии CLI, должен продолжать работать
  return { ...DEFAULT_CONFIG, ...raw };
}

export async function writeConfig(cwd: string, config: Config): Promise<void> {
  await writeFile(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

/**
 * Настройки или понятная ошибка.
 *
 * Молча брать значения по умолчанию нельзя: команда разложила бы файлы
 * не туда, где их ждёт проект, и пользователь узнал бы об этом только
 * по сломанным импортам.
 */
export async function requireConfig(cwd: string): Promise<Config> {
  const config = await readConfig(cwd);
  if (!config) {
    throw new Error(
      `Не найден ${CONFIG_FILE}. Выполните «npx @toimetdev/pathlogs-ui init» в корне проекта.`
    );
  }
  return config;
}
