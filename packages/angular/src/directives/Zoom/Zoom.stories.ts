import { iconCheck, iconHeart, iconPlus, iconShare } from "@okkly/icons";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../../components/Button/Button";
import { OkklyIcon } from "../../components/Icon/Icon";
import { OkklyZoom } from "./Zoom";

/**
 * The Playground's controls, named apart from the directive's own members:
 * Storybook writes args onto the `component` instance, and an arg called
 * `timeout` would overwrite the `timeout` input signal. `open` is `in`.
 */
type ZoomArgs = {
  open: boolean;
  appearOnFirstRender: boolean;
  timeoutMs: number;
  mountLazily: boolean;
  unmountWhenHidden: boolean;
};

const surface =
  "display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
// A round accent button rather than a flat block of colour: zoom is read from the
// silhouette, and a circle growing out of a point is the shape this transition was
// designed around.
const fab =
  "display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: var(--okkly-accent-primary); color: var(--okkly-bg-base); box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)";
const panel =
  "padding: 20px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 14px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";
const icons = { plus: iconPlus, heart: iconHeart, share: iconShare, check: iconCheck };

/**
 * Scale from nothing to full size. Unlike `Grow` it does not touch opacity and does
 * not start part-way — the element grows out of a point, which makes it the loudest
 * of the five and the wrong choice for anything the user did not just ask for.
 *
 * Use it on small, self-contained things where the arrival is the message: a
 * floating action button appearing, a badge landing on a count, a checkmark
 * replacing a spinner. On a large panel the same scale reads as the page lurching.
 *
 * Because it is pure `transform`, it costs no layout: the element's box is reserved
 * the whole time. Two zooms can therefore share one slot and swap without anything
 * around them moving — which is the `SwappingIcons` story below.
 *
 * `okklyZoom` is a structural directive on the element it animates, with MUI's
 * Zoom inputs in the microsyntax.
 */
