/**
 * The library build, kept out of `vite.config.ts` on purpose: Storybook's Vite
 * builder merges the project's root config into its own, and a lib build's
 * `build.lib` and `vite:dts` have no business running for the workbench.
 * (@okkly/react strips them in `.storybook/main.ts` instead; keeping the two
 * configs apart needs no such surgery.)
 */
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    // `entryRoot` is explicit for the same reason as @okkly/react's: the build
    // type-checks workspace sources reached through `@okkly/*`, so the inferred
    // root would climb to `packages/`.
    dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        assetFileNames: "okkly-vue.[ext]",
      },
    },
  },
});
