import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklySelect } from "./Select";
import type { SelectColor, SelectOption, SelectSize } from "./Select";

/** Every input the template below binds. */
type SelectArgs = {
  options: SelectOption[];
  value: string | string[] | null;
  multiple: boolean;
  label: string;
  placeholder: string;
  size: SelectSize;
  color: SelectColor;
  error: boolean;
  helperText?: string;
  disabled: boolean;
  fullWidth: boolean;
  loading: boolean;
  required: boolean;
  limitTags: number;
};

const TEAM_OPTIONS: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
];

const CITY_OPTIONS: SelectOption[] = [
  { value: "paris", label: "Paris" },
  { value: "tokyo", label: "Tokyo" },
  { value: "kyiv", label: "Kyiv" },
  { value: "osaka", label: "Osaka" },
  { value: "lisbon", label: "Lisbon" },
];

const CITY_REGION: Record<string, string> = {
  paris: "Europe",
  kyiv: "Europe",
  lisbon: "Europe",
  tokyo: "Asia",
  osaka: "Asia",
};

const bindings = `
    [options]="options"
    [(value)]="value"
    [multiple]="multiple"
    [label]="label"
    [placeholder]="placeholder"
    [size]="size"
    [color]="color"
    [error]="error"
    [helperText]="helperText"
    [disabled]="disabled"
    [fullWidth]="fullWidth"
    [loading]="loading"
    [required]="required"
    [limitTags]="limitTags"`;

const booleanControl = {
  control: "boolean",
  table: { defaultValue: { summary: "false" } },
} as const;

/**
 * Closed list of options in a field.
 */
const meta: Meta<SelectArgs> = {
  title: "Control/Select",
  component: OkklySelect,
  decorators: [moduleMetadata({ imports: [OkklySelect] })],
  args: {
    options: TEAM_OPTIONS,
    value: null,
    multiple: false,
    label: "Team",
    placeholder: "Choose a team…",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    loading: false,
    required: false,
    limitTags: 2,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "secondary", "dante", "violet", "ember", "ice", "contrast"],
    },
    multiple: booleanControl,
    error: booleanControl,
    disabled: booleanControl,
    fullWidth: booleanControl,
    loading: booleanControl,
    required: booleanControl,
    options: { control: false },
  },
  parameters: {
    controls: {
      exclude: [
        "change",
        "groupBy",
        "name",
        "id",
        "open",
        "disableCloseOnSelect",
        "disableClearable",
        "noOptionsText",
        "loadingText",
        "clearText",
        "popupWidth",
      ],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-select${bindings} />` }),
};

export default meta;
type Story = StoryObj<SelectArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: "engineering" } };

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true, helperText: "Team is required" } };

/**
 * This example shows the error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: { error: true, helperText: "Please choose a team" },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, value: "engineering" } };

/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };

/**
 * This example shows multiple.
 */
export const Multiple: Story = {
  args: { multiple: true, value: ["design", "engineering", "operations"] },
};

/**
 * This example shows limit tags.
 */
export const LimitTags: Story = {
  name: "Multiple — limitTags",
  args: {
    multiple: true,
    limitTags: 2,
    value: ["design", "engineering", "marketing", "operations"],
  },
};

/**
 * This example shows grouped options under sticky headers, reordered so each
 * group's members are contiguous.
 */
export const Grouped: Story = {
  render: () => ({
    props: {
      options: CITY_OPTIONS,
      groupBy: (option: SelectOption) => CITY_REGION[option.value] ?? "Other",
    },
    template: `<okkly-select label="City" placeholder="Choose a city…" [options]="options" [groupBy]="groupBy" />`,
  }),
};

/**
 * This example shows a wider dropdown panel than the field itself.
 */
export const WiderPopup: Story = {
  name: "popupWidth",
  render: (args) => ({
    props: args,
    template: `<okkly-select${bindings} [popupWidth]="320" />`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"], options: TEAM_OPTIONS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (size of sizes; track size) {
          <okkly-select [size]="size" label="Team" [options]="options" value="engineering" />
        }
      </div>`,
  }),
};

/**
 * This example shows a select whose value lives entirely in the parent.
 */
export const Controlled: Story = {
  render: () => ({
    props: { team: "engineering", options: TEAM_OPTIONS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-select label="Team" [options]="options" [(value)]="team" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">Selected: {{ team ?? "none" }}</p>
      </div>`,
  }),
};

/**
 * This example shows a plain HTML form submit — `name` emits hidden inputs
 * carrying the selected value(s), so no JavaScript is needed to read them.
 */
export const InAForm: Story = {
  name: "Native form submit",
  render: () => ({
    props: { options: TEAM_OPTIONS },
    template: `
      <form method="get" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-select label="Team" name="team" [options]="options" value="engineering" />
        <button type="submit">Submit</button>
      </form>`,
  }),
};

/**
 * This example overrides the field's own `--okkly-select-*` variables inline.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: { options: TEAM_OPTIONS },
    template: `
      <okkly-select
        label="Team"
        [options]="options"
        value="engineering"
        style="--okkly-select-border-color: #d946ef; --okkly-select-focus-border-color: #d946ef"
      />`,
  }),
};
