import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import TimeField from "./TimeField.vue";
import type { TimeFieldProps } from "./TimeField.types";

/** `label`/`helperText` fill the matching slots; everything else is a prop. */
type TimeFieldArgs = TimeFieldProps & {
  label?: string;
  helperText?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: TimeFieldArgs) => ({
  components: { TimeField },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <TimeField v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </TimeField>`,
});

function timeAt(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Masked time input with an optional time popover. 24h or 12h depending on locale settings.
 */
const meta: Meta<TimeFieldArgs> = {
  title: "Control/TimeField",
  component: TimeField,
  args: {
    label: "Time",
    helperText: "Pick a time",
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
type Story = StoryObj<TimeFieldArgs>;

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
  args: { error: true, helperText: "Enter a valid time", defaultValue: timeAt(14, 30) },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: timeAt(14, 30) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { TimeField },
    setup: () => ({ sizes: ["small", "medium", "large"] as const, defaultValue: timeAt(9, 15) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <TimeField v-for="size in sizes" :key="size" :size="size" :default-value="defaultValue">
          <template #label>Time ({{ size }})</template>
        </TimeField>
      </div>`,
  }),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { TimeField },
    setup() {
      const value = ref<Date | null>(timeAt(14, 30));
      return { value };
    },
    template: `
      <TimeField v-model="value">
        <template #label>Time</template>
        <template #helper-text>
          {{ value ? String(value.getHours()).padStart(2, "0") + ":" + String(value.getMinutes()).padStart(2, "0") : "No time" }}
        </template>
      </TimeField>`,
  }),
};
