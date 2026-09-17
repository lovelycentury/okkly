import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import NumberInput from "./NumberInput.vue";
import type { NumberInputProps } from "./NumberInput.types";

/** `label`/`helperText` fill the matching slots; everything else is a prop. */
type NumberInputArgs = NumberInputProps & {
  label?: string;
  helperText?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: NumberInputArgs) => ({
  components: { NumberInput },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <NumberInput v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </NumberInput>`,
});

/**
 * Numeric text field with steppers. Prefer over TextField when min/max/step matter and values stay numeric.
 */
const meta: Meta<NumberInputArgs> = {
  title: "Control/NumberInput",
  component: NumberInput,
  args: {
    label: "Quantity",
    defaultValue: 12,
    helperText: "Between 1 and 99",
    size: "medium",
    color: "primary",
    controls: "stepper",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    required: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — the field's label." },
    helperText: { control: "text", description: "`helper-text` slot — text below the field." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    controls: { control: "inline-radio", options: ["stepper", "chevrons"] },
  },
  render,
};

export default meta;
type Story = StoryObj<NumberInputArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows chevrons.
 */
export const Chevrons: Story = {
  args: { controls: "chevrons" },
};

/**
 * This example shows with min max.
 */
export const WithMinMax: Story = {
  args: { min: 1, max: 99, defaultValue: 12, helperText: "Between 1 and 99" },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { error: true, helperText: "Must be 1–99", defaultValue: 120, min: 1, max: 99 },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { NumberInput },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <NumberInput v-for="size in sizes" :key="size" :size="size" :default-value="12">
          <template #label>Quantity</template>
          <template #helper-text>Between 1 and 99</template>
        </NumberInput>
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    components: { NumberInput },
    setup() {
      const value = ref<number | null>(12);
      return { value };
    },
    template: `
      <NumberInput v-model="value" :min="1" :max="99">
        <template #label>Quantity</template>
        <template #helper-text>Current value: {{ value === null ? "empty" : value }}</template>
      </NumberInput>`,
  }),
};
