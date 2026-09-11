import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyTextField } from "./TextField";
import type { TextFieldColor, TextFieldSize } from "./TextField";

/** Every input the templates below bind. */
type TextFieldArgs = {
  label: string;
  placeholder: string;
  helperText: string;
  size: TextFieldSize;
  color: TextFieldColor;
  error: boolean;
  disabled: boolean;
  hideLabel: boolean;
  fullWidth: boolean;
  required: boolean;
  value: string;
};

const bindings = `
    [label]="label"
    [placeholder]="placeholder"
    [helperText]="helperText"
    [size]="size"
    [color]="color"
    [error]="error"
    [disabled]="disabled"
    [hideLabel]="hideLabel"
    [fullWidth]="fullWidth"
    [required]="required"
    [value]="value"`;

/**
 * Single-line text input with label, helper, and error. Foundation for most form fields.
 */
const meta: Meta<TextFieldArgs> = {
  title: "Control/TextField",
  component: OkklyTextField,
  decorators: [moduleMetadata({ imports: [OkklyTextField] })],
  args: {
    label: "Email",
    placeholder: "you@company.com",
    helperText: "We'll never share it",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    required: false,
    value: "",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "secondary", "dante", "violet", "ember", "ice", "contrast"],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-text-field${bindings} />` }),
};

export default meta;
type Story = StoryObj<TextFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: "hello@oleksii.dev" } };
/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };
/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { value: "hello@oleksii.dev", error: true, helperText: "Enter a valid email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows no label.
 */
export const NoLabel: Story = { args: { hideLabel: true } };
/**
 * This example shows dante focus.
 */
export const DanteFocus: Story = { args: { color: "dante" } };
/**
 * This example shows every available accent color.
 */
export const Colors: Story = {
  render: (args) => ({
    props: {
      ...args,
      colors: ["primary", "secondary", "dante", "violet", "ember", "ice", "contrast"],
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (color of colors; track color) {
          <okkly-text-field [label]="color" [placeholder]="placeholder" [color]="color" />
        }
      </div>`,
  }),
};
/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => ({
    props: args,
    template: `<div style="width: 320px"><okkly-text-field${bindings} /></div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (size of sizes; track size) {
          <okkly-text-field [label]="label" [placeholder]="placeholder" [size]="size" />
        }
      </div>`,
  }),
};
