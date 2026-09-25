import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklySwitch } from "./Switch";
import type { SwitchColor, SwitchSize } from "./Switch";

/** Every input the default render binds. */
type SwitchArgs = {
  label: string | undefined;
  checked: boolean;
  size: SwitchSize;
  color: SwitchColor;
  disabled: boolean;
};

/**
 * Immediate on/off toggle. Prefer Checkbox for form “agree” statements that submit later.
 */
const meta: Meta<SwitchArgs> = {
  title: "Control/Switch",
  component: OkklySwitch,
  decorators: [moduleMetadata({ imports: [OkklySwitch] })],
  args: {
    label: undefined,
    checked: false,
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    checked: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    label: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-switch
        [label]="label" [(checked)]="checked" [size]="size" [color]="color" [disabled]="disabled"
        [aria-label]="label ? undefined : 'Toggle'"
      />`,
  }),
};

export default meta;
type Story = StoryObj<SwitchArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows checked.
 */
export const Checked: Story = { args: { checked: true } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = { args: { label: "Enable notifications", checked: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        @for (size of sizes; track size) {
          <okkly-switch [size]="size" checked [label]="size" />
        }
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        @for (color of colors; track color) {
          <okkly-switch [color]="color" checked [label]="color" />
        }
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (toggle)",
  render: () => ({
    props: { checked: false },
    template: `<okkly-switch label="Dark mode" [(checked)]="checked" />`,
  }),
};
