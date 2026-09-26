import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../../components/Button/Button";
import { OkklyFade } from "./Fade";

/**
 * The Playground's controls. They are named apart from the directive's own
 * members on purpose: Storybook writes args onto the `component` instance, and
 * an arg called `timeout` would overwrite the `timeout` input signal. `open` is
 * `in`, which is also an operator in templates.
 */
type FadeArgs = {
  open: boolean;
  appearOnFirstRender: boolean;
  timeoutMs: number;
  mountLazily: boolean;
  unmountWhenHidden: boolean;
};

const surface =
  "display: flex; flex-direction: column; gap: 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
// A real surface, not a flat accent block: a transition is only legible against
// something that reads as part of the page.
const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 14px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * The plainest of the five: opacity from 0 to 1 and back. Reach for it when the
 * thing appearing is already in the right place and does not need to be pointed
 * at — swapping one panel for another, revealing a detail, dropping in a backdrop.
 *
 * It animates opacity and nothing else, so the element keeps its box the whole time
 * and the page never reflows. That is the reason to choose it over `Grow` or
 * `Zoom`: no movement means nothing next to it moves either. The flip side is that
 * a faded-out element still occupies its space and still takes clicks unless you
 * also pass `unmountOnExit`.
 *
 * `okklyFade` is a structural directive on the element it animates —
 * `<div *okklyFade="open; timeout: 300">` — with MUI's Fade inputs in the
 * microsyntax: `appear`, `timeout`, `easing`, `delay`, `mountOnEnter`, `unmountOnExit`.
 */
const meta: Meta<FadeArgs> = {
  title: "Helpers/Transitions/Fade",
  component: OkklyFade,
  decorators: [moduleMetadata({ imports: [OkklyFade, OkklyButton] })],
  args: {
    open: true,
    appearOnFirstRender: true,
    timeoutMs: 300,
    mountLazily: false,
    unmountWhenHidden: false,
  },
  argTypes: {
    open: { control: "boolean", description: "The `okklyFade` input — MUI's `in`." },
    appearOnFirstRender: { control: "boolean", description: "Bound to `appear`." },
    timeoutMs: { control: "number", description: "Bound to `timeout`." },
    mountLazily: { control: "boolean", description: "Bound to `mountOnEnter`." },
    unmountWhenHidden: { control: "boolean", description: "Bound to `unmountOnExit`." },
  },
  // The directive's own members are documented by Compodoc but must not be
  // set as args — see `FadeArgs`.
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
          *okklyFade="open; appear: appearOnFirstRender; timeout: timeoutMs; mountOnEnter: mountLazily; unmountOnExit: unmountWhenHidden"
          style="${panel}"
        >Toggle \`open\` from the controls panel.</div>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<FadeArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The everyday use: a detail panel that is not worth a page of its own. The row
 * above it does not move, because opacity costs no layout.
 */
export const RevealingADetail: Story = {
  name: "Revealing a detail",
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">
          {{ open ? "Hide the details" : "Show the details" }}
        </button>
        <div *okklyFade="open; timeout: 200" style="${panel}">
          Built from a single token pipeline. Every colour here is a variable, which is why the
          panel keeps working when the theme changes underneath it.
        </div>
      </div>`,
  }),
};

/**
 * Two panels in the same slot, one fading out as the other fades in. Stack them in
 * a grid cell rather than sequencing them: overlapping is what makes it read as one
 * thing changing rather than two things flickering.
 */
export const CrossFade: Story = {
  name: "Cross-fade",
  render: () => ({
    props: { showing: "summary" },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="showing = showing === 'summary' ? 'raw' : 'summary'">
          Show the {{ showing === "summary" ? "raw payload" : "summary" }}
        </button>
        <div style="display: grid; grid-template-areas: 'stack'">
          <div *okklyFade="showing === 'summary'; timeout: 250" style="${panel}; grid-area: stack">
            48,120 listeners this month, up 12.5% on the last.
          </div>
          <div *okklyFade="showing === 'raw'; timeout: 250" style="${panel}; grid-area: stack; font-family: var(--okkly-font-family-mono)">
            {{ '{ "listeners": 48120, "delta": 0.125 }' }}
          </div>
        </div>
      </div>`,
  }),
};

/**
 * A faded-out element is still in the document: it holds its space and still answers
 * to the mouse. `unmountOnExit` removes it once the animation finishes, and
 * `mountOnEnter` keeps it out of the tree until it is first needed.
 *
 * Use both for anything expensive or focusable. Leave both off when the element is
 * cheap and you want its box reserved — a placeholder that must not move the layout
 * when it arrives.
 */
export const Unmounting: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle both panels</button>
        <div *okklyFade="open; timeout: 300" style="${panel}">Kept mounted — inspect the DOM while it is hidden.</div>
        <div *okklyFade="open; timeout: 300; mountOnEnter: true; unmountOnExit: true" style="${panel}">
          Mounted on enter, removed on exit.
        </div>
        <p style="${caption}">Only the first panel exists in the DOM when both are hidden.</p>
      </div>`,
  }),
};

/**
 * `timeout` takes one number for both directions or `{ enter, exit }` for each.
 * Asymmetric is usually right: arriving should be quick enough not to be waited
 * for, leaving slow enough to be noticed.
 */
export const Timeouts: Story = {
  render: () => ({
    props: { open: true, asymmetric: { enter: 150, exit: 600 } },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle all three</button>
        <div *okklyFade="open; timeout: 120" style="${panel}">120ms — barely a transition, just not a jump.</div>
        <div *okklyFade="open; timeout: 300" style="${panel}">300ms — the default weight.</div>
        <div *okklyFade="open; timeout: asymmetric" style="${panel}">Fast in, slow out.</div>
      </div>`,
  }),
};

/**
 * `delay` holds each element back, so a stagger is just an index times a step. Keep
 * the step small and cap the total: past about half a second the last row feels
 * broken rather than choreographed.
 */
export const Staggered: Story = {
  render: () => ({
    props: { open: true, rows: ["Night drive", "Long exposure", "Signal", "Harbour lights"] },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay the list</button>
        @for (row of rows; track row; let index = $index) {
          <div *okklyFade="open; timeout: 250; delay: index * 60" style="${panel}; padding: 12px 20px">{{ row }}</div>
        }
      </div>`,
  }),
};

/**
 * `appear` decides whether an element that starts shown animates on its first
 * render. Leave it on for something the user just navigated to; turn it off for
 * content that was always there, so the page does not fade in around them.
 */
export const Appear: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <div *okklyFade="true; appear: true; timeout: 600" style="${panel}">appear — fades in when this story mounts.</div>
        <div *okklyFade="true; appear: false; timeout: 600" style="${panel}">appear: false — simply there.</div>
        <p style="${caption}">Reload the story to see the difference; both end in the same place.</p>
      </div>`,
  }),
};
