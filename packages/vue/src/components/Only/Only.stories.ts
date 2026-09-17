import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Only from "./Only.vue";
import type { OnlyBreakpoint, OnlyProps } from "./Only.types";

/**
 * Mounts its default slot only while the viewport falls within `[from, to)` —
 * `from` is inclusive, `to` is exclusive, and both are optional. Breakpoint
 * names (`2xs`, `xs`, `sm`, `md`, `lg`, `xl`) match `$breakpoints` in the
 * design system's `breakpoints.scss`.
 *
 * Unlike hiding with CSS, content outside the range is never rendered — no
 * layout cost, no hidden interactive elements sitting in the tab order.
 * Resize the preview panel (or your browser) to see it mount and unmount.
 */
const meta: Meta<OnlyProps> = {
  title: "Helpers/Only",
  component: Only,
  args: {
    from: "sm",
    to: "md",
  },
  argTypes: {
    from: { control: "select", options: [undefined, "2xs", "xs", "sm", "md", "lg", "xl"] },
    to: { control: "select", options: [undefined, "2xs", "xs", "sm", "md", "lg", "xl"] },
  },
  render: (args) => ({
    components: { Only },
    setup: () => ({ args, surface, panel, caption }),
    template: `
      <div :style="surface">
        <Only :from="args.from" :to="args.to">
          <div :style="panel">Visible from {{ args.from ?? "the start" }} up to {{ args.to ?? "infinity" }}.</div>
        </Only>
        <p :style="caption">Resize the window to see this mount and unmount.</p>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<OnlyProps>;

const surface = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 14px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm)";

const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

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
    components: { Only },
    setup: () => ({
      surface,
      panel,
      caption,
      ranges: [
        { to: "xs" as OnlyBreakpoint, label: "Below xs (2xs phones)" },
        { from: "xs" as OnlyBreakpoint, to: "sm" as OnlyBreakpoint, label: "xs — small phones" },
        { from: "sm" as OnlyBreakpoint, to: "md" as OnlyBreakpoint, label: "sm — tablets" },
        { from: "md" as OnlyBreakpoint, to: "lg" as OnlyBreakpoint, label: "md — small desktops" },
        { from: "lg" as OnlyBreakpoint, to: "xl" as OnlyBreakpoint, label: "lg — desktops" },
        { from: "xl" as OnlyBreakpoint, label: "xl and up — wide desktops" },
      ],
    }),
    template: `
      <div :style="surface">
        <Only v-for="range in ranges" :key="range.label" :from="range.from" :to="range.to">
          <div :style="panel">{{ range.label }}</div>
        </Only>
        <p :style="caption">Resize the window — exactly one panel is mounted at a time.</p>
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
    components: { Only },
    setup: () => ({ surface, panel }),
    template: `
      <div :style="surface">
        <Only to="sm">
          <div :style="panel">Only to="sm", from unset — shown up to sm.</div>
        </Only>
        <Only from="lg">
          <div :style="panel">Only from="lg", to unset — shown from lg up.</div>
        </Only>
        <Only>
          <div :style="panel">Neither bound — always rendered.</div>
        </Only>
      </div>`,
  }),
};
