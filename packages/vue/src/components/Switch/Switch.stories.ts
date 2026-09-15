import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Switch from "./Switch.vue";
import type { SwitchProps } from "./Switch.types";

/** `label` fills the `label` slot, `modelValue` is the `v-model`; everything else is a prop. */
type SwitchArgs = SwitchProps & {
  label?: string;
  modelValue?: boolean;
  "aria-label"?: string;
};

/**
 * Renders the component with `label` split back out of the args, so it lands
 * in the `label` slot instead of falling through to the `<input>` as an
 * attribute.
 */
const render = (args: SwitchArgs) => ({
  components: { Switch },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <Switch v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
    </Switch>`,
});

/**
 * Immediate on/off toggle. Prefer Checkbox for form "agree" statements that submit later.
 */
const meta: Meta<SwitchArgs> = {
  title: "Control/Switch",
  component: Switch,
  args: {
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — text beside the control." },
    modelValue: { control: "boolean", description: "`v-model` — the on/off value." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render,
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
export const Checked: Story = { args: { modelValue: true } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = { args: { label: "Enable notifications", modelValue: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <Switch v-for="size in sizes" :key="size" :size="size" :model-value="true">
          <template #label>{{ size }}</template>
        </Switch>
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as const }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <Switch v-for="color in colors" :key="color" :color="color" :model-value="true">
          <template #label>{{ color }}</template>
        </Switch>
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (toggle)",
  render: () => ({
    components: { Switch },
    setup() {
      const checked = ref(false);
      return { checked };
    },
    template: `
      <Switch v-model="checked">
        <template #label>Dark mode</template>
      </Switch>`,
  }),
};
