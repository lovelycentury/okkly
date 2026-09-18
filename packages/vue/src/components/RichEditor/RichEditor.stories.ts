import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RichEditor from "./RichEditor.vue";
import type { RichEditorProps, RichEditorValue } from "./RichEditor.types";

const SAMPLE_HTML = `
<h2>Design review</h2>
<p>Ship the <strong>primitives</strong> first — templates follow. Use <em>italic</em>, <u>underline</u>, and <code>inline code</code> freely.</p>
<ul>
  <li>Toolbar, blocks, slash menu</li>
  <li>Word count + autosave status</li>
</ul>
<blockquote><p>Primitives first, templates second.</p></blockquote>
`.trim();

/** `label`/`helperText` fill the matching slots; everything else is a prop. */
type RichEditorArgs = RichEditorProps & {
  label?: string;
  helperText?: string;
};

/**
 * Renders the component with `label`/`helperText` split back out of the args,
 * so they land in the `label`/`helper-text` slots instead of falling through
 * to the field as attributes.
 */
const render = (args: RichEditorArgs) => ({
  components: { RichEditor },
  setup() {
    const { label, helperText, ...props } = args;
    return { label, helperText, props };
  },
  template: `
    <RichEditor v-bind="props">
      <template v-if="label" #label>{{ label }}</template>
      <template v-if="helperText" #helper-text>{{ helperText }}</template>
    </RichEditor>`,
});

/**
 * TipTap-based rich text with toolbar, slash menu, and word count. Prefer TextArea for plain notes.
 */
const meta: Meta<RichEditorArgs> = {
  title: "Control/RichEditor",
  component: RichEditor,
  args: {
    label: "Description",
    placeholder: "Write something…",
    helperText: "Rich text · saved as HTML",
    toolbar: "full",
    color: "primary",
    error: false,
    disabled: false,
    readonly: false,
    fullWidth: true,
    autosave: 5000,
    slashMenu: true,
  },
  argTypes: {
    label: { control: "text", description: "`label` slot — the field's label." },
    helperText: { control: "text", description: "`helper-text` slot — text below the field." },
    toolbar: { control: "inline-radio", options: ["full", "compact", "none"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    format: { control: "inline-radio", options: ["html", "json"] },
  },
  render,
};

export default meta;
type Story = StoryObj<RichEditorArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: { defaultValue: SAMPLE_HTML },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    error: true,
    helperText: "Content exceeds 5 000 characters",
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    disabled: true,
  },
};

/**
 * This example shows readonly.
 */
export const Readonly: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    readonly: true,
    helperText: "Read-only document",
  },
};

/**
 * This example shows compact toolbar.
 */
export const CompactToolbar: Story = {
  args: {
    toolbar: "compact",
    defaultValue: "<p>Compact toolbar — marks and lists only.</p>",
  },
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { RichEditor },
    setup() {
      const value = ref<RichEditorValue>(SAMPLE_HTML);
      return { value };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <RichEditor v-model="value">
          <template #label>Controlled</template>
          <template #helper-text>Parent owns the HTML string</template>
        </RichEditor>
        <button type="button" @click="value = '<p>Reset from parent.</p>'">Reset</button>
      </div>`,
  }),
};
