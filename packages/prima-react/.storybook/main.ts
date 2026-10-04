import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

/** vite-plugin-dts registers itself as `vite:dts`. */
const isDtsPlugin = (plugin: unknown): boolean =>
  !!plugin &&
  typeof plugin === "object" &&
  "name" in plugin &&
  (plugin as { name: string }).name === "vite:dts";

/** `plugins` may contain nested arrays, so flatten before filtering. */
const withoutDts = (plugins: PluginOption[]): PluginOption[] =>
  plugins.flat(Infinity as 1).filter((plugin) => !isDtsPlugin(plugin));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  /**
   * The favicon is @okkly/react's; `.storybook/brand/*` (the sidebar logo, with
   * its own "prima.react" wordmark) is served at `/brand/*`.
   */
  staticDirs: ["../../react/.storybook/favicon", { from: "./brand", to: "/brand" }],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  /**
   * The package's vite.config.ts is a *library* build. Storybook needs an app
   * build, so strip the library-only pieces while keeping the React plugin:
   *   - `build.lib` / `rollupOptions` keep react external, leaving it unresolved
   *     at runtime; the workbench has to bundle it.
   *   - `vite:dts` emits the published .d.ts and errors out here.
   */
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutDts(viteConfig.plugins ?? []),
    build: { ...viteConfig.build, lib: false as const, rollupOptions: undefined },
  }),
};

export default config;
