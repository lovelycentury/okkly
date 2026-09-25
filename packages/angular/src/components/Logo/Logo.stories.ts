import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyLogo } from "./Logo";
import type { LogoLayout, LogoTone, LogoVariant } from "./Logo";

/** Every input the template below binds. */
type LogoArgs = {
  layout: LogoLayout;
  variant: LogoVariant;
  tone: LogoTone;
  label: string;
  showLabel: boolean;
  size?: number | string;
};

const row = "display: flex; align-items: center; gap: 32px";

/**
 * Static brand lockup. Choose layout for nav (`compact`), headers (`horizontal`), or stacked
 * mobile placements, and `variant` for the container treatment: filled disc, outlined ring, or
 * the bare glyph.
 */
const meta: Meta<LogoArgs> = {
  title: "Brand/Logo",
  component: OkklyLogo,
  decorators: [moduleMetadata({ imports: [OkklyLogo] })],
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
    showLabel: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    size: { control: "text" },
  },
  parameters: {
    layout: "fullscreen",
    controls: {
      exclude: [
        "emblemSize",
        "glyphStroke",
        "glyphStrokeWidth",
        "gradientId",
        "ink",
        "isMulti",
        "modifiers",
        "ringRadius",
        "stroke",
        "vb",
        "viewBox",
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%">
        <okkly-logo [layout]="layout" [variant]="variant" [tone]="tone" [label]="label" [showLabel]="showLabel" [size]="size" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<LogoArgs>;

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
    template: `
      <div style="${row}">
        <okkly-logo layout="compact" />
        <okkly-logo layout="horizontal" />
        <okkly-logo layout="stacked" />
      </div>`,
  }),
};

/**
 * This example shows variants.
 */
export const Variants: Story = {
  render: () => ({
    template: `
      <div style="${row}">
        <okkly-logo variant="filled" layout="stacked" label="filled" />
        <okkly-logo variant="outlined" layout="stacked" label="outlined" />
        <okkly-logo variant="pure" layout="stacked" label="pure" />
      </div>`,
  }),
};

/**
 * This example shows tones.
 */
export const Tones: Story = {
  render: () => ({
    props: { tones: ["mint", "indigo", "dante", "violet", "ember"] },
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
        <okkly-logo tone="multi" layout="stacked" />
        @for (tone of tones; track tone) {
          <okkly-logo [tone]="tone" layout="stacked" />
        }
        @for (tone of tones; track tone) {
          <okkly-logo [tone]="tone" variant="outlined" layout="stacked" />
        }
      </div>`,
  }),
};

/**
 * This example shows header context.
 */
export const HeaderContext: Story = {
  name: "In a header (compact)",
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-radius: 12px; background: var(--okkly-bg-inset); border: 1px solid var(--okkly-border-subtle); width: 480px">
        <okkly-logo layout="compact" />
        <div style="display: flex; gap: 20px; font-size: 13px; color: var(--okkly-text-secondary)">
          <span>Showcase</span>
          <span style="color: var(--okkly-text-muted)">Specs</span>
          <span style="color: var(--okkly-text-muted)">Guidelines</span>
        </div>
      </div>`,
  }),
};
