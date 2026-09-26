import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../../components/Button/Button";
import { OkklySlide } from "./Slide";
import type { SlideDirection } from "./Slide";

/**
 * The Playground's controls, named apart from the directive's own members:
 * Storybook writes args onto the `component` instance, and an arg called
 * `direction` would overwrite the `direction` input signal. `open` is `in`.
 */
type SlideArgs = {
  open: boolean;
  appearOnFirstRender: boolean;
  from: SlideDirection;
  timeoutMs: number;
  mountLazily: boolean;
  unmountWhenHidden: boolean;
};

const surface =
  "display: flex; flex-direction: column; gap: 16px; width: 460px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
// `overflow: hidden` is not decoration — it is what turns the stage into an edge
// for the element to come from. Without it the panel is visible for the whole trip
// and drags the page's scrollbars along with it.
const stage =
  "position: relative; display: flex; overflow: hidden; padding: 16px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 16px; background: var(--okkly-bg-inset)";
const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 12px; background: var(--okkly-bg-surface-raised); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm); box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * Movement from off-screen to in place. `direction` is where the element comes
 * *from*, not where it goes: `direction: 'up'` means it enters travelling upward,
 * from below the edge.
 *
 * The one thing to know before using it: the offset is measured against the
 * viewport, so by default the element is parked outside the window and travels the
 * whole distance in. That is right for a drawer or a sheet, which are fixed to an
 * edge anyway. For a panel that lives inside a box, pass `container` — a template
 * reference to the element whose edge it should hide behind — and give that element
 * `overflow: hidden`, or the panel will fly across the page and push the document's
 * scrollbars out.
 *
 * Slide moves but does not fade: the element is at full opacity for the entire trip.
 *
 * `okklySlide` is a structural directive on the element it animates, with MUI's
 * Slide inputs in the microsyntax.
 */
const meta: Meta<SlideArgs> = {
  title: "Helpers/Transitions/Slide",
  component: OkklySlide,
  decorators: [moduleMetadata({ imports: [OkklySlide, OkklyButton] })],
  args: {
    open: true,
    appearOnFirstRender: true,
    from: "down",
    timeoutMs: 400,
    mountLazily: false,
    unmountWhenHidden: false,
  },
  argTypes: {
    open: { control: "boolean", description: "The `okklySlide` input — MUI's `in`." },
    appearOnFirstRender: { control: "boolean", description: "Bound to `appear`." },
    from: {
      control: "inline-radio",
      options: ["left", "right", "up", "down"],
      description: "Bound to `direction`.",
    },
    timeoutMs: { control: "number", description: "Bound to `timeout`." },
    mountLazily: { control: "boolean", description: "Bound to `mountOnEnter`." },
    unmountWhenHidden: { control: "boolean", description: "Bound to `unmountOnExit`." },
  },
  // The directive's own members are documented by Compodoc but must not be
  // set as args — see `SlideArgs`.
  parameters: {
    controls: {
      exclude: [
        "status",
        "in",
        "appear",
        "direction",
        "container",
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
        <div #stage style="${stage}; height: 180px">
          <div
            *okklySlide="open; appear: appearOnFirstRender; direction: from; container: stage; timeout: timeoutMs; mountOnEnter: mountLazily; unmountOnExit: unmountWhenHidden"
            style="${panel}"
          >Toggle \`open\` and change \`from\` from the controls.</div>
        </div>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SlideArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The reason the directive exists: a panel anchored to an edge, entering from that
 * edge. This is `Drawer` in miniature — a fixed sheet and the slide carrying it in.
 *
 * The stage below stands in for the viewport, which is what `container` is for.
 */
export const ASheet: Story = {
  name: "A sheet",
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">
          {{ open ? "Close" : "Open" }} the sheet
        </button>
        <div #stage style="${stage}; height: 220px; padding: 0">
          <div style="padding: 16px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">The page underneath.</div>
          <div
            *okklySlide="open; direction: 'left'; container: stage; timeout: 300"
            style="${panel}; position: absolute; inset: 0 0 0 auto; width: 220px; border-radius: 0"
          >A sheet on the right edge, entering leftward.</div>
        </div>
      </div>`,
  }),
};

/**
 * All four directions against the same stage. Read each label as the side the panel
 * comes *from*: `direction: 'right'` starts off the left edge and travels right.
 */
export const Directions: Story = {
  render: () => ({
    props: { open: true, directions: ["down", "up", "left", "right"] },
    template: `
      <div style="${surface}; width: 600px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay all four</button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
          @for (direction of directions; track direction) {
            <div #stage style="${stage}; height: 130px; align-items: center; justify-content: center">
              <div
                *okklySlide="open; direction: direction; container: stage; timeout: 400"
                style="${panel}; font-family: var(--okkly-font-family-mono)"
              >{{ direction }}</div>
            </div>
          }
        </div>
      </div>`,
  }),
};

/**
 * Without `container` the element is parked outside the *window*, so it travels the
 * full width of the viewport and is visible the whole way. On a page that scrolls,
 * that also means a horizontal scrollbar for the duration of the animation.
 *
 * The two stages below differ in nothing but that input. Give it the box you want
 * the panel to hide behind — and give that box `overflow: hidden`.
 */
export const TheContainerProp: Story = {
  name: "The container input",
  render: () => ({
    props: { open: true },
    // Pushed to the right edge on purpose: against the left of the page the
    // container's edge and the window's are almost the same place.
    template: `
      <div style="display: flex; justify-content: flex-end; width: 100%">
        <div style="${surface}; width: 380px">
          <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay both</button>
          <div #stage style="${stage}; height: 120px; align-items: center">
            <div *okklySlide="open; direction: 'right'; container: stage; timeout: 500" style="${panel}">
              With container — hides behind this edge.
            </div>
          </div>
          <div style="${stage}; height: 120px; align-items: center">
            <div *okklySlide="open; direction: 'right'; timeout: 500" style="${panel}">
              Without — travels from the window edge.
            </div>
          </div>
          <p style="${caption}">The second panel starts further out and arrives late, having crossed the page.</p>
        </div>
      </div>`,
  }),
};

/**
 * Slide keeps the element at full opacity, which is what makes it feel physical.
 * `timeout` takes one number or `{ enter, exit }`.
 */
export const Timeouts: Story = {
  render: () => ({
    props: { open: true, asymmetric: { enter: 250, exit: 800 } },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle all three</button>
        <div #stage style="${stage}; flex-direction: column; gap: 12px">
          <div *okklySlide="open; direction: 'right'; container: stage; timeout: 200" style="${panel}">200ms</div>
          <div *okklySlide="open; direction: 'right'; container: stage; timeout: 500" style="${panel}">500ms</div>
          <div *okklySlide="open; direction: 'right'; container: stage; timeout: asymmetric" style="${panel}">Fast in, slow out</div>
        </div>
      </div>`,
  }),
};

/**
 * A list dealing itself in, `delay` stepping with the index.
 */
export const Staggered: Story = {
  render: () => ({
    props: { open: true, rows: ["Night drive", "Long exposure", "Signal", "Harbour lights"] },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay the list</button>
        <div #stage style="${stage}; flex-direction: column; gap: 10px">
          @for (row of rows; track row; let index = $index) {
            <div
              *okklySlide="open; direction: 'right'; container: stage; timeout: 300; delay: index * 70"
              style="${panel}; padding: 12px 16px"
            >{{ row }}</div>
          }
        </div>
      </div>`,
  }),
};
