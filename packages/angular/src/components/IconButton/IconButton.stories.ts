import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyIconButton } from "./IconButton";
import type { IconButtonColor, IconButtonSize, IconButtonVariant } from "./IconButton";

/** `iconPlus` / `iconX` from `@okkly/icons`, inlined so the projected glyph is visible in the snippet. */
const plusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>`;

/**
 * Every input the template below binds, plus `ariaLabel` for the host's name.
 * `disableRipple` is the `OkklyRipple` host directive's input, re-exposed on the
 * button element.
 */
type IconButtonArgs = {
  ariaLabel: string;
  variant: IconButtonVariant;
  color: IconButtonColor;
  size: IconButtonSize;
  disabled: boolean;
  disableRipple: boolean;
};

const bindings = `
    [attr.aria-label]="ariaLabel"
    [variant]="variant"
    [color]="color"
    [size]="size"
    [disabled]="disabled"
    [disableRipple]="disableRipple"`;

const button = (icon = plusIcon) => ({
  template: `<button okklyIconButton${bindings}>${icon}</button>`,
});

/**
 * Icon-only control for toolbars and dense UIs. Always provide an accessible name via `aria-label` or a Tooltip.
 *
 * `OkklyIconButton` decorates a native `<button>` or `<a>` rather than wrapping one, so the
 * element keeps its own semantics and event bindings. The glyph is the projected content.
 */
const meta: Meta<IconButtonArgs> = {
  title: "Control/IconButton",
  component: OkklyIconButton,
  decorators: [moduleMetadata({ imports: [OkklyIconButton] })],
  args: {
    ariaLabel: "Add",
    variant: "ghost",
    color: "primary",
    size: "medium",
    disabled: false,
    disableRipple: false,
  },
  argTypes: {
    ariaLabel: { control: "text", description: "The host's `aria-label` — its accessible name." },
    variant: { control: "inline-radio", options: ["ghost", "glass", "solid"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableRipple: {
      control: "boolean",
      description:
        "Whether the ripple effect is disabled. Provided by the `OkklyRipple` host directive.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  render: (args) => ({ props: args, ...button() }),
};

export default meta;
type Story = StoryObj<IconButtonArgs>;

/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = {};
/**
 * This example shows the glass variant.
 */
export const Glass: Story = { args: { variant: "glass" } };
/**
 * This example shows solid.
 */
export const Solid: Story = {
  args: { variant: "solid", ariaLabel: "Close" },
  render: (args) => ({ props: args, ...button(closeIcon) }),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        @for (size of sizes; track size) {
          <button okklyIconButton [size]="size" [attr.aria-label]="'Add (' + size + ')'">${plusIcon}</button>
        }
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; gap: 16px">
        @for (color of colors; track color) {
          <button okklyIconButton [color]="color" variant="glass" [attr.aria-label]="'Add (' + color + ')'">${plusIcon}</button>
        }
      </div>`,
  }),
};

/**
 * This example shows the component used as a link. An anchor cannot be disabled
 * natively, so a disabled one gets `aria-disabled`, `tabindex="-1"`, and swallowed clicks.
 */
export const AsLink: Story = {
  args: { ariaLabel: "Create" },
  render: (args) => ({
    props: args,
    template: `<a okklyIconButton href="https://okkly.dev"${bindings}>${plusIcon}</a>`,
  }),
};
