import { fileURLToPath } from "node:url";
import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Signal inputs, `contentChild`, and host directives are compiled, not
  // reflected — the JIT compiler can't see initializer-based APIs, so the
  // Angular compiler has to run over the sources before Vitest loads them.
  plugins: [angular({ tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)) })],
  test: {
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./vitest.setup.ts", import.meta.url))],
  },
});
