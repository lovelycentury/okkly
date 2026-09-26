import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyOnly } from "./Only";
import type { OnlyBreakpoint } from "./Only";

/** The two bounds, bound as the directive's `{ from, to }` range. */
type OnlyArgs = {
  from?: OnlyBreakpoint;
  to?: OnlyBreakpoint;
};

const surface =
  "display: flex; flex-direction: column; gap: 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 14px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

const breakpoints = [undefined, "2xs", "xs", "sm", "md", "lg", "xl"];

/**
 * Mounts its element only while the viewport falls within `[from, to)` —
 * `from` is inclusive, `to` is exclusive, and both are optional. Breakpoint
 * names (`2xs`, `xs`, `sm`, `md`, `lg`, `xl`) match `$breakpoints` in the
 * design system's `breakpoints.scss`.
 *
 * Unlike hiding with CSS, content outside the range is never rendered — no
 * layout cost, no hidden interactive elements sitting in the tab order.
 * Resize the preview panel (or your browser) to see it mount and unmount.
 */
const meta: Meta<OnlyArgs> = {
  title: "Helpers/Only",
  component: OkklyOnly,
  decorators: [moduleMetadata({ imports: [OkklyOnly] })],
  args: {
    from: "sm",
    to: "md",
  },
  argTypes: {
    from: { control: "select", options: breakpoints },
    to: { control: "select", options: breakpoints },
  },
  parameters: { controls: { exclude: ["range"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <div *okklyOnly="{ from: from, to: to }" style="${panel}">
          Visible from {{ from ?? "the start" }} up to {{ to ?? "infinity" }}.
        </div>
        <p style="${caption}">Resize the window to see this mount and unmount.</p>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<OnlyArgs>;

/**
 * Play with `from` and `to` from the controls panel, then resize the preview.
 */
export const Playground: Story = {};

/**
 * Every range at once, so resizing the window shows exactly one panel at a
 * time — the same partition a `switch` on breakpoint name would produce.
 */
export const AllRanges: Story = {
  name: "All ranges",
  render: () => ({
    props: {
      ranges: [
        { to: "xs", label: "Below xs (2xs phones)" },
        { from: "xs", to: "sm", label: "xs — small phones" },
        { from: "sm", to: "md", label: "sm — tablets" },
        { from: "md", to: "lg", label: "md — small desktops" },
        { from: "lg", to: "xl", label: "lg — desktops" },
        { from: "xl", label: "xl and up — wide desktops" },
      ],
    },
    template: `
      <div style="${surface}">
        @for (range of ranges; track range.label) {
          <div *okklyOnly="range" style="${panel}">{{ range.label }}</div>
        }
        <p style="${caption}">Resize the window — exactly one panel is mounted at a time.</p>
      </div>`,
  }),
};

/**
 * `from` alone means "this breakpoint and up"; `to` alone means "up to this
 * breakpoint". Neither given means "always" — useful as an escape hatch when
 * a range is computed and can end up empty.
 */
export const OpenEnded: Story = {
  name: "Open-ended ranges",
  render: () => ({
    template: `
      <div style="${surface}">
        <div *okklyOnly="{ to: 'sm' }" style="${panel}">Only from=undefined — shown up to sm.</div>
        <div *okklyOnly="{ from: 'lg' }" style="${panel}">Only to=undefined — shown from lg up.</div>
        <div *okklyOnly style="${panel}">Neither bound — always rendered.</div>
      </div>`,
  }),
};
