import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyTextArea } from "./TextArea";
import type { TextAreaColor, TextAreaResize, TextAreaSize } from "./TextArea";

/** Every input the template below binds. */
type TextAreaArgs = {
  label: string;
  placeholder: string;
  helperText?: string;
  size: TextAreaSize;
  color: TextAreaColor;
  error: boolean;
  disabled: boolean;
  hideLabel: boolean;
  fullWidth: boolean;
  rows: number;
  maxRows?: number;
  autosize: boolean;
  maxLength?: number;
  resize: TextAreaResize;
  required: boolean;
  value: string;
};

const bindings = `
    [label]="label"
    [placeholder]="placeholder"
    [helperText]="helperText"
    [size]="size"
    [color]="color"
    [error]="error"
    [disabled]="disabled"
    [hideLabel]="hideLabel"
    [fullWidth]="fullWidth"
    [rows]="rows"
    [maxRows]="maxRows"
    [autosize]="autosize"
    [maxLength]="maxLength"
    [resize]="resize"
    [required]="required"
    [(value)]="value"`;

const booleanControl = {
  control: "boolean",
  table: { defaultValue: { summary: "false" } },
} as const;

/**
 * Multi-line text input with an optional character counter and auto-growing height.
 */
const meta: Meta<TextAreaArgs> = {
  title: "Control/TextArea",
  component: OkklyTextArea,
  decorators: [moduleMetadata({ imports: [OkklyTextArea] })],
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
    value: "",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    resize: { control: "inline-radio", options: ["none", "vertical", "both"] },
    error: booleanControl,
    disabled: booleanControl,
    hideLabel: booleanControl,
    fullWidth: booleanControl,
    autosize: booleanControl,
    required: booleanControl,
  },
  parameters: {
    controls: {
      exclude: [
        "counterId",
        "describedBy",
        "helperId",
        "id",
        "inputId",
        "modifiers",
        "name",
        "showFooter",
      ],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-text-area${bindings} />` }),
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
    value:
      "Hi Oleksii — loved your portfolio, the EQ and map work is gorgeous. Could we book a call next week?",
  },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    value: "Hi",
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
    value: "",
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
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (size of sizes; track size) {
          <okkly-text-area [size]="size" label="Message" placeholder="Write your message…" />
        }
      </div>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
