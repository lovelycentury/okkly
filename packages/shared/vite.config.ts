import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  // One declaration file per source file rather than a rollup: api-extractor
  // rolls up a single entry, and this package has two.
  plugins: [dts({ tsconfigPath: "./tsconfig.build.json" })],
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        // Test data the framework packages' component tests share — a separate
        // entry, so nothing a consumer imports pulls it in.
        testing: fileURLToPath(new URL("./src/testing.ts", import.meta.url)),
      },
      formats: ["es"],
    },
  },
});
