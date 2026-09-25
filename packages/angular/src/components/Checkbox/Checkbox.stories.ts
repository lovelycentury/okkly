import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyCheckbox } from "./Checkbox";
import type { CheckboxColor, CheckboxSize } from "./Checkbox";

/** Every input the default render binds. */
type CheckboxArgs = {
  label: string | undefined;
  checked: boolean;
  indeterminate: boolean;
  size: CheckboxSize;
  color: CheckboxColor;
  disabled: boolean;
};

const COLORS: CheckboxColor[] = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
];

/**
 * Binary or indeterminate choice. Nest in CheckboxGroup when several options share one question.
 *
 * `[(checked)]` binds the state; the label is a `<label for>` tied to the native
 * input, so clicking the text toggles it.
 */
const meta: Meta<CheckboxArgs> = {
  title: "Control/Checkbox",
  component: OkklyCheckbox,
  decorators: [moduleMetadata({ imports: [OkklyCheckbox] })],
  args: {
    label: "Subscribe to updates",
    checked: false,
    indeterminate: false,
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: COLORS },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-checkbox
        [label]="label" [(checked)]="checked" [(indeterminate)]="indeterminate"
        [size]="size" [color]="color" [disabled]="disabled"
      />`,
  }),
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

/**
 * This example shows unchecked.
 */
export const Unchecked: Story = {};
/**
 * This example shows checked.
 */
export const Checked: Story = { args: { checked: true } };
/**
 * This example shows indeterminate.
 */
export const Indeterminate: Story = { args: { indeterminate: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows disabled checked.
 */
export const DisabledChecked: Story = { args: { disabled: true, checked: true } };
/**
 * This example shows no label: `aria-label` names the native input instead.
 */
export const NoLabel: Story = {
  render: () => ({
    template: `<okkly-checkbox checked aria-label="Subscribe to updates" />`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        @for (size of sizes; track size) {
          <okkly-checkbox [size]="size" checked [label]="size" />
        }
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: COLORS },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        @for (color of colors; track color) {
          <okkly-checkbox [color]="color" checked [label]="color" />
        }
      </div>`,
  }),
};
