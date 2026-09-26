import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyRadio } from "./Radio";
import type { RadioColor, RadioSize } from "./Radio";

/** Every input the default render binds. */
type RadioArgs = {
  label: string;
  checked: boolean;
  size: RadioSize;
  color: RadioColor;
  disabled: boolean;
};

/**
 * One option of a single choice. Nest radios in RadioGroup so they share a name and
 * one selected value.
 */
const meta: Meta<RadioArgs> = {
  title: "Control/Radio",
  component: OkklyRadio,
  decorators: [moduleMetadata({ imports: [OkklyRadio] })],
  args: {
    label: "Option",
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
  },
  render: (args) => ({
    props: args,
    template: `<okkly-radio [label]="label" [(checked)]="checked" [size]="size" [color]="color" [disabled]="disabled" />`,
  }),
};

export default meta;
type Story = StoryObj<RadioArgs>;

/**
 * This example shows unselected.
 */
export const Unselected: Story = {};
/**
 * This example shows selected.
 */
export const Selected: Story = { args: { checked: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows disabled selected.
 */
export const DisabledSelected: Story = { args: { disabled: true, checked: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        @for (size of sizes; track size) {
          <okkly-radio [size]="size" checked [label]="size" [name]="'size-' + size" />
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
          <okkly-radio [color]="color" checked [label]="color" [name]="'color-' + color" />
        }
      </div>`,
  }),
};
