import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Logo from "./Logo.vue";
import type { LogoProps, LogoTone } from "./Logo.types";

/**
 * Static brand lockup. Choose layout for nav (`compact`), headers (`horizontal`), or stacked
 * mobile placements, and `variant` for the container treatment: filled disc, outlined ring, or
 * the bare glyph.
 */
const meta: Meta<LogoProps> = {
  title: "Brand/Logo",
  component: Logo,
  args: {
    layout: "horizontal",
    variant: "filled",
    tone: "multi",
    label: "okkly",
    showLabel: true,
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["compact", "horizontal", "stacked"] },
    variant: { control: "inline-radio", options: ["filled", "outlined", "pure"] },
    tone: { control: "select", options: ["multi", "mint", "indigo", "dante", "violet", "ember"] },
  },
  render: (args) => ({
    components: { Logo },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%">
        <Logo v-bind="args" />
      </div>`,
  }),
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<LogoProps>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows compact.
 */
export const Compact: Story = { args: { layout: "compact" } };
/**
 * This example shows stacked.
 */
export const Stacked: Story = { args: { layout: "stacked" } };
/**
 * This example shows emblem only.
 */
export const EmblemOnly: Story = { name: "Emblem only", args: { showLabel: false } };

/**
 * This example shows layouts.
 */
export const Layouts: Story = {
  render: () => ({
    components: { Logo },
    template: `
      <div style="display: flex; align-items: center; gap: 32px">
        <Logo layout="compact" />
        <Logo layout="horizontal" />
        <Logo layout="stacked" />
      </div>`,
  }),
};

/**
 * This example shows variants.
 */
export const Variants: Story = {
  render: () => ({
    components: { Logo },
    template: `
      <div style="display: flex; align-items: center; gap: 32px">
        <Logo variant="filled" layout="stacked" label="filled" />
        <Logo variant="outlined" layout="stacked" label="outlined" />
        <Logo variant="pure" layout="stacked" label="pure" />
      </div>`,
  }),
};

/**
 * This example shows tones.
 */
export const Tones: Story = {
  render: () => ({
    components: { Logo },
    setup: () => ({ tones: ["mint", "indigo", "dante", "violet", "ember"] as LogoTone[] }),
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
        <Logo tone="multi" layout="stacked" />
        <Logo v-for="tone in tones" :key="tone" :tone="tone" layout="stacked" />
        <Logo v-for="tone in tones" :key="\`\${tone}-outlined\`" :tone="tone" variant="outlined" layout="stacked" />
      </div>`,
  }),
};

/**
 * This example shows header context.
 */
export const HeaderContext: Story = {
  name: "In a header (compact)",
  render: () => ({
    components: { Logo },
    template: `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-radius: 12px; background: var(--okkly-bg-inset); border: 1px solid var(--okkly-border-subtle); width: 480px">
        <Logo layout="compact" />
        <div style="display: flex; gap: 20px; font-size: 13px; color: var(--okkly-text-secondary)">
          <span>Showcase</span>
          <span style="color: var(--okkly-text-muted)">Specs</span>
          <span style="color: var(--okkly-text-muted)">Guidelines</span>
        </div>
      </div>`,
  }),
};
