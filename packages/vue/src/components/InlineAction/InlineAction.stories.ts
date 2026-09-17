import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineAction from "./InlineAction.vue";
import type { InlineActionColor, InlineActionProps } from "./InlineAction.types";

/** `modelValue` is the `v-model`; everything else is a prop. */
type InlineActionArgs = InlineActionProps & { modelValue?: string };

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
] as const satisfies readonly InlineActionColor[];

/**
 * Compact text/icon control for table rows and cards — loading, success, and error states without a full Button.
 */
const meta: Meta<InlineActionArgs> = {
  title: "Control/InlineAction",
  component: InlineAction,
  args: {
    placeholder: "you@company.com",
    action: "Copy",
    size: "medium",
    fill: "filled",
    state: "default",
  },
  argTypes: {
    modelValue: { control: "text", description: "`v-model` — the input's value." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    fill: { control: "select", options: ["filled", "soft", "outline", "gradient", "glass"] },
    color: { control: "select", options: [undefined, ...COLORS] },
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
  },
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
export const Hover: Story = { args: { state: "hover", modelValue: "you@company.com" } };
/**
 * This example shows focus.
 */
export const Focus: Story = { args: { state: "focus", modelValue: "you@company.com" } };
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { modelValue: "hello@oleksii.dev" } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = {
  args: {
    state: "loading",
    modelValue: "hello@oleksii.dev",
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
    modelValue: "hello@oleksii.dev",
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
    modelValue: "hello@oleksii.dev",
    action: "Retry",
    message: "That address doesn't look right",
  },
};
/**
 * This example shows readonly.
 */
export const Readonly: Story = { args: { readonly: true, modelValue: "hello@oleksii.dev" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, modelValue: "hello@oleksii.dev" } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { InlineAction },
    setup: () => ({ colors: COLORS }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <InlineAction v-for="color in colors" :key="color" :color="color" model-value="hello@oleksii.dev" />
      </div>`,
  }),
};

/**
 * This example shows fills.
 */
export const Fills: Story = {
  render: () => ({
    components: { InlineAction },
    setup: () => ({ fills: ["filled", "soft", "outline", "gradient", "glass"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <InlineAction v-for="fill in fills" :key="fill" :fill="fill" color="dante" model-value="hello@oleksii.dev" />
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { InlineAction },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <InlineAction v-for="size in sizes" :key="size" :size="size" model-value="hello@oleksii.dev" />
      </div>`,
  }),
};

// Demonstrates the CSS-only "section tone" inheritance — no color prop set,
// each InlineAction picks up --okkly-section-tone from its wrapper.
/**
 * This example shows section tone.
 */
export const SectionTone: Story = {
  render: () => ({
    components: { InlineAction },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div style="--okkly-section-tone: var(--okkly-accent-ice)">
          <InlineAction model-value="hello@oleksii.dev" />
        </div>
        <div style="--okkly-section-tone: var(--okkly-accent-dante)">
          <InlineAction model-value="hello@oleksii.dev" />
        </div>
      </div>`,
  }),
};
