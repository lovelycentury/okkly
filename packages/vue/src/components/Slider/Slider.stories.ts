import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Slider from "./Slider.vue";
import type { SliderProps } from "./Slider.types";

type SliderArgs = SliderProps & { "aria-label"?: string };

/**
 * Continuous or discrete value along a track. Enable `discrete` with `step` for snapped marks.
 */
const meta: Meta<SliderArgs> = {
  title: "Control/Slider",
  component: Slider,
  args: {
    min: 0,
    max: 100,
    step: 1,
    size: "medium",
    color: "primary",
    disabled: false,
    orientation: "horizontal",
    valueLabelDisplay: "off",
    track: "normal",
    "aria-label": "Volume",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    valueLabelDisplay: { control: "inline-radio", options: ["auto", "on", "off"] },
    track: { control: "inline-radio", options: ["normal", "inverted", "none"] },
  },
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args }),
    template: `<Slider v-bind="args" />`,
  }),
};

export default meta;
type Story = StoryObj<SliderArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  args: { defaultValue: 40 },
};

/**
 * This example shows range.
 */
export const Range: Story = {
  args: { defaultValue: [25, 75], valueLabelDisplay: "auto" },
};

/**
 * This example shows marks.
 */
export const Marks: Story = {
  args: {
    defaultValue: 50,
    marks: [
      { value: 0, label: "0°C" },
      { value: 25, label: "25°C" },
      { value: 50, label: "50°C" },
      { value: 75, label: "75°C" },
      { value: 100, label: "100°C" },
    ],
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows discrete steps with marks.
 */
export const Discrete: Story = {
  args: {
    defaultValue: 30,
    discrete: true,
    step: 10,
    shiftStep: 30,
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows restricted values.
 */
export const RestrictedValues: Story = {
  name: "Restricted values",
  args: {
    defaultValue: 20,
    discrete: true,
    marks: [
      { value: 0, label: "0°C" },
      { value: 20, label: "20°C" },
      { value: 37, label: "37°C" },
      { value: 100, label: "100°C" },
    ],
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows vertical.
 */
export const Vertical: Story = {
  args: {
    defaultValue: 60,
    orientation: "vertical",
    valueLabelDisplay: "on",
  },
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args }),
    template: `<Slider v-bind="args" style="height: 12.5rem" />`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; width: 100%">
        <Slider
          v-for="color in colors"
          :key="color"
          :color="color"
          :default-value="55"
          :aria-label="color + ' slider'"
        />
      </div>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { defaultValue: 35, disabled: true },
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (controlled)",
  render: () => ({
    components: { Slider },
    setup() {
      const value = ref(30);
      return { value };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
        <Slider v-model="value" value-label-display="auto" aria-label="Brightness" />
        <span style="color: var(--okkly-text-secondary); font-size: 0.875rem">Value: {{ value }}</span>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; width: 100%">
        <Slider
          v-for="size in sizes"
          :key="size"
          :size="size"
          :default-value="50"
          :aria-label="size + ' slider'"
        />
      </div>`,
  }),
};
