import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Radio from "../Radio/Radio.vue";
import RadioGroup from "./RadioGroup.vue";
import type { RadioGroupProps } from "./RadioGroup.types";

/** `label` fills the `label` slot, `modelValue` is the `v-model`; everything else is a prop. */
type RadioGroupArgs = RadioGroupProps & { label?: string; modelValue?: string };

const render = (args: RadioGroupArgs) => ({
  components: { Radio, RadioGroup },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <RadioGroup v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <Radio value="email"><template #label>Email me updates</template></Radio>
      <Radio value="sms"><template #label>SMS only</template></Radio>
      <Radio value="none"><template #label>No notifications</template></Radio>
    </RadioGroup>`,
});

/**
 * Exclusive choice among radios. Provide a group label and shared `name` for form submission.
 */
const meta: Meta<RadioGroupArgs> = {
  title: "Control/RadioGroup",
  component: RadioGroup,
  argTypes: {
    label: { control: "text", description: "`label` slot — the group heading." },
    modelValue: { control: "text", description: "`v-model` — the selected value." },
    defaultValue: { control: false },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render,
};

export default meta;
type Story = StoryObj<RadioGroupArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { defaultValue: "email" } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification preference", defaultValue: "email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { defaultValue: "email", disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { defaultValue: "sms", color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { defaultValue: "sms", size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => ({
    components: { Radio, RadioGroup },
    template: `
      <RadioGroup default-value="sms">
        <Radio value="email" size="small"><template #label>Email me updates</template></Radio>
        <Radio value="sms"><template #label>SMS only</template></Radio>
        <Radio value="none" color="dante"><template #label>No notifications</template></Radio>
      </RadioGroup>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (v-model)",
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const value = ref("email");
      return { value };
    },
    template: `
      <RadioGroup v-model="value">
        <template #label>Notification preference</template>
        <Radio value="email"><template #label>Email</template></Radio>
        <Radio value="sms"><template #label>SMS</template></Radio>
        <Radio value="none"><template #label>None</template></Radio>
      </RadioGroup>`,
  }),
};