const meta: Meta<ZoomArgs> = {
  title: "Helpers/Transitions/Zoom",
  component: OkklyZoom,
  decorators: [moduleMetadata({ imports: [OkklyZoom, OkklyButton, OkklyIcon] })],
  args: {
    open: true,
    appearOnFirstRender: true,
    timeoutMs: 300,
    mountLazily: false,
    unmountWhenHidden: false,
  },
  argTypes: {
    open: { control: "boolean", description: "The `okklyZoom` input — MUI's `in`." },
    appearOnFirstRender: { control: "boolean", description: "Bound to `appear`." },
    timeoutMs: { control: "number", description: "Bound to `timeout`." },
    mountLazily: { control: "boolean", description: "Bound to `mountOnEnter`." },
    unmountWhenHidden: { control: "boolean", description: "Bound to `unmountOnExit`." },
  },
  // The directive's own members are documented by Compodoc but must not be
  // set as args — see `ZoomArgs`.
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
    props: { ...args, icons },
    template: `
      <div style="${surface}">
        <div
          *okklyZoom="open; appear: appearOnFirstRender; timeout: timeoutMs; mountOnEnter: mountLazily; unmountOnExit: unmountWhenHidden"
          style="${fab}"
        ><okkly-icon [icon]="icons.plus" /></div>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ZoomArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The archetype: a floating action button that belongs to one tab and leaves with
 * it. `unmountOnExit` is what keeps the hidden button out of the tab order — a
 * scaled-to-zero element is still focusable.
 */
export const AFloatingAction: Story = {
  name: "A floating action",
  render: () => ({
    props: { tab: "library", icons },
    template: `
      <div style="${surface}">
        <div style="display: flex; gap: 8px">
          <button okklyButton size="small" [variant]="tab === 'library' ? 'primary' : 'ghost'" (click)="tab = 'library'">Library</button>
          <button okklyButton size="small" [variant]="tab === 'settings' ? 'primary' : 'ghost'" (click)="tab = 'settings'">Settings</button>
        </div>
        <div style="${panel}; position: relative; width: 100%; height: 160px; box-sizing: border-box">
          {{ tab === "library" ? "Add a track to the library." : "Nothing to add here." }}
          <div *okklyZoom="tab === 'library'; unmountOnExit: true" style="${fab}; position: absolute; right: 20px; bottom: 20px">
            <okkly-icon [icon]="icons.plus" />
          </div>
        </div>
        <p style="${caption}">Tab into the panel on Settings: there is no button to reach.</p>
      </div>`,
  }),
};

/**
 * Two zooms sharing one grid cell, with the exit timed shorter than the enter so
 * the outgoing icon is gone before the incoming one is at full size. Nothing moves
 * around them because neither icon ever gives up its box.
 */
export const SwappingIcons: Story = {
  name: "Swapping icons",
  render: () => ({
    props: { saved: false, icons, swap: { enter: 300, exit: 150 } },
    template: `
      <div style="${surface}">
        <div style="display: grid; grid-template-areas: 'stack'; place-items: center">
          <div *okklyZoom="!saved; timeout: swap" style="${fab}; grid-area: stack"><okkly-icon [icon]="icons.heart" /></div>
          <div *okklyZoom="saved; timeout: swap" style="${fab}; grid-area: stack; background: var(--okkly-accent-secondary)">
            <okkly-icon [icon]="icons.check" />
          </div>
        </div>
        <button okklyButton size="small" variant="secondary" (click)="saved = !saved">
          {{ saved ? "Remove from the library" : "Save to the library" }}
        </button>
      </div>`,
  }),
};

/**
 * Zoom is at its best on something small. The same transition on a full-width panel
 * is the second row here — it is not broken, it is just too much movement for the
 * amount of information that changed. Use `Fade` or `Grow` there instead.
 */
export const SizeMatters: Story = {
  name: "Size matters",
  render: () => ({
    props: { open: true, icons },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay both</button>
        <div *okklyZoom="open; timeout: 300" style="${fab}"><okkly-icon [icon]="icons.share" /></div>
        <div *okklyZoom="open; timeout: 300" style="${panel}; width: 100%; box-sizing: border-box">
          A whole panel zooming. Compare it with the button above: the same transformation, and
          only one of them reads as intentional.
        </div>
      </div>`,
  }),
};

/**
 * Zoom takes the same `timeout` shapes as the rest of the family. A single number
 * for both directions, or `{ enter, exit }` when the swap needs the outgoing element
 * out of the way first.
 */
export const Timeouts: Story = {
  render: () => ({
    props: { open: true, icons, asymmetric: { enter: 200, exit: 700 } },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle all three</button>
        <div style="display: flex; gap: 20px">
          <div *okklyZoom="open; timeout: 150" style="${fab}"><okkly-icon [icon]="icons.plus" /></div>
          <div *okklyZoom="open; timeout: 400" style="${fab}"><okkly-icon [icon]="icons.heart" /></div>
          <div *okklyZoom="open; timeout: asymmetric" style="${fab}"><okkly-icon [icon]="icons.share" /></div>
        </div>
        <p style="${caption}">150ms, 400ms, and fast-in/slow-out.</p>
      </div>`,
  }),
};

/**
 * A row of actions arriving one after another. Sixty milliseconds between them is
 * enough to read as a sequence; much more and the last one looks like it was
 * forgotten.
 */
export const Staggered: Story = {
  render: () => ({
    props: { open: true, actions: [iconPlus, iconHeart, iconShare, iconCheck] },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay the row</button>
        <div style="display: flex; gap: 16px">
          @for (svg of actions; track $index; let index = $index) {
            <div *okklyZoom="open; timeout: 250; delay: index * 60" style="${fab}; width: 44px; height: 44px">
              <okkly-icon [icon]="svg" />
            </div>
          }
        </div>
      </div>`,
  }),
};
