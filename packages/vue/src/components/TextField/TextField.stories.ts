import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TextField from "./TextField.vue";
import type { TextFieldProps } from "./TextField.vue";

/** `label`/`helperText` fill the matching slots, `modelValue` is the `v-model`; everything else is a prop. */
type TextFieldArgs = TextFieldProps & {
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
const render = (args: TextFieldArgs) => ({
  components: { TextField },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <TextField v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </TextField>`,
});

/**
 * Single-line text input with label, helper, and error. Foundation for most form fields.
 */
const meta: Meta<TextFieldArgs> = {
  title: "Control/TextField",
  component: TextField,
  args: {
    label: "Email",
    placeholder: "you@company.com",
    helperText: "We'll never share it",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    required: false,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — the field's label." },
    helperText: { control: "text", description: "`helper-text` slot — text below the field." },
    modelValue: { control: "text", description: "`v-model` — the input's value." },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "secondary", "dante", "violet", "ember", "ice", "contrast"],
    },
  },
  render,
};

export default meta;
type Story = StoryObj<TextFieldArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { modelValue: "hello@oleksii.dev" } };
/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };
/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { modelValue: "hello@oleksii.dev", error: true, helperText: "Enter a valid email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows no label.
 */
export const NoLabel: Story = { args: { hideLabel: true } };
/**
 * This example shows dante focus.
 */
export const DanteFocus: Story = { args: { color: "dante" } };
/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => ({
    components: { TextField },
    setup() {
      const { label, helperText, ...props } = args;
      return { label, helperText, props };
    },
    template: `
      <div style="width: 320px">
        <TextField v-bind="props">
          <template v-if="label" #label>{{ label }}</template>
          <template v-if="helperText" #helper-text>{{ helperText }}</template>
        </TextField>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { TextField },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <TextField v-for="size in sizes" :key="size" :size="size" placeholder="hello@oleksii.dev">
          <template #label>Email</template>
        </TextField>
      </div>`,
  }),
};

/**
 * This example shows every available color — the focus ring/glow tints to the
 * matching `--okkly-accent-*` token. Focus a field to see it.
 */
export const Colors: Story = {
  render: () => ({
    components: { TextField },
    setup: () => ({
      colors: ["primary", "secondary", "dante", "violet", "ember", "ice", "contrast"] as const,
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <TextField v-for="color in colors" :key="color" :color="color" placeholder="hello@oleksii.dev">
          <template #label>{{ color }}</template>
        </TextField>
      </div>`,
  }),
};
