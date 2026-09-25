import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyRadio } from "../Radio/Radio";
import type { RadioColor, RadioSize } from "../Radio/Radio";
import { OkklyRadioGroup } from "./RadioGroup";

/** Every input the default render binds. */
type RadioGroupArgs = {
  value: string | undefined;
  label: string | undefined;
  disabled: boolean;
  size: RadioSize;
  color: RadioColor;
};

/**
 * Labeled single choice. Nest `okkly-radio` elements with a `value` each;
 * `[(value)]` binds the selected one.
 */
const meta: Meta<RadioGroupArgs> = {
  title: "Control/RadioGroup",
  component: OkklyRadioGroup,
  decorators: [moduleMetadata({ imports: [OkklyRadioGroup, OkklyRadio] })],
  args: {
    value: undefined,
    label: undefined,
    disabled: false,
    size: "medium",
    color: "primary",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    label: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-radio-group [(value)]="value" [label]="label" [disabled]="disabled" [size]="size" [color]="color">
        <okkly-radio value="email" label="Email me updates" />
        <okkly-radio value="sms" label="SMS only" />
        <okkly-radio value="none" label="No notifications" />
      </okkly-radio-group>`,
  }),
};

export default meta;
type Story = StoryObj<RadioGroupArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { value: "email" } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification preference", value: "email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { value: "email", disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { value: "sms", color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { value: "sms", size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => ({
    template: `
      <okkly-radio-group value="sms">
        <okkly-radio value="email" label="Email me updates" size="small" />
        <okkly-radio value="sms" label="SMS only" />
        <okkly-radio value="none" label="No notifications" color="dante" />
      </okkly-radio-group>`,
  }),
};
