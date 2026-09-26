import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyRating, OkklyRatingIcon } from "./Rating";
import type { RatingColor, RatingIcon, RatingPrecision, RatingSize } from "./Rating";

/** Every input the template below binds. */
type RatingArgs = {
  value: number | null;
  max: number;
  precision: RatingPrecision;
  size: RatingSize;
  color: RatingColor;
  icon: RatingIcon;
  readOnly: boolean;
  disabled: boolean;
  label?: string;
};

const column = "display: flex; flex-direction: column; gap: 16px; align-items: flex-start";

/**
 * Star (or heart) rating for reviews and feedback. Supports half steps, read-only display, and a trailing label.
 */
const meta: Meta<RatingArgs> = {
  title: "Control/Rating",
  component: OkklyRating,
  decorators: [moduleMetadata({ imports: [OkklyRating, OkklyRatingIcon] })],
  args: {
    value: 4,
    max: 5,
    precision: 0.5,
    size: "medium",
    color: "warning",
    icon: "star",
    readOnly: false,
    disabled: false,
  },
  argTypes: {
    color: {
      control: "select",
      options: ["warning", "primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    precision: { control: "inline-radio", options: [0.5, 1] },
    icon: { control: "inline-radio", options: ["star", "heart"] },
    value: { control: "number" },
    readOnly: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  parameters: {
    controls: {
      exclude: [
        "customIcon",
        "displayValue",
        "getLabelText",
        "glyphs",
        "hoverValue",
        "interactive",
        "modifiers",
        "name",
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-rating
        [(value)]="value"
        [max]="max"
        [precision]="precision"
        [size]="size"
        [color]="color"
        [icon]="icon"
        [readOnly]="readOnly"
        [disabled]="disabled"
        [label]="label"
      />`,
  }),
};

export default meta;
type Story = StoryObj<RatingArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows full.
 */
export const Full: Story = { args: { value: 5 } };

/**
 * This example shows half.
 */
export const Half: Story = { args: { value: 2.5 } };

/**
 * This example shows the empty state.
 */
export const Empty: Story = { args: { value: 0 } };

/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { value: 4.5, label: "4.8 · 128 reviews" },
};

/**
 * This example shows compact.
 */
export const Compact: Story = {
  args: { value: 5, max: 1, size: "small", label: "4.8" },
};

/**
 * This example shows hearts.
 */
export const Hearts: Story = {
  args: { value: 3.5, icon: "heart", color: "dante" },
};

/**
 * This example shows read only.
 */
export const ReadOnly: Story = { args: { value: 4, readOnly: true } };

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { value: 3, disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="${column}">
        <okkly-rating [value]="4" size="small" />
        <okkly-rating [value]="4" size="medium" />
        <okkly-rating [value]="4" size="large" />
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["warning", "primary", "dante"] },
    template: `
      <div style="${column}">
        @for (color of colors; track color) {
          <okkly-rating [value]="4" [color]="color" [icon]="color === 'dante' ? 'heart' : 'star'" />
        }
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    props: { score: 3 },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-rating [(value)]="score" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          Score: {{ score ?? "none" }}
        </p>
      </div>`,
  }),
};
