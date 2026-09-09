import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  // Svelte publishes separate browser and SSR entries; the tests run against a
  // DOM, so they need the browser one.
  resolve: { conditions: ["browser"] },
  test: {
    environment: "jsdom",
    // `svelte-package` stages a compiled copy of `src` in `.svelte-kit`, specs
    // included — without this the same suite runs twice, from two roots.
    include: ["src/**/*.spec.ts"],
    setupFiles: [fileURLToPath(new URL("./vitest.setup.ts", import.meta.url))],
  },
});
