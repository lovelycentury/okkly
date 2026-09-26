import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyCheckbox } from "../Checkbox/Checkbox";
import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox";
import { OkklyCheckboxGroup } from "./CheckboxGroup";

/** Every input the default render binds. */
type CheckboxGroupArgs = {
  value: string[];
  label: string | undefined;
  disabled: boolean;
  size: CheckboxSize;
  color: CheckboxColor;
};

const options = `
  <okkly-checkbox value="email" label="Email me updates" />
  <okkly-checkbox value="sms" label="SMS only" />
  <okkly-checkbox value="push" label="Push notifications" />`;

/**
 * Labeled set of checkboxes with a shared name. Nest `okkly-checkbox` elements with
 * a `value` each; `[(value)]` binds the array of the checked ones.
 */
const meta: Meta<CheckboxGroupArgs> = {
  title: "Control/CheckboxGroup",
  component: OkklyCheckboxGroup,
  decorators: [moduleMetadata({ imports: [OkklyCheckboxGroup, OkklyCheckbox] })],
  args: {
    value: [],
    label: undefined,
    disabled: false,
    size: "medium",
    color: "primary",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    label: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-checkbox-group [(value)]="value" [label]="label" [disabled]="disabled" [size]="size" [color]="color">
        ${options}
      </okkly-checkbox-group>`,
  }),
};

export default meta;
type Story = StoryObj<CheckboxGroupArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { value: ["email"] } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification channels", value: ["email", "push"] },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { value: ["email"], disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { value: ["sms"], color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { value: ["sms"], size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => ({
    template: `
      <okkly-checkbox-group [value]="['sms']">
        <okkly-checkbox value="email" label="Email me updates" size="small" />
        <okkly-checkbox value="sms" label="SMS only" />
        <okkly-checkbox value="push" label="Push notifications" color="dante" />
      </okkly-checkbox-group>`,
  }),
};
