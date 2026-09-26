import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyTimePicker } from "./TimePicker";
import type { TimePickerColor, TimePickerFormat, TimePickerValue } from "./TimePicker";

/** Every input the template below binds. */
type TimePickerArgs = {
  value?: TimePickerValue;
  step: number;
  format: TimePickerFormat;
  color: TimePickerColor;
};

const bindings = `
    [(value)]="value"
    [step]="step"
    [format]="format"
    [color]="color"`;

const row = "display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px";

/**
 * An always-visible inline time picker — plain scrollable columns for hours,
 * minutes and (in `format="12h"`) AM/PM, built on native scroll-snap rather
 * than a drag library.
 */
const meta: Meta<TimePickerArgs> = {
  title: "Control/TimePicker",
  component: OkklyTimePicker,
  decorators: [moduleMetadata({ imports: [OkklyTimePicker] })],
  args: {
    step: 1,
    format: "24h",
    color: "primary",
  },
  argTypes: {
    format: { control: "inline-radio", options: ["24h", "12h"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
  },
  parameters: {
    controls: {
      exclude: ["hoursAriaLabel", "minutesAriaLabel", "meridiemAriaLabel"],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-time-picker${bindings} />` }),
};

export default meta;
type Story = StoryObj<TimePickerArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  args: { value: { h: 9, m: 30 } },
};

/**
 * This example shows the 12-hour format with the AM/PM column.
 */
export const TwelveHour: Story = {
  name: "12-hour format",
  args: { value: { h: 14, m: 15 }, format: "12h" },
};

/**
 * This example shows a coarser minute step.
 */
export const CustomStep: Story = {
  name: "Custom step",
  args: { value: { h: 12, m: 0 }, step: 15 },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="${row}">
        @for (color of colors; track color) {
          <okkly-time-picker [color]="color" [value]="{ h: 9, m: 30 }" />
        }
      </div>`,
  }),
};

/**
 * This example shows an time picker whose value lives entirely in the parent.
 */
export const Controlled: Story = {
  render: () => ({
    props: { time: { h: 9, m: 30 } },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-time-picker [(value)]="time" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ time.h }}:{{ time.m < 10 ? '0' + time.m : time.m }}
        </p>
      </div>`,
  }),
};

/**
 * This example overrides the picker's own `--okkly-time-picker-*` variables inline.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: {},
    template: `
      <okkly-time-picker
        [value]="{ h: 9, m: 30 }"
        style="--okkly-time-picker-border-radius: 0.5rem; --okkly-time-picker-rows-visible: 4"
      />`,
  }),
};
