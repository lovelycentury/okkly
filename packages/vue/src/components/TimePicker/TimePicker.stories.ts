import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import TimePicker from "./TimePicker.vue";
import type { TimePickerColor, TimePickerProps, TimePickerValue } from "./TimePicker.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly TimePickerColor[];

function formatTime(value: TimePickerValue): string {
  return `${String(value.h).padStart(2, "0")}:${String(value.m).padStart(2, "0")}`;
}

/**
 * Scrollable time wheels for hours and minutes. Embed in popovers or custom picker layouts.
 */
const meta: Meta<TimePickerProps> = {
  title: "Control/TimePicker",
  component: TimePicker,
  args: {
    defaultValue: { h: 0, m: 0 },
    color: "primary",
    format: "24h",
  },
  argTypes: {
    color: { control: "select", options: COLORS },
    format: { control: "inline-radio", options: ["24h", "12h"] },
  },
};

export default meta;
type Story = StoryObj<TimePickerProps>;

/**
 * This example shows the default state.
 */
export const Playground: Story = {};

/**
 * This example shows twelve hour format.
 */
export const TwelveHourFormat: Story = {
  name: "12h format (adds an AM/PM wheel)",
  args: { format: "12h", defaultValue: { h: 14, m: 30 } },
};

/**
 * This example shows step fifteen minutes.
 */
export const StepFifteenMinutes: Story = {
  name: "15-minute step",
  args: { step: 15, defaultValue: { h: 9, m: 30 } },
};

/**
 * This example shows dante.
 */
export const Dante: Story = { args: { color: "dante", defaultValue: { h: 18, m: 5 } } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { TimePicker },
    setup: () => ({ colors: COLORS }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <TimePicker v-for="color in colors" :key="color" :color="color" :default-value="{ h: 8, m: 0 }" />
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (drag or use arrow keys)",
  render: () => ({
    components: { TimePicker },
    setup() {
      const value = ref<TimePickerValue>({ h: 9, m: 30 });
      return { value, formatTime };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <TimePicker v-model="value" format="12h" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          Selected: {{ formatTime(value) }} — drag a wheel, or focus it and use ↑/↓/Home/End.
        </p>
      </div>`,
  }),
};
