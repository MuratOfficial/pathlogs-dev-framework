import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@toimetdev/pathlogs-tokens": resolve(__dirname, "packages/tokens/src/index.ts"),
      "@toimetdev/pathlogs-hooks": resolve(__dirname, "packages/hooks/src/index.ts"),
      "@toimetdev/pathlogs-core": resolve(__dirname, "packages/core/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
