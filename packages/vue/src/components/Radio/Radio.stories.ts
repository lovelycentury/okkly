import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Radio from "./Radio.vue";
import type { RadioProps } from "./Radio.types";

/** `label` fills the `label` slot; everything else is a prop. */
type RadioArgs = RadioProps & { label?: string };

/**
 * Renders the component with `label` split back out of the args, so it lands
 * in the `label` slot instead of falling through to the `<input>` as an
 * attribute.
 */
const render = (args: RadioArgs) => ({
  components: { Radio },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <Radio v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
    </Radio>`,
});

/**
 * Single option inside a RadioGroup. Bare control — pair with your own label markup or group labels.
 */
const meta: Meta<RadioArgs> = {
  title: "Control/Radio",
  component: Radio,
  args: {
    label: "Option",
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — text beside the circle." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render,
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
    components: { Radio },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <Radio v-for="size in sizes" :key="size" :size="size" checked>
          <template #label>{{ size }}</template>
        </Radio>
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Radio },
    setup: () => ({ colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as const }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <Radio v-for="color in colors" :key="color" :color="color" checked>
          <template #label>{{ color }}</template>
        </Radio>
      </div>`,
  }),
};
