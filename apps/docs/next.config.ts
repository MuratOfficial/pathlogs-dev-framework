import type { NextConfig } from "next";

const config: NextConfig = {
  // Пакеты фреймворка лежат в этом же монорепо и подключены симлинками.
  // Без outputFileTracingRoot Next ищет корень по ближайшему lock-файлу
  // и не видит их при сборке.
  outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
};

export default config;
