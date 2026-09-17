import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import DateField from "./DateField.vue";
import type { DateFieldProps } from "./DateField.types";

/** `label`/`helperText` fill the matching slots; everything else is a prop. */
type DateFieldArgs = DateFieldProps & {
  label?: string;
  helperText?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: DateFieldArgs) => ({
  components: { DateField },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <DateField v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </DateField>`,
});

/**
 * Masked date input with an optional calendar popover. Format is fixed to the design's day.month.year pattern.
 */
const meta: Meta<DateFieldArgs> = {
  title: "Control/DateField",
  component: DateField,
  args: {
    label: "Date",
    helperText: "Pick a date",
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
type Story = StoryObj<DateFieldArgs>;

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
  args: { error: true, helperText: "Enter a valid date", defaultValue: new Date(2024, 7, 12) },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2024, 7, 12) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { DateField },
    setup: () => ({
      sizes: ["small", "medium", "large"] as const,
      defaultValue: new Date(2024, 7, 12),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <DateField v-for="size in sizes" :key="size" :size="size" :default-value="defaultValue">
          <template #label>Date ({{ size }})</template>
        </DateField>
      </div>`,
  }),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { DateField },
    setup() {
      const value = ref<Date | null>(new Date(2024, 7, 12));
      return { value };
    },
    template: `
      <DateField v-model="value">
        <template #label>Date</template>
        <template #helper-text>{{ value ? value.toDateString() : "No date" }}</template>
      </DateField>`,
  }),
};
