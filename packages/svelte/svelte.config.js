import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** Shared by svelte-package, svelte-check, Vitest, and Storybook. */
export default {
  preprocess: vitePreprocess(),
};
