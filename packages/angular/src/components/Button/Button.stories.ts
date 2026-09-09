import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton, OkklyButtonEndIcon, OkklyButtonStartIcon } from "./Button";
import type {
  ButtonColor,
  ButtonLoadingPosition,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from "./Button";

/** `iconArrowRight` from `@okkly/icons`, inlined so the marker attribute is visible in the snippet. */
const arrowIcon = (slot: "okklyButtonStartIcon" | "okklyButtonEndIcon") =>
  `<svg ${slot} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>`;

/**
 * Every input the template below binds, plus `label` for the projected content.
 * `disableRipple` is the `OkklyRipple` host directive's input, re-exposed on the
 * button element.
 */
type ButtonArgs = {
  label: string;
  variant: ButtonVariant;
  color: ButtonColor;
  shape: ButtonShape;
  size: ButtonSize;
  fullWidth: boolean;
  loading: boolean;
  loadingPosition: ButtonLoadingPosition;
  disabled: boolean;
  disableRipple: boolean;
};

const bindings = `
    [variant]="variant"
    [color]="color"
    [shape]="shape"
    [size]="size"
    [fullWidth]="fullWidth"
    [loading]="loading"
    [loadingPosition]="loadingPosition"
    [disabled]="disabled"
    [disableRipple]="disableRipple"`;

/** Renders the attribute component on a native `<button>`, with an optional end icon. */
const button = (endIcon = false) => ({
  template: `<button okklyButton${bindings}>{{ label }}${endIcon ? arrowIcon("okklyButtonEndIcon") : ""}</button>`,
});

/**
 * Primary action control for forms, dialogs, and toolbars. Pick variant and color for emphasis — one primary action per view.
 *
 * `OkklyButton` decorates a native `<button>` or `<a>` rather than wrapping one, so the
 * element keeps its own semantics and event bindings. Icons are projected content tagged
 * with `okklyButtonStartIcon` / `okklyButtonEndIcon`.
 */
const meta: Meta<ButtonArgs> = {
  title: "Control/Button",
  component: OkklyButton,
  decorators: [
    moduleMetadata({ imports: [OkklyButton, OkklyButtonStartIcon, OkklyButtonEndIcon] }),
  ],
  args: {
    label: "Button",
    variant: "primary",
    color: "primary",
    shape: "pill",
    size: "medium",
    fullWidth: false,
    loading: false,
    loadingPosition: "center",
    disabled: false,
    disableRipple: false,
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here. `booleanAttribute` inputs need an explicit
  // one — their compiled default reads as the whole `input()` call, which
  // Storybook cannot infer a toggle from.
  argTypes: {
    label: { control: "text", description: "Projected content — the button's label." },
    variant: {
      control: "select",
      options: ["primary", "gradient", "secondary", "soft", "ghost", "glass"],
    },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    shape: { control: "inline-radio", options: ["pill", "rounded"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    loadingPosition: { control: "inline-radio", options: ["start", "center", "end"] },
    fullWidth: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    loading: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableRipple: {
      control: "boolean",
      description:
        "Whether the ripple effect is disabled. Provided by the `OkklyRipple` host directive.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  // `isDisabled` is public but derived from `disabled`/`loading` rather than
  // set, so Compodoc surfaces it and it does not belong in a table of knobs.
  parameters: { controls: { exclude: ["isDisabled"] } },
  render: (args) => ({ props: args, ...button() }),
};

export default meta;
type Story = StoryObj<ButtonArgs>;

/**
 * This example shows the primary appearance.
 */
export const Primary: Story = { render: (args) => ({ props: args, ...button(true) }) };
/**
 * This example shows the gradient variant.
 */
export const Gradient: Story = {
  args: { variant: "gradient" },
  render: (args) => ({ props: args, ...button(true) }),
};
/**
 * This example shows the secondary appearance.
 */
export const Secondary: Story = { args: { variant: "secondary" } };
/**
 * This example shows the soft variant.
 */
export const Soft: Story = { args: { variant: "soft" } };
/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = { args: { variant: "ghost" } };
/**
 * This example shows the glass variant.
 */
export const Glass: Story = {
  args: { variant: "glass" },
  render: (args) => ({ props: args, ...button(true) }),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({ props: args, ...button(true) }),
};
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };

/**
 * This example shows where the spinner sits relative to the label. `start` and `end`
 * take over the matching icon slot; `center` dims the label and overlays the spinner.
 */
export const LoadingPositions: Story = {
  args: { loading: true },
  render: (args) => ({
    props: { ...args, positions: ["start", "center", "end"] },
    template: `
      <div style="display: flex; gap: 12px">
        @for (position of positions; track position) {
          <button okklyButton [loading]="loading" [loadingPosition]="position">{{ position }}</button>
        }
      </div>`,
  }),
};

/**
 * This example shows both icon slots. An untagged slot collapses, so no gap is
 * reserved for an icon that was not projected.
 */
export const WithIcons: Story = {
  render: (args) => ({
    props: args,
    template: `<button okklyButton${bindings}>${arrowIcon("okklyButtonStartIcon")}{{ label }}${arrowIcon("okklyButtonEndIcon")}</button>`,
  }),
};

/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => ({
    props: args,
    template: `<div style="width: 320px"><button okklyButton${bindings}>{{ label }}${arrowIcon("okklyButtonEndIcon")}</button></div>`,
  }),
};

/**
 * This example shows the component used as a link. An anchor cannot be disabled
 * natively, so a disabled one gets `aria-disabled`, `tabindex="-1"`, and swallowed clicks.
 */
export const AsLink: Story = {
  args: { label: "Get in touch" },
  render: (args) => ({
    props: args,
    template: `<a okklyButton href="https://okryshto.dev"${bindings}>{{ label }}${arrowIcon("okklyButtonEndIcon")}</a>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: (args) => ({
    props: { ...args, colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; gap: 12px">
        @for (color of colors; track color) {
          <button okklyButton [color]="color">{{ color }}${arrowIcon("okklyButtonEndIcon")}</button>
        }
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; align-items: center; gap: 12px">
        @for (size of sizes; track size) {
          <button okklyButton [size]="size">{{ label }}${arrowIcon("okklyButtonEndIcon")}</button>
        }
      </div>`,
  }),
};
