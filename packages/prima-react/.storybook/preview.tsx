import type { Preview } from "@storybook/react";
import "@okkly/design-system/styles/index.scss";
import { okklyTheme } from "./theme";

/**
 * Components consume design tokens as CSS custom properties (`--okkly-*`), so
 * the token root is loaded once globally here — real apps do the same at their
 * entry point. Dark-only, like the rest of the design system.
 */
const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i },
      expanded: true,
      sort: "requiredFirst",
      exclude: ["ref", "key", "className", "style"],
    },
    backgrounds: { disable: true },
    docs: { theme: okklyTheme, codePanel: true },
    options: {
      storySort: {
        order: ["Introduction", "Equalizers", "Effects", "*"],
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          color: "var(--okkly-text-primary)",
          fontFamily: "var(--okkly-font-family-sans)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
