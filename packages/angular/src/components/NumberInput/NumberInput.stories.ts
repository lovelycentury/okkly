import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyNumberInput } from "./NumberInput";
import type { NumberInputColor, NumberInputControls, NumberInputSize } from "./NumberInput";

/** Every input the template below binds. */
type NumberInputArgs = {
  label: string;
  value: number | null;
  helperText?: string;
  size: NumberInputSize;
  color: NumberInputColor;
  controls: NumberInputControls;
  error: boolean;
  disabled: boolean;
  hideLabel: boolean;
  fullWidth: boolean;
  required: boolean;
  min?: number;
  max?: number;
  step: number;
};

const bindings = `
    [label]="label"
    [(value)]="value"
    [helperText]="helperText"
    [size]="size"
    [color]="color"
    [controls]="controls"
    [error]="error"
    [disabled]="disabled"
    [hideLabel]="hideLabel"
    [fullWidth]="fullWidth"
    [required]="required"
    [min]="min"
    [max]="max"
    [step]="step"`;

const booleanControl = {
  control: "boolean",
  table: { defaultValue: { summary: "false" } },
} as const;

/**
 * Numeric input with +/- (or chevron) steppers, arrow-key stepping, and clamping to `min`/`max`.
 */
const meta: Meta<NumberInputArgs> = {
  title: "Control/NumberInput",
  component: OkklyNumberInput,
  decorators: [moduleMetadata({ imports: [OkklyNumberInput] })],
  args: {
    label: "Quantity",
    value: 12,
    helperText: "Between 1 and 99",
    size: "medium",
    color: "primary",
    controls: "stepper",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    required: false,
    step: 1,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    controls: { control: "inline-radio", options: ["stepper", "chevrons"] },
    value: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    error: booleanControl,
    disabled: booleanControl,
    hideLabel: booleanControl,
    fullWidth: booleanControl,
    required: booleanControl,
  },
  parameters: {
    controls: {
      exclude: [
        "canDecrement",
        "canIncrement",
        "decrementIcon",
        "displayValue",
        "helperId",
        "id",
        "incrementIcon",
        "inputId",
        "modifiers",
        "name",
        "placeholder",
      ],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-number-input${bindings} />` }),
};

export default meta;
type Story = StoryObj<NumberInputArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows chevrons.
 */
export const Chevrons: Story = {
  args: { controls: "chevrons" },
};

/**
 * This example shows with min max.
 */
export const WithMinMax: Story = {
  args: { min: 1, max: 99, value: 12, helperText: "Between 1 and 99" },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { error: true, helperText: "Must be 1–99", value: 120, min: 1, max: 99 },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
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
          <okkly-number-input [size]="size" label="Quantity" [value]="12" helperText="Between 1 and 99" />
        }
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    props: { quantity: 12 },
    template: `
      <okkly-number-input
        label="Quantity"
        [(value)]="quantity"
        min="1"
        max="99"
        [helperText]="'Current value: ' + (quantity === null ? 'empty' : quantity)"
      />`,
  }),
};
