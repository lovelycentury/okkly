import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Rating from "./Rating.vue";
import type { RatingColor, RatingProps } from "./Rating.types";

/** `label` fills the `label` slot, `modelValue` is the `v-model`; everything else is a prop. */
type RatingArgs = RatingProps & {
  label?: string;
  modelValue?: number | null;
};

/**
 * Renders the component with `label` split back out of the args, so it
 * lands in the `label` slot instead of falling through as an attribute.
 */
const render = (args: RatingArgs) => ({
  components: { Rating },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <Rating v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
    </Rating>`,
});

/**
 * Star (or custom glyph) scale for scores. Support half-steps with `precision` when the data allows it.
 */
const meta: Meta<RatingArgs> = {
  title: "Control/Rating",
  component: Rating,
  args: {
    modelValue: 4,
    max: 5,
    precision: 0.5,
    size: "medium",
    color: "warning",
    icon: "star",
    readOnly: false,
    disabled: false,
  },
  argTypes: {
    modelValue: { control: "number", description: "`v-model` — the current score." },
    color: {
      control: "select",
      options: ["warning", "primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    precision: { control: "inline-radio", options: [0.5, 1] },
    icon: { control: "inline-radio", options: ["star", "heart"] },
  },
  render,
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
export const Full: Story = { args: { modelValue: 5 } };

/**
 * This example shows half.
 */
export const Half: Story = { args: { modelValue: 2.5 } };

/**
 * This example shows the empty state.
 */
export const Empty: Story = { args: { modelValue: 0 } };

/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { modelValue: 4.5, label: "4.8 · 128 reviews" },
};

/**
 * This example shows compact.
 */
export const Compact: Story = {
  args: { modelValue: 5, max: 1, size: "small", label: "4.8" },
};

/**
 * This example shows hearts.
 */
export const Hearts: Story = {
  args: { modelValue: 3.5, icon: "heart", color: "dante" },
};

/**
 * This example shows read only.
 */
export const ReadOnly: Story = { args: { modelValue: 4, readOnly: true } };

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { modelValue: 3, disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Rating },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <Rating :model-value="4" size="small" />
        <Rating :model-value="4" size="medium" />
        <Rating :model-value="4" size="large" />
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Rating },
    setup: () => ({
      colors: ["warning", "primary", "dante"] as const satisfies readonly RatingColor[],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <Rating
          v-for="color in colors"
          :key="color"
          :model-value="4"
          :color="color"
          :icon="color === 'dante' ? 'heart' : 'star'"
        />
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref<number | null>(3);
      return { value };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <Rating v-model="value" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          Score: {{ value ?? "none" }}
        </p>
      </div>`,
  }),
};
