import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import DateTimeField from "./DateTimeField.vue";
import type { DateTimeFieldProps } from "./DateTimeField.types";

/** `label`/`helperText` fill the matching slots; everything else is a prop. */
type DateTimeFieldArgs = DateTimeFieldProps & {
  label?: string;
  helperText?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: DateTimeFieldArgs) => ({
  components: { DateTimeField },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <DateTimeField v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </DateTimeField>`,
});

/**
 * Masked date-and-time input with a combined picker. Use when both halves of the value matter equally.
 */
const meta: Meta<DateTimeFieldArgs> = {
  title: "Control/DateTimeField",
  component: DateTimeField,
  args: {
    label: "Date & time",
    helperText: "Pick a date and time",
    size: "medium",
    color: "primary",
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
  },
  render,
};

export default meta;
type Story = StoryObj<DateTimeFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    error: true,
    helperText: "Enter a valid date and time",
    defaultValue: new Date(2024, 7, 12, 14, 30),
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2024, 7, 12, 14, 30) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { DateTimeField },
    setup: () => ({
      sizes: ["small", "medium", "large"] as const,
      defaultValue: new Date(2024, 7, 12, 14, 30),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <DateTimeField v-for="size in sizes" :key="size" :size="size" :default-value="defaultValue">
          <template #label>Date & time ({{ size }})</template>
        </DateTimeField>
      </div>`,
  }),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { DateTimeField },
    setup() {
      const value = ref<Date | null>(new Date(2024, 7, 12, 14, 30));
      return { value };
    },
    template: `
      <DateTimeField v-model="value">
        <template #label>Date & time</template>
        <template #helper-text>{{ value ? value.toLocaleString() : "No date" }}</template>
      </DateTimeField>`,
  }),
};
