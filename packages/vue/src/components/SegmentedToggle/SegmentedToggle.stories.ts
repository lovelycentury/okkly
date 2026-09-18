import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import SegmentedToggle from "./SegmentedToggle.vue";
import type {
  SegmentedToggleColor,
  SegmentedToggleItem,
  SegmentedToggleProps,
} from "./SegmentedToggle.types";

/** Icons from `@okkly/icons`, inlined so the stories pull in no build-time import. */
const boldIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H6z" /><path d="M6 4h7a4 4 0 0 1 0 8H6z" /></svg>`;
const italicIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>`;
const underlineIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="20" x2="20" y2="20" /></svg>`;
const listIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>`;
const gridIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>`;
const calendarIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>`;

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SegmentedToggleColor[];

const RANGE_ITEMS: SegmentedToggleItem[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

/** `modelValue` is the `v-model`; everything else is a prop. */
type SegmentedToggleArgs = SegmentedToggleProps & { modelValue?: string | string[] };

/**
 * Exclusive segments in one control — view modes, filters, or short option sets.
 */
const meta: Meta<SegmentedToggleArgs> = {
  title: "Control/SegmentedToggle",
  component: SegmentedToggle,
  args: {
    items: RANGE_ITEMS,
    modelValue: "week",
    exclusive: true,
    color: "primary",
    disabled: false,
  },
  argTypes: {
    modelValue: { control: false },
    color: { control: "select", options: COLORS },
    items: { control: false },
  },
};

export default meta;
type Story = StoryObj<SegmentedToggleArgs>;

/**
 * This example shows range.
 */
export const Range: Story = {};

/**
 * This example shows view picker.
 */
export const ViewPicker: Story = {
  args: {
    modelValue: "list",
    items: [
      { label: "List", value: "list", icon: listIcon },
      { label: "Board", value: "board", icon: gridIcon },
      { label: "Calendar", value: "calendar", icon: calendarIcon },
    ],
  },
};

/**
 * This example shows icon only.
 */
export const IconOnly: Story = {
  args: {
    modelValue: "grid",
    items: [
      { value: "grid", icon: gridIcon },
      { value: "list", icon: listIcon },
    ],
  },
};

/**
 * This example shows multi select.
 */
export const MultiSelect: Story = {
  name: "Toggle group (multi)",
  args: {
    exclusive: false,
    modelValue: ["bold", "italic"],
    items: [
      { value: "bold", icon: boldIcon },
      { value: "italic", icon: italicIcon },
      { value: "underline", icon: underlineIcon },
    ],
  },
};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: {
    color: "dante",
    modelValue: "week",
    items: RANGE_ITEMS,
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { SegmentedToggle },
    setup: () => ({ colors: COLORS, items: RANGE_ITEMS }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <SegmentedToggle v-for="color in colors" :key="color" :color="color" model-value="week" :items="items" />
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    components: { SegmentedToggle },
    setup() {
      const value = ref("week");
      return { value, items: RANGE_ITEMS };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <SegmentedToggle color="dante" :items="items" v-model="value" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          Selected: {{ value }}
        </p>
      </div>`,
  }),
};

/**
 * This example shows interactive multi.
 */
export const InteractiveMulti: Story = {
  name: "Interactive (multi)",
  render: () => ({
    components: { SegmentedToggle },
    setup() {
      const value = ref<string[]>(["bold"]);
      const items: SegmentedToggleItem[] = [
        { value: "bold", icon: boldIcon },
        { value: "italic", icon: italicIcon },
        { value: "underline", icon: underlineIcon },
      ];
      return { value, items };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <SegmentedToggle :exclusive="false" v-model="value" :items="items" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          Active: {{ value.join(", ") || "none" }}
        </p>
      </div>`,
  }),
};
