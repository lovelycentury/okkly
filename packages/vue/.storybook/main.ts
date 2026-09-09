import type { StorybookConfig } from "@storybook/vue3-vite";
import vue from "@vitejs/plugin-vue";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
  /**
   * Brand marks and favicons are shared with the React workbench rather than
   * copied — one set of binaries, one place to update them. Paths are relative
   * to this directory.
   */
  staticDirs: [
    "../../react/.storybook/favicon",
    { from: "../../react/.storybook/brand", to: "/brand" },
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  /**
   * `@storybook/vue3-vite` expects the Vue plugin to come from a root
   * `vite.config.ts`. This package's lives in `vite.lib.config.ts` instead —
   * so that a library build never runs for the workbench — so the workbench
   * brings its own. Same arrangement as @okkly/svelte.
   */
  viteFinal: (vite) => ({
    ...vite,
    plugins: [vue(), ...(vite.plugins ?? [])],
  }),
};

export default config;
