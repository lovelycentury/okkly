import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyInlineAction, OkklyInlineActionIcon } from "./InlineAction";
import type {
  InlineActionColor,
  InlineActionFill,
  InlineActionSize,
  InlineActionState,
} from "./InlineAction";

/** Every input the template below binds. */
type InlineActionArgs = {
  value: string;
  placeholder?: string;
  action: string;
  size: InlineActionSize;
  color?: InlineActionColor;
  fill: InlineActionFill;
  message?: string;
  state: InlineActionState;
  readonly: boolean;
  loading: boolean;
  disabled: boolean;
};

const column = "display: flex; flex-direction: column; gap: 16px";

/**
 * Compact text/icon control for table rows and cards — loading, success, and error states without a full Button.
 */
const meta: Meta<InlineActionArgs> = {
  title: "Control/InlineAction",
  component: OkklyInlineAction,
  decorators: [moduleMetadata({ imports: [OkklyInlineAction, OkklyInlineActionIcon] })],
  args: {
    value: "",
    placeholder: "you@company.com",
    action: "Copy",
    size: "medium",
    fill: "filled",
    state: "default",
    readonly: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    fill: { control: "select", options: ["filled", "soft", "outline", "gradient", "glass"] },
    color: {
      control: "select",
      options: [
        undefined,
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    state: {
      control: "select",
      options: [
        "default",
        "hover",
        "focus",
        "filled",
        "loading",
        "success",
        "error",
        "readonly",
        "disabled",
      ],
    },
    readonly: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    loading: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  parameters: {
    controls: {
      exclude: [
        "effectiveState",
        "hasCustomIcon",
        "inputId",
        "isLocked",
        "isReadOnly",
        "messageId",
        "modifiers",
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-inline-action
        [(value)]="value"
        [placeholder]="placeholder"
        [action]="action"
        [size]="size"
        [color]="color"
        [fill]="fill"
        [message]="message"
        [state]="state"
        [readonly]="readonly"
        [loading]="loading"
        [disabled]="disabled"
        aria-label="Email address"
      />`,
  }),
};

export default meta;
type Story = StoryObj<InlineActionArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows hover.
 */
export const Hover: Story = { args: { state: "hover", value: "you@company.com" } };
/**
 * This example shows focus.
 */
export const Focus: Story = { args: { state: "focus", value: "you@company.com" } };
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: "hello@oleksii.dev" } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = {
  args: {
    state: "loading",
    value: "hello@oleksii.dev",
    action: "Sending…",
    message: "Talking to the server…",
  },
};
/**
 * This example shows success.
 */
export const Success: Story = {
  args: {
    state: "success",
    value: "hello@oleksii.dev",
    action: "Copied",
    message: "Copied to clipboard",
  },
};
/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    state: "error",
    value: "hello@oleksii.dev",
    action: "Retry",
    message: "That address doesn't look right",
  },
};
/**
 * This example shows readonly.
 */
export const Readonly: Story = { args: { readonly: true, value: "hello@oleksii.dev" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, value: "hello@oleksii.dev" } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: {
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    template: `
      <div style="${column}">
        @for (color of colors; track color) {
          <okkly-inline-action [color]="color" value="hello@oleksii.dev" [aria-label]="'Email (' + color + ')'" />
        }
      </div>`,
  }),
};

/**
 * This example shows fills.
 */
export const Fills: Story = {
  render: () => ({
    props: { fills: ["filled", "soft", "outline", "gradient", "glass"] },
    template: `
      <div style="${column}">
        @for (fill of fills; track fill) {
          <okkly-inline-action [fill]="fill" color="dante" value="hello@oleksii.dev" [aria-label]="'Email (' + fill + ')'" />
        }
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${column}">
        @for (size of sizes; track size) {
          <okkly-inline-action [size]="size" value="hello@oleksii.dev" [aria-label]="'Email (' + size + ')'" />
        }
      </div>`,
  }),
};

// Demonstrates the CSS-only "section tone" inheritance — no color input set,
// each InlineAction picks up --okkly-section-tone from its wrapper.
/**
 * This example shows section tone.
 */
export const SectionTone: Story = {
  render: () => ({
    template: `
      <div style="${column}">
        <div style="--okkly-section-tone: var(--okkly-accent-ice)">
          <okkly-inline-action value="hello@oleksii.dev" aria-label="Email (ice)" />
        </div>
        <div style="--okkly-section-tone: var(--okkly-accent-dante)">
          <okkly-inline-action value="hello@oleksii.dev" aria-label="Email (dante)" />
        </div>
      </div>`,
  }),
};
