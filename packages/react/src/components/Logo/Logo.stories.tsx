import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "./Logo";

/**
 * Static brand lockup. Choose layout for nav (`compact`), headers (`horizontal`), or stacked
 * mobile placements, and `variant` for the container treatment: filled disc, outlined ring, or
 * the bare glyph.
 */
const meta: Meta<typeof Logo> = {
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
    tone: {
      control: "select",
      options: ["multi", "mint", "indigo", "dante", "violet", "ember"],
    },
  },
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Logo {...args} />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

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
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <Logo layout="compact" />
      <Logo layout="horizontal" />
      <Logo layout="stacked" />
    </div>
  ),
};

/**
 * This example shows variants.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <Logo variant="filled" layout="stacked" label="filled" />
      <Logo variant="outlined" layout="stacked" label="outlined" />
      <Logo variant="pure" layout="stacked" label="pure" />
    </div>
  ),
};

/**
 * This example shows tones.
 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>
      <Logo tone="multi" layout="stacked" />
      {(["mint", "indigo", "dante", "violet", "ember"] as const).map((tone) => (
        <Logo key={tone} tone={tone} layout="stacked" />
      ))}
      {(["mint", "indigo", "dante", "violet", "ember"] as const).map((tone) => (
        <Logo key={`${tone}-outlined`} tone={tone} variant="outlined" layout="stacked" />
      ))}
    </div>
  ),
};

/**
 * This example shows header context.
 */
export const HeaderContext: Story = {
  name: "In a header (compact)",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderRadius: "12px",
        background: "var(--okkly-bg-inset)",
        border: "1px solid var(--okkly-border-subtle)",
        width: "480px",
      }}
    >
      <Logo layout="compact" />
      <div
        style={{
          display: "flex",
          gap: "20px",
          fontSize: "13px",
          color: "var(--okkly-text-secondary)",
        }}
      >
        <span>Showcase</span>
        <span style={{ color: "var(--okkly-text-muted)" }}>Specs</span>
        <span style={{ color: "var(--okkly-text-muted)" }}>Guidelines</span>
      </div>
    </div>
  ),
};
