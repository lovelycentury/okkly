import { fileURLToPath } from "node:url";
import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vite";

/** Serves the Playwright mount harness (`index.html` next to this file). */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [angular({ tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)) })],
  resolve: {
    alias: [
      // `src/styles.scss` — the stylesheet the package publishes — addresses
      // design-system files by their on-disk `src/` path, which the package's
      // `exports` map does not expose (`build:styles` reaches them through a
      // sass load path instead). Map that prefix to the files so the harness
      // renders with exactly the stylesheet that ships.
      {
        find: /^@okkly\/design-system\/src\//,
        replacement: fileURLToPath(
          new URL("../node_modules/@okkly/design-system/src/", import.meta.url),
        ),
      },
    ],
  },
  // Must match `PORT` in ../playwright.config.ts.
  server: { port: 3101, strictPort: true },
});
