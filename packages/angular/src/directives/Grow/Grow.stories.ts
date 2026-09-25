import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../../components/Button/Button";
import { OkklyGrow } from "./Grow";
import type { GrowTimeout } from "./Grow";

/**
 * The Playground's controls, named apart from the directive's own members:
 * Storybook writes args onto the `component` instance, and an arg called
 * `timeout` would overwrite the `timeout` input signal. `open` is `in`.
 */
type GrowArgs = {
  open: boolean;
  appearOnFirstRender: boolean;
  timeoutMs: GrowTimeout;
  mountLazily: boolean;
  unmountWhenHidden: boolean;
};

const surface =
  "display: flex; flex-direction: column; gap: 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
// A real surface with a border, not a flat accent block: a scale transition is
// read from the edges, and an edge you cannot see does not move.
const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 14px; background: var(--okkly-bg-surface-raised); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm); box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)";
const item =
  "padding: 10px 14px; border-radius: 8px; color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * Scale and opacity together: the element starts at 75% and slightly squashed, and
 * settles into place as it fades in. It is the transition for things that come
 * *from* somewhere — a menu out of its trigger, a popover off its anchor, a card
 * out of the row it belongs to.
 *
 * The direction is `transform-origin`, which defaults to the centre. Set it on the
 * element to the corner nearest the trigger and the panel appears to unfold from
 * it; leave it in the middle and it simply arrives.
 *
 * `timeout` defaults to `"auto"` here, unlike the rest of the family: the duration
 * is derived from the element's height, so a tall menu takes longer than a short one
 * and both feel like the same speed. The scale runs at two-thirds of that duration
 * and, on the way out, starts a third of the way in — which is why the exit reads
 * as fading first and shrinking after.
 *
 * `okklyGrow` is a structural directive on the element it animates, with MUI's
 * Grow inputs in the microsyntax.
 */
const meta: Meta<GrowArgs> = {
  title: "Helpers/Transitions/Grow",
  component: OkklyGrow,
  decorators: [moduleMetadata({ imports: [OkklyGrow, OkklyButton] })],
  args: {
    open: true,
    appearOnFirstRender: true,
    timeoutMs: "auto",
    mountLazily: false,
    unmountWhenHidden: false,
  },
  argTypes: {
    open: { control: "boolean", description: "The `okklyGrow` input — MUI's `in`." },
    appearOnFirstRender: { control: "boolean", description: "Bound to `appear`." },
    timeoutMs: {
      control: "select",
      options: ["auto", 150, 300, 800],
      description: "Bound to `timeout`.",
    },
    mountLazily: { control: "boolean", description: "Bound to `mountOnEnter`." },
    unmountWhenHidden: { control: "boolean", description: "Bound to `unmountOnExit`." },
  },
  // The directive's own members are documented by Compodoc but must not be
  // set as args — see `GrowArgs`.
  parameters: {
    controls: {
      exclude: [
        "status",
        "in",
        "appear",
        "timeout",
        "easing",
        "delay",
        "mountOnEnter",
        "unmountOnExit",
        "enter",
        "entering",
        "entered",
        "exit",
        "exiting",
        "exited",
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <div
          *okklyGrow="open; appear: appearOnFirstRender; timeout: timeoutMs; mountOnEnter: mountLazily; unmountOnExit: unmountWhenHidden"
          style="${panel}"
        >Toggle \`open\` from the controls panel.</div>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<GrowArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * What it is for: a menu unfolding from the button that opened it. The
 * `transform-origin` is the top-left corner — the corner touching the trigger —
 * which is what ties the panel to the thing that produced it.
 *
 * `unmountOnExit` matters here rather than being a nicety: a closed menu that is
 * still in the DOM is still in the tab order.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}; gap: 8px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">
          {{ open ? "Close" : "Open" }} the menu
        </button>
        <div *okklyGrow="open; unmountOnExit: true" style="${panel}; padding: 6px; width: 220px; transform-origin: top left">
          <div style="${item}">Duplicate</div>
          <div style="${item}">Move to…</div>
          <div style="${item}">Rename</div>
          <div style="${item}">Delete</div>
        </div>
      </div>`,
  }),
};

/**
 * The same panel from four origins. Nothing else differs — the corner alone decides
 * whether it reads as coming from the top of the page or the bottom of it.
 */
export const TransformOrigin: Story = {
  name: "Transform origin",
  render: () => ({
    props: { open: true, origins: ["center center", "top left", "bottom right", "top center"] },
    template: `
      <div style="${surface}; width: 560px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay all four</button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
          @for (origin of origins; track origin) {
            <div *okklyGrow="open; timeout: 500" style="${panel}; font-family: var(--okkly-font-family-mono)" [style.transform-origin]="origin">{{ origin }}</div>
          }
        </div>
      </div>`,
  }),
};

/**
 * `"auto"` scales the duration with the element's height, so a four-line panel and a
 * one-line one feel like the same gesture. A fixed number gives them the same clock
 * instead, which makes the tall one look slow and the short one look abrupt.
 *
 * Prefer `"auto"` for anything whose size you do not control — a menu whose items
 * come from data, a popover whose body is user content.
 */
export const AutoDuration: Story = {
  name: "Auto duration",
  render: () => ({
    props: { open: true },
    template: `
      <div style="${surface}; width: 560px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay both columns</button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start">
          <div *okklyGrow="open; timeout: 'auto'" style="${panel}">Short, auto.</div>
          <div *okklyGrow="open; timeout: 300" style="${panel}">Short, 300ms.</div>
          <div *okklyGrow="open; timeout: 'auto'" style="${panel}">
            Tall, auto. Four lines of copy, which is enough for the derived duration to pull
            noticeably ahead of the short panel next to it — and that is the point: both still
            feel like one speed.
          </div>
          <div *okklyGrow="open; timeout: 300" style="${panel}">
            Tall, 300ms. The same four lines on a fixed clock, which arrives faster than its own
            size suggests it should and reads as clipped.
          </div>
        </div>
      </div>`,
  }),
};

/**
 * A fixed `timeout` when the gesture matters more than the content: a confirmation
 * chip that must be quick, a panel you want deliberately slow.
 */
export const Timeouts: Story = {
  render: () => ({
    props: { open: true, asymmetric: { enter: 200, exit: 800 } },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle all three</button>
        <div *okklyGrow="open; timeout: 150" style="${panel}">150ms</div>
        <div *okklyGrow="open; timeout: 400" style="${panel}">400ms</div>
        <div *okklyGrow="open; timeout: asymmetric" style="${panel}">Fast in, slow out</div>
      </div>`,
  }),
};

/**
 * A grid that grows in tile by tile, `delay` stepping with the index.
 */
export const Staggered: Story = {
  render: () => ({
    props: {
      open: true,
      tiles: ["Listeners", "Subscribers", "Churn", "Revenue", "Saves", "Comments"],
    },
    template: `
      <div style="${surface}; width: 560px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay the grid</button>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px">
          @for (tile of tiles; track tile; let index = $index) {
            <div *okklyGrow="open; timeout: 300; delay: index * 50" style="${panel}; padding: 14px">{{ tile }}</div>
          }
        </div>
        <p style="${caption}">Six tiles, 50ms apart — 250ms of stagger over a 300ms transition.</p>
      </div>`,
  }),
};
