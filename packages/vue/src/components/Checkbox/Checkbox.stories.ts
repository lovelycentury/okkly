import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Checkbox from "./Checkbox.vue";
import type { CheckboxProps } from "./Checkbox.types";

/** `label` fills the `label` slot, `modelValue` is the `v-model`; everything else is a prop. */
type CheckboxArgs = CheckboxProps & {
  label?: string;
  modelValue?: boolean;
  "aria-label"?: string;
};

/**
 * Renders the component with `label` split back out of the args, so it lands
 * in the `label` slot instead of falling through to the `<input>` as an
 * attribute.
 */
const render = (args: CheckboxArgs) => ({
  components: { Checkbox },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <Checkbox v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
    </Checkbox>`,
});

/**
 * Binary or indeterminate choice. Nest in CheckboxGroup when several options share one question.
 */
const meta: Meta<CheckboxArgs> = {
  title: "Control/Checkbox",
  component: Checkbox,
  args: {
    label: "Subscribe to updates",
    size: "medium",
    color: "primary",
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — text beside the box." },
    modelValue: { control: "boolean", description: "`v-model` — the on/off value." },
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
  },
  render,
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
export const Checked: Story = { args: { modelValue: true } };
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
export const DisabledChecked: Story = { args: { disabled: true, modelValue: true } };
/**
 * This example shows no label.
 */
export const NoLabel: Story = {
  args: { modelValue: true, label: undefined, "aria-label": "Subscribe to updates" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <Checkbox v-for="size in sizes" :key="size" :size="size" :model-value="true">
          <template #label>{{ size }}</template>
        </Checkbox>
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ] as const,
    }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <Checkbox v-for="color in colors" :key="color" :color="color" :model-value="true">
          <template #label>{{ color }}</template>
        </Checkbox>
      </div>`,
  }),
};
