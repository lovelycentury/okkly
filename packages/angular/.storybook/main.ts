import type { StorybookConfig } from "@analogjs/storybook-angular";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
  /**
   * Brand marks and favicons are shared with the React workbench rather than
   * copied — one set of binaries, one place to update them. Paths are relative
   * to this directory.
   */
  staticDirs: ["../../react/.storybook/favicon", { from: "./brand", to: "/brand" }],
  /**
   * The Vite builder, not the Angular CLI's webpack one: it needs no
   * `angular.json`, and it reuses `@analogjs/vite-plugin-angular` — the same
   * compiler pass the Vitest setup runs on.
   */
  framework: {
    name: "@analogjs/storybook-angular",
    options: {},
  },
};

export default config;
