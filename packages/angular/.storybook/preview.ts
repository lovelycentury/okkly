import { setCompodocJson } from "@storybook/addon-docs/angular";
import { componentWrapperDecorator, type Preview } from "@storybook/angular";
// Tokens, fonts, and reset — the `--okkly-*` custom properties every component
// rule below resolves against. Real apps do the same at their entry point.
import "@okkly/design-system/styles/index.scss";
// Component styles, mirroring `src/styles.scss` (which the published
// `style.css` is built from). Imported through the package's public export
// paths here so Vite resolves them; the build reads them off disk instead.
import "@okkly/design-system/components/Button/Button.scss";
import "@okkly/design-system/components/Ripple/Ripple.scss";
import "@okkly/design-system/components/TextField/TextField.scss";
import "./preview.css";
import { okklyTheme } from "./theme";
// Angular has no react-docgen equivalent: Compodoc reads the inputs' types,
// defaults, and JSDoc off the sources into `documentation.json`, which the
// `docs:json` script regenerates before Storybook starts.
import documentation from "../documentation.json";

setCompodocJson(documentation);

/**
 * Dark-only: the design system has no light palette yet, so the stage paints
 * the canvas token behind every story. Docs follow the React workbench —
 * global autodocs, expanded controls, required props first.
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
  decorators: [
    componentWrapperDecorator(
      (story) => `<div class="okkly-storybook-canvas">${story}</div>`,
      undefined,
    ),
  ],
};

export default preview;
