import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import DateTimePicker from "./DateTimePicker.vue";
import Chip from "../Chip/Chip.vue";
import type { DateTimePickerColor, DateTimePickerProps } from "./DateTimePicker.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly DateTimePickerColor[];

// Fixed reference date so the visuals match the source design 1:1.
const demoValue = new Date(2024, 10, 8, 0, 0);

/**
 * Standalone date-and-time picker surface without the field chrome — embed in custom layouts or popovers.
 */
const meta: Meta<DateTimePickerProps> = {
  title: "Control/DateTimePicker",
  component: DateTimePicker,
  args: {
    weekStart: "mon",
    color: "primary",
    format: "24h",
  },
  argTypes: {
    color: { control: "select", options: COLORS },
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    format: { control: "inline-radio", options: ["24h", "12h"] },
  },
};

export default meta;
type Story = StoryObj<DateTimePickerProps>;

/**
 * This example shows the default state.
 */
export const Playground: Story = {
  args: { defaultValue: demoValue },
};

/**
 * This example shows no selection.
 */
export const NoSelection: Story = { name: "Empty (no date picked)", args: {} };

/**
 * This example shows twelve hour format.
 */
export const TwelveHourFormat: Story = {
  args: { defaultValue: new Date(2024, 10, 8, 14, 30), format: "12h" },
};

/**
 * This example shows step fifteen minutes.
 */
export const StepFifteenMinutes: Story = {
  name: "15-minute step",
  args: { defaultValue: demoValue, timeStep: 15 },
};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: { color: "dante", defaultValue: demoValue },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { DateTimePicker },
    setup: () => ({ colors: COLORS, demoValue }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <DateTimePicker v-for="color in colors" :key="color" :color="color" :default-value="demoValue" />
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (pick a date & time, then Confirm)",
  render: () => ({
    components: { DateTimePicker },
    setup() {
      const value = ref<Date | null>(null);
      const confirmed = ref<Date | null>(null);
      return { value, confirmed };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <DateTimePicker v-model="value" @confirm="confirmed = $event">
          <template #timezone-label>GMT+2</template>
        </DateTimePicker>
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ confirmed ? \`Confirmed: \${confirmed.toLocaleString()}\` : "Pick a day, dial in a time, then click Confirm — the draft updates live, Confirm locks it in." }}
        </p>
      </div>`,
  }),
};

/**
 * There is no shortcut-preset API. A preset is one line against `v-model`, and a
 * built-in sidebar cost more than it saved.
 */
export const Presets: Story = {
  name: "Shortcut presets, from the outside",
  render: () => ({
    components: { DateTimePicker, Chip },
    setup() {
      const value = ref<Date | null>(demoValue);
      const presets: Array<[string, Date]> = [
        ["Morning", new Date(2024, 10, 8, 9, 0)],
        ["Noon", new Date(2024, 10, 8, 12, 0)],
        ["Evening", new Date(2024, 10, 8, 18, 30)],
      ];
      return { value, presets };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <div style="display: flex; gap: 8px">
          <Chip
            v-for="[label, date] in presets"
            :key="label"
            size="small"
            :selected="value?.getTime() === date.getTime()"
            @click="value = date"
          >{{ label }}</Chip>
        </div>
        <DateTimePicker v-model="value">
          <template #timezone-label>GMT+2</template>
        </DateTimePicker>
      </div>`,
  }),
};
