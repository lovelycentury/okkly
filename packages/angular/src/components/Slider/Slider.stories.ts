import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklySlider } from "./Slider";
import type {
  SliderColor,
  SliderMark,
  SliderOrientation,
  SliderSize,
  SliderTrack,
  SliderValueLabelDisplay,
} from "./Slider";

/** Every input the template below binds. */
type SliderArgs = {
  value?: number | number[];
  min: number;
  max: number;
  step: number;
  marks?: boolean | SliderMark[];
  size: SliderSize;
  color: SliderColor;
  disabled: boolean;
  discrete?: boolean;
  shiftStep?: number;
  orientation: SliderOrientation;
  valueLabelDisplay: SliderValueLabelDisplay;
  track: SliderTrack;
};

const bindings = `
    [(value)]="value"
    [min]="min"
    [max]="max"
    [step]="step"
    [marks]="marks ?? false"
    [size]="size"
    [color]="color"
    [disabled]="disabled"
    [discrete]="discrete ?? false"
    [shiftStep]="shiftStep"
    [orientation]="orientation"
    [valueLabelDisplay]="valueLabelDisplay"
    [track]="track"
    aria-label="Volume"`;

const column = "display: flex; flex-direction: column; gap: 24px; width: 100%";

/**
 * Pick a number, or a range, along a track. Each thumb is a native `<input type="range">`,
 * so arrow keys, Page Up/Down, Home and End work out of the box — Shift multiplies the step.
 */
const meta: Meta<SliderArgs> = {
  title: "Control/Slider",
  component: OkklySlider,
  decorators: [moduleMetadata({ imports: [OkklySlider] })],
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
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    valueLabelDisplay: { control: "inline-radio", options: ["auto", "on", "off"] },
    track: { control: "inline-radio", options: ["normal", "inverted", "none"] },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    discrete: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  parameters: {
    controls: {
      exclude: [
        "activeThumbIndex",
        "ariaLabel",
        "axis",
        "focusedThumbIndex",
        "getAriaLabel",
        "getAriaValueText",
        "invertedTracks",
        "isDragging",
        "isRange",
        "marksList",
        "modifiers",
        "trackStyle",
        "valueLabelFormat",
        "values",
      ],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-slider${bindings} />` }),
};

export default meta;
type Story = StoryObj<SliderArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  args: { value: 40 },
};

/**
 * This example shows range.
 */
export const Range: Story = {
  args: { value: [25, 75], valueLabelDisplay: "auto" },
};

/**
 * This example shows marks.
 */
export const Marks: Story = {
  args: {
    value: 50,
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
    value: 30,
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
    value: 20,
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
    value: 60,
    orientation: "vertical",
    valueLabelDisplay: "on",
  },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="${column}">
        @for (color of colors; track color) {
          <okkly-slider [color]="color" [value]="55" [aria-label]="color + ' slider'" />
        }
      </div>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { value: 35, disabled: true },
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (controlled)",
  render: () => ({
    props: { brightness: 30 },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
        <okkly-slider [(value)]="brightness" valueLabelDisplay="auto" aria-label="Brightness" />
        <span style="color: var(--okkly-text-secondary); font-size: 0.875rem">Value: {{ brightness }}</span>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${column}">
        @for (size of sizes; track size) {
          <okkly-slider [size]="size" [value]="50" [aria-label]="size + ' slider'" />
        }
      </div>`,
  }),
};
