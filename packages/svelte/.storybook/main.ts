import type { StorybookConfig } from "@storybook/svelte-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.svelte"],
  addons: ["@storybook/addon-docs", "@storybook/addon-svelte-csf"],
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
    name: "@storybook/svelte-vite",
    options: {},
  },
  /**
   * `@storybook/svelte-vite` expects the Svelte plugin to come from a root
   * `vite.config.ts`. This package has none — it builds with `svelte-package`,
   * not Vite — so the workbench brings its own. It goes first in the array:
   * Storybook's own transforms read compiled output and fail on raw markup.
   */
  viteFinal: (vite) => ({
    ...vite,
    plugins: [svelte(), ...(vite.plugins ?? [])],
  }),
};

export default config;
