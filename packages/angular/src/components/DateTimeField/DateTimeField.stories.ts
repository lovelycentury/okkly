import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyDateTimeField } from "./DateTimeField";
import type { DateTimeFieldColor, DateTimeFieldSize } from "./DateTimeField";

/** Every input the template below binds. */
type DateTimeFieldArgs = {
  value: Date | null;
  label: string;
  placeholder: string;
  size: DateTimeFieldSize;
  color: DateTimeFieldColor;
  error: boolean;
  helperText?: string;
  disabled: boolean;
  fullWidth: boolean;
  required: boolean;
  min?: Date;
  max?: Date;
};

const booleanControl = {
  control: "boolean",
  table: { defaultValue: { summary: "false" } },
} as const;

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
 * Masked `dd.mm.yyyy, HH:mm` input with a date+time picker popover.
 */
const meta: Meta<DateTimeFieldArgs> = {
  title: "Control/DateTimeField",
  component: OkklyDateTimeField,
  decorators: [moduleMetadata({ imports: [OkklyDateTimeField] })],
  args: {
    value: null,
    label: "Meeting",
    placeholder: "dd.mm.yyyy, HH:mm",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    error: booleanControl,
    disabled: booleanControl,
    fullWidth: booleanControl,
    required: booleanControl,
  },
  parameters: {
    controls: {
      exclude: ["open", "min", "max", "id"],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-date-time-field${bindings} />` }),
};

export default meta;
type Story = StoryObj<DateTimeFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: new Date(2024, 5, 15, 14, 30) } };

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true, helperText: "Meeting time is required" } };

/**
 * This example shows the error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: { error: true, helperText: "That date looks wrong" },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, value: new Date(2024, 5, 15, 14, 30) } };

/**
 * This example shows min/max bounds — typing or picking outside the range is blocked.
 */
export const Bounded: Story = {
  args: { min: new Date(2024, 5, 1), max: new Date(2024, 5, 30, 23, 59) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (size of sizes; track size) {
          <okkly-date-time-field [size]="size" label="Meeting" [value]="null" />
        }
      </div>`,
  }),
};

/**
 * This example shows a field whose value lives entirely in the parent.
 */
export const Controlled: Story = {
  render: () => ({
    props: { value: new Date(2024, 5, 15, 14, 30) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-date-time-field label="Meeting" [(value)]="value" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">Selected: {{ value ? value.toString() : "none" }}</p>
      </div>`,
  }),
};

/**
 * This example overrides the field's own `--okkly-date-time-field-*` variables inline.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: {},
    template: `
      <okkly-date-time-field
        label="Meeting"
        style="--okkly-date-time-field-border-color: #d946ef; --okkly-date-time-field-focus-border-color: #d946ef"
      />`,
  }),
};
