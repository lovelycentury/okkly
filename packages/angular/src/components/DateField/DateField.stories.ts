import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyDateField } from "./DateField";
import type { DateFieldColor, DateFieldSize } from "./DateField";

/** Every input the template below binds. */
type DateFieldArgs = {
  value: Date | null;
  label: string;
  placeholder: string;
  size: DateFieldSize;
  color: DateFieldColor;
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
 * Masked date input with a calendar popover.
 */
const meta: Meta<DateFieldArgs> = {
  title: "Control/DateField",
  component: OkklyDateField,
  decorators: [moduleMetadata({ imports: [OkklyDateField] })],
  args: {
    value: null,
    label: "Birthday",
    placeholder: "dd.mm.yyyy",
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
  render: (args) => ({ props: args, template: `<okkly-date-field${bindings} />` }),
};

export default meta;
type Story = StoryObj<DateFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: new Date(2024, 5, 15) } };

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true, helperText: "Birthday is required" } };

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
export const Disabled: Story = { args: { disabled: true, value: new Date(2024, 5, 15) } };

/**
 * This example shows min/max bounds — typing or picking outside the range is blocked.
 */
export const Bounded: Story = {
  args: { min: new Date(2024, 5, 1), max: new Date(2024, 5, 30) },
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
          <okkly-date-field [size]="size" label="Birthday" [value]="null" />
        }
      </div>`,
  }),
};

/**
 * This example shows a field whose value lives entirely in the parent.
 */
export const Controlled: Story = {
  render: () => ({
    props: { date: new Date(2024, 5, 15) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-date-field label="Birthday" [(value)]="date" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">Selected: {{ date ? date.toDateString() : "none" }}</p>
      </div>`,
  }),
};

/**
 * This example overrides the field's own `--okkly-date-field-*` variables inline.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: {},
    template: `
      <okkly-date-field
        label="Birthday"
        style="--okkly-date-field-border-color: #d946ef; --okkly-date-field-focus-border-color: #d946ef"
      />`,
  }),
};
