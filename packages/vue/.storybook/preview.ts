import type { Preview } from "@storybook/vue3-vite";
// Tokens, fonts, and reset — the `--okkly-*` custom properties every component
// rule below resolves against. Real apps do the same at their entry point.
import "@okkly/design-system/styles/index.scss";
import "./preview.css";
import { okklyTheme } from "./theme";

/**
 * Component styles come through the components themselves — each SFC imports
 * its own stylesheet, the same way the published bundle collects them.
 *
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
  // A wrapper element, not `#storybook-root`: that root only exists on the
  // canvas, so styling it leaves the inline stories on a Docs page unpadded.
  decorators: [() => ({ template: `<div class="okkly-storybook-canvas"><story /></div>` })],
};

export default preview;
