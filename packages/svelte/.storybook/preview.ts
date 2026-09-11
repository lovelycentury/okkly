import type { Preview } from "@storybook/svelte";
// Tokens, fonts, and reset — the `--okkly-*` custom properties every component
// rule below resolves against. Real apps do the same at their entry point.
import "@okkly/design-system/styles/index.scss";
// Component styles, mirroring `styles.scss` (which the published `style.css`
// is built from). Imported through the package's public export paths here so
// Vite resolves them; the build reads them off disk instead.
import "@okkly/design-system/components/Button/Button.scss";
import "@okkly/design-system/components/Ripple/Ripple.scss";
import "@okkly/design-system/components/TextField/TextField.scss";
import "./preview.css";
import Canvas from "./Canvas.svelte";
import { okklyTheme } from "./theme";

/**
 * Dark-only: the design system has no light palette yet, so the stage paints
 * the canvas token behind every story.
 */
const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
      expanded: true,
      sort: "requiredFirst",
    },
    backgrounds: { disable: true },
    // No Storybook chrome padding — the stage must be edge-to-edge.
    layout: "fullscreen",
    docs: {
      theme: okklyTheme,
      codePanel: true,
    },
    options: {
      storySort: {
        order: ["Control", "Navigation", "Feedback", "Overlays", "Data", "Media", "*"],
      },
    },
  },
  decorators: [() => ({ Component: Canvas })],
};

export default preview;
