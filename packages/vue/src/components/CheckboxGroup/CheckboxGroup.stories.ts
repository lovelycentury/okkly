import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Checkbox from "../Checkbox/Checkbox.vue";
import CheckboxGroup from "./CheckboxGroup.vue";
import type { CheckboxGroupProps } from "./CheckboxGroup.types";

/** `label` fills the `label` slot, `modelValue` is the `v-model`; everything else is a prop. */
type CheckboxGroupArgs = CheckboxGroupProps & { label?: string; modelValue?: string[] };

const render = (args: CheckboxGroupArgs) => ({
  components: { Checkbox, CheckboxGroup },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <CheckboxGroup v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <Checkbox value="email"><template #label>Email me updates</template></Checkbox>
      <Checkbox value="sms"><template #label>SMS only</template></Checkbox>
      <Checkbox value="push"><template #label>Push notifications</template></Checkbox>
    </CheckboxGroup>`,
});

/**
 * Labeled set of checkboxes with shared name and optional helper or error text.
 */
const meta: Meta<CheckboxGroupArgs> = {
  title: "Control/CheckboxGroup",
  component: CheckboxGroup,
  argTypes: {
    label: { control: "text", description: "`label` slot — the group heading." },
    modelValue: { control: false },
    defaultValue: { control: false },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render,
};

export default meta;
type Story = StoryObj<CheckboxGroupArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { defaultValue: ["email"] } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification channels", defaultValue: ["email", "push"] },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { defaultValue: ["email"], disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { defaultValue: ["sms"], color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { defaultValue: ["sms"], size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => ({
    components: { Checkbox, CheckboxGroup },
    template: `
      <CheckboxGroup :default-value="['sms']">
        <Checkbox value="email" size="small"><template #label>Email me updates</template></Checkbox>
        <Checkbox value="sms"><template #label>SMS only</template></Checkbox>
        <Checkbox value="push" color="dante"><template #label>Push notifications</template></Checkbox>
      </CheckboxGroup>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (v-model)",
  render: () => ({
    components: { Checkbox, CheckboxGroup },
    setup() {
      const value = ref<string[]>(["email"]);
      return { value };
    },
    template: `
      <CheckboxGroup v-model="value">
        <template #label>Notification channels</template>
        <Checkbox value="email"><template #label>Email</template></Checkbox>
        <Checkbox value="sms"><template #label>SMS</template></Checkbox>
        <Checkbox value="push"><template #label>Push</template></Checkbox>
      </CheckboxGroup>`,
  }),
};
