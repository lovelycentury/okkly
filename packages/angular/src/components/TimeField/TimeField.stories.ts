import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyTimeField } from "./TimeField";
import type { TimeFieldColor, TimeFieldSize } from "./TimeField";

function timeAt(h: number, m: number): Date {
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

/** Every input the template below binds. */
type TimeFieldArgs = {
  value: Date | null;
  label: string;
  placeholder: string;
  size: TimeFieldSize;
  color: TimeFieldColor;
  error: boolean;
  helperText?: string;
  disabled: boolean;
  fullWidth: boolean;
  required: boolean;
};

const bindings = `
    [(value)]="value"
    [label]="label"
    [placeholder]="placeholder"
    [size]="size"
    [color]="color"
    [error]="error"
    [helperText]="helperText"
    [disabled]="disabled"
    [fullWidth]="fullWidth"
    [required]="required"`;

/**
 * Masked time input with an optional time popover.
 */
const meta: Meta<TimeFieldArgs> = {
  title: "Control/TimeField",
  component: OkklyTimeField,
  decorators: [moduleMetadata({ imports: [OkklyTimeField] })],
  args: {
    value: null,
    label: "Time",
    placeholder: "HH:mm",
    size: "medium",
    color: "primary",
    error: false,
    helperText: "Pick a time",
    disabled: false,
    fullWidth: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
  },
  parameters: {
    controls: {
      exclude: ["change", "open", "min", "max", "id"],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-time-field${bindings} />` }),
};

export default meta;
type Story = StoryObj<TimeFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: timeAt(9, 30) } };

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows the error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: { error: true, helperText: "Enter a valid time", value: timeAt(14, 30) },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, value: timeAt(14, 30) } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"], value: timeAt(9, 15) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (size of sizes; track size) {
          <okkly-time-field [size]="size" [label]="'Time (' + size + ')'" [value]="value" />
        }
      </div>`,
  }),
};

/**
 * This example shows a time field whose value lives entirely in the parent.
 */
export const Controlled: Story = {
  render: () => ({
    props: { time: timeAt(14, 30) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-time-field label="Time" [(value)]="time" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ time ? (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) : 'No time' }}
        </p>
      </div>`,
  }),
};

/**
 * This example shows a plain HTML form submit context — the field itself has
 * no native form participation (unlike `Select`/`Autocomplete`, `TimeField`
 * has no `name` prop), so a caller reads `value` from `(valueChange)` instead.
 */
export const InAForm: Story = {
  name: "Native form submit",
  render: () => ({
    props: { time: null as Date | null },
    template: `
      <form method="get" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-time-field label="Time" [(value)]="time" />
        <button type="submit">Submit</button>
      </form>`,
  }),
};

/**
 * This example overrides the field's own `--okkly-time-field-*` variables inline.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: { value: timeAt(9, 30) },
    template: `
      <okkly-time-field
        label="Time"
        [value]="value"
        style="--okkly-time-field-border-color: var(--okkly-accent-violet)"
      />`,
  }),
};
