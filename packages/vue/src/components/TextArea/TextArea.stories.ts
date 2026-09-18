import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TextArea from "./TextArea.vue";
import type { TextAreaProps } from "./TextArea.types";

/** `label`/`helperText` fill the matching slots, `modelValue` is the `v-model`; everything else is a prop. */
type TextAreaArgs = TextAreaProps & {
  label?: string;
  helperText?: string;
  modelValue?: string;
  placeholder?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: TextAreaArgs) => ({
  components: { TextArea },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <TextArea v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </TextArea>`,
});

/**
 * Multi-line text field for notes and descriptions. Prefer RichEditor when formatting is required.
 */
const meta: Meta<TextAreaArgs> = {
  title: "Control/TextArea",
  component: TextArea,
  args: {
    label: "Message",
    placeholder: "Write your message…",
    helperText: "Markdown supported",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    rows: 3,
    autosize: false,
    resize: "vertical",
    required: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — the field's label." },
    helperText: { control: "text", description: "`helper-text` slot — text below the field." },
    modelValue: { control: "text", description: "`v-model` — the textarea's value." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    resize: { control: "inline-radio", options: ["none", "vertical", "both"] },
  },
  render,
};

export default meta;
type Story = StoryObj<TextAreaArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: {
    modelValue:
      "Hi Oleksii — loved your portfolio, the EQ and map work is gorgeous. Could we book a call next week?",
  },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    modelValue: "Hi",
    error: true,
    helperText: "Message is too long",
    maxLength: 280,
  },
};

/**
 * This example shows with counter.
 */
export const WithCounter: Story = {
  args: {
    maxLength: 280,
    helperText: "Markdown supported",
    modelValue: "",
  },
};

/**
 * This example shows autosize.
 */
export const Autosize: Story = {
  args: {
    autosize: true,
    maxRows: 8,
    placeholder: "Start typing — the field grows with your content…",
  },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { TextArea },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <TextArea v-for="size in sizes" :key="size" :size="size" placeholder="Write your message…">
          <template #label>Message</template>
        </TextArea>
      </div>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
