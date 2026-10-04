import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  // `entryRoot` is explicit so the declarations land at `dist/index.d.ts`
  // rather than under a path inferred from every source the build reaches.
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" })],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        // Audio components touch the Web Audio API, which only exists in the
        // browser — mark the whole package as a Next App Router client boundary.
        banner: '"use client";',
        assetFileNames: "okkly-prima-react.[ext]",
      },
    },
  },
});
