import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { iconMic, iconMusic, iconPencil, iconPlus, iconUpload, iconX } from "@okkly/icons";
import { OkklyFab } from "./FAB";
import type { FabColor, FabSize, FabVariant } from "./FAB";

/**
 * Every input the template below binds, plus `ariaLabel` for the host's name and
 * `icon` for the projected glyph. `disableRipple` is the `OkklyRipple` host
 * directive's input, re-exposed on the button element.
 */
type FabArgs = {
  icon: string;
  ariaLabel?: string;
  label?: string;
  variant: FabVariant;
  color: FabColor;
  size: FabSize;
  disabled: boolean;
  disableRipple: boolean;
};

const bindings = `
    [attr.aria-label]="ariaLabel"
    [label]="label"
    [variant]="variant"
    [color]="color"
    [size]="size"
    [disabled]="disabled"
    [disableRipple]="disableRipple"`;

/**
 * Floating action button for the screen’s primary create/navigate action. Keep one FAB per view.
 *
 * `OkklyFab` decorates a native `<button>` or `<a>`, so the element keeps its own semantics and
 * event bindings. The glyph is the projected content; a `label` turns it into an extended pill.
 */
const meta: Meta<FabArgs> = {
  title: "Control/FAB",
  component: OkklyFab,
  decorators: [moduleMetadata({ imports: [OkklyFab] })],
  args: {
    icon: iconPlus,
    ariaLabel: "Add",
    variant: "standard",
    color: "primary",
    size: "medium",
    disabled: false,
    disableRipple: false,
  },
  argTypes: {
    icon: { control: false, description: "Projected content — the glyph." },
    ariaLabel: { control: "text", description: "The host's `aria-label` — its accessible name." },
    label: { control: "text" },
    variant: { control: "inline-radio", options: ["standard", "soft"] },
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
  parameters: { controls: { exclude: ["isNativeButton", "modifiers"] } },
  render: ({ icon, ...args }) => ({
    props: args,
    template: `<button okklyFab${bindings}>${icon}</button>`,
  }),
};

export default meta;
type Story = StoryObj<FabArgs>;

/**
 * This example shows standard.
 */
export const Standard: Story = {};
/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: { color: "dante", icon: iconMic, ariaLabel: "Record" },
};
/**
 * This example shows extended.
 */
export const Extended: Story = {
  args: { icon: iconMusic, label: "New track", ariaLabel: undefined },
};
/**
 * This example shows the soft variant.
 */
export const Soft: Story = { args: { variant: "soft", icon: iconPencil, ariaLabel: "Edit" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; gap: 16px">
        @for (color of colors; track color) {
          <button okklyFab [color]="color" [attr.aria-label]="'Add (' + color + ')'">${iconPlus}</button>
        }
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        @for (size of sizes; track size) {
          <button okklyFab [size]="size" [attr.aria-label]="'Add (' + size + ')'">${iconPlus}</button>
        }
      </div>`,
  }),
};

const dialLabel =
  "align-self: center; padding: 5px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: #16161a; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-sans, sans-serif); white-space: nowrap";
const dialRow =
  "position: absolute; left: 0; right: 0; display: flex; justify-content: flex-end; gap: 12px";

/** MUI ships `SpeedDial` as its own component on top of `Fab`; this design has no built-in prop for it — compose plain FABs absolutely-positioned instead. */
export const SpeedDial: Story = {
  name: "Speed dial (composed from plain Fabs)",
  render: () => ({
    template: `
      <div style="position: relative; width: 220px; height: 260px">
        <div style="${dialRow}; top: 0px">
          <span style="${dialLabel}">Import</span>
          <button okklyFab size="small" variant="soft" aria-label="Import">${iconUpload}</button>
        </div>
        <div style="${dialRow}; top: 58px">
          <span style="${dialLabel}">Record</span>
          <button okklyFab size="small" color="dante" aria-label="Record">${iconMic}</button>
        </div>
        <div style="${dialRow}; top: 116px">
          <span style="${dialLabel}">New track</span>
          <button okklyFab size="small" variant="soft" aria-label="New track">${iconMusic}</button>
        </div>
        <div style="position: absolute; top: 174px; right: 0">
          <button okklyFab aria-label="Close">${iconX}</button>
        </div>
      </div>`,
  }),
};

/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  render: ({ icon, ...args }) => ({
    props: args,
    template: `<a okklyFab href="https://okkly.dev"${bindings}>${icon}</a>`,
  }),
  args: { ariaLabel: "Create" },
};
