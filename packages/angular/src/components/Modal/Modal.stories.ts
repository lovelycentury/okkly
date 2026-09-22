import { signal } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyModal } from "./Modal";

/** Every input the templates below bind. */
type ModalArgs = {
  hideBackdrop: boolean;
  keepMounted: boolean;
  disablePortal: boolean;
  disableEscapeKeyDown: boolean;
  disableAutoFocus: boolean;
  disableEnforceFocus: boolean;
  disableRestoreFocus: boolean;
  disableScrollLock: boolean;
  modalClass: string;
  backdropClass: string;
};

const surface = `display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)`;

// Modal fills the viewport and stacks its content on the backdrop; it does not
// place it. Anything that should sit in the middle needs its own centring layer.
const centred = `position: absolute; inset: 0; display: grid; place-items: center; padding: 24px`;

const paper = `display: grid; gap: 16px; justify-items: start; width: min(420px, 100%); padding: 24px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 18px; background: var(--okkly-bg-surface-raised); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm); box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.6)`;

const caption = `margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)`;

const bindings = `
    [hideBackdrop]="hideBackdrop"
    [keepMounted]="keepMounted"
    [disablePortal]="disablePortal"
    [disableEscapeKeyDown]="disableEscapeKeyDown"
    [disableAutoFocus]="disableAutoFocus"
    [disableEnforceFocus]="disableEnforceFocus"
    [disableRestoreFocus]="disableRestoreFocus"
    [disableScrollLock]="disableScrollLock"
    [modalClass]="modalClass"
    [backdropClass]="backdropClass"`;

/**
 * The plumbing behind every modal overlay, and nothing else: a portal, a backdrop,
 * a focus trap, a scroll lock, Escape handling, and focus put back where it came
 * from when you close.
 *
 * **It draws no surface of its own.** That is deliberate and it is the whole point
 * of the component — Modal is what a dialog and a drawer are built on, and each
 * brings its own chrome. If you render `<okkly-modal>` with some text in it, you get
 * that text floating on the backdrop with no panel behind it. To get a panel, put
 * your own element inside with your own background, padding and radius: that is the
 * `YourOwnDialog` story below, and it is the intended way to use this directly.
 *
 * Reach for Modal when you need a shape a plain dialog does not have — a lightbox, a
 * command palette, a full-bleed media viewer.
 *
 * Inputs follow MUI's Modal name-for-name. Deliberate gaps: no `sx`/`classes`, no
 * `closeAfterTransition` — with no built-in transition to wait on, a consumer that
 * animates keeps itself mounted with `keepMounted`. MUI's `slotProps.backdrop`
 * narrows to `backdropClass`, and `onClose(event, reason)` becomes the `close`
 * output, carrying the same pair as one object.
 */
const meta: Meta<ModalArgs> = {
  title: "Overlays/Modal",
  component: OkklyModal,
  decorators: [moduleMetadata({ imports: [OkklyModal, OkklyButton] })],
  args: {
    hideBackdrop: false,
    keepMounted: false,
    disablePortal: false,
    disableEscapeKeyDown: false,
    disableAutoFocus: false,
    disableEnforceFocus: false,
    disableRestoreFocus: false,
    disableScrollLock: false,
    modalClass: "",
    backdropClass: "",
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here. `booleanAttribute` inputs need an explicit
  // one — their compiled default reads as the whole `input()` call, which
  // Storybook cannot infer a toggle from.
  argTypes: {
    hideBackdrop: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    keepMounted: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disablePortal: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableEscapeKeyDown: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableAutoFocus: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableEnforceFocus: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableRestoreFocus: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableScrollLock: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    modalClass: { control: "text" },
    backdropClass: { control: "text" },
  },
  parameters: { controls: { exclude: ["open", "container", "close"] } },
  render: (args) => ({
    props: { ...args, open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" (click)="open.set(true)">Open the modal</button>
        <okkly-modal [open]="open()" (close)="open.set(false)"${bindings}>
          <div style="${centred}">
            <div style="${paper}">
              <p style="margin: 0">
                This panel is a plain div in the story, not something Modal drew. Escape, the
                backdrop and the focus trap are Modal's.
              </p>
              <button okklyButton size="small" variant="secondary" (click)="open.set(false)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ModalArgs>;

/**
 * Play with every input from the controls panel.
 */
export const Playground: Story = {};

/**
 * The recipe. Modal gives you the behaviour; the surface is yours.
 *
 * Three things the panel has to bring itself, because the component deliberately
 * does not:
 *
 * 1. **Position.** Modal covers the viewport and stacks content over the backdrop
 *    — it does not centre it. The wrapper below is what does.
 * 2. **A surface.** Background, border, radius, shadow, padding. Without them the
 *    content sits directly on the scrim.
 * 3. **The dialog semantics.** `role="dialog"`, `aria-modal="true"` and a label —
 *    `aria-labelledby` pointing at your heading, or `aria-label` if there is none.
 *    Modal's own root is `role="presentation"`, so nothing announces this as a
 *    dialog until you say so.
 */
export const YourOwnDialog: Story = {
  name: "Your own dialog",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" (click)="open.set(true)">Open a hand-built dialog</button>
        <okkly-modal [open]="open()" (close)="open.set(false)">
          <div style="${centred}">
            <div style="${paper}" role="dialog" aria-modal="true" aria-labelledby="own-dialog-title">
              <h2
                id="own-dialog-title"
                style="margin: 0; font-size: var(--okkly-font-size-lg); color: var(--okkly-text-primary)"
              >Built by hand</h2>
              <p style="margin: 0">
                Everything visible here — the panel, the centring, the heading — is in the
                story. Modal contributed the portal, the scrim, the focus trap, the scroll
                lock and Escape.
              </p>
              <button okklyButton size="small" variant="secondary" (click)="open.set(false)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * What "no chrome" actually looks like. The same content with no wrapper of its own
 * lands in the top-left corner, unstyled, on the scrim.
 *
 * This is not a bug to work around — it is the contract. A component that painted a
 * panel could not be the base of a drawer, which is anchored to an edge, or of a
 * lightbox, which has no panel at all.
 */
export const NoSurfaceOfItsOwn: Story = {
  name: "No surface of its own",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open.set(true)">
          Open with no panel
        </button>
        <okkly-modal [open]="open()" (close)="open.set(false)">
          <p style="color: var(--okkly-text-primary); font-family: var(--okkly-font-family-sans)">
            Bare content. Press Escape to close.
          </p>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * A shape a plain centred dialog does not have: a full-bleed viewer with no panel,
 * closing on any click. This is the case Modal exists for.
 */
export const ALightbox: Story = {
  name: "A lightbox",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" (click)="open.set(true)">Open the viewer</button>
        <okkly-modal
          [open]="open()"
          (close)="open.set(false)"
          backdropClass="okkly-story-backdrop--lightbox"
        >
          <div style="${centred}; cursor: zoom-out" (click)="open.set(false)">
            <div style="display: grid; place-items: center; width: min(560px, 90vw); aspect-ratio: 16 / 10; border-radius: 12px; background: linear-gradient(140deg, #1b2f3a, #3a1b2f); color: var(--okkly-text-muted); font-family: var(--okkly-font-family-mono); font-size: var(--okkly-font-size-sm)">
              the artwork
            </div>
          </div>
        </okkly-modal>
        <p style="${caption}">Click anywhere, or press Escape.</p>
      </div>`,
  }),
};

/**
 * `backdropClass` reaches the scrim without a wrapper component — restyle it, or
 * give it a hook to select in a test.
 *
 * `hideBackdrop` removes it altogether. The modal is still modal — focus is still
 * trapped and the page is still locked — but nothing tells the user that, and a
 * click beside the panel lands on the page behind. Use it only when your own content
 * paints something that reads as a scrim.
 */
export const TheBackdrop: Story = {
  name: "The backdrop",
  render: () => ({
    props: { which: signal<"tinted" | "hidden" | null>(null) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="which.set('tinted')">
          Tinted backdrop
        </button>
        <button okklyButton size="small" variant="secondary" (click)="which.set('hidden')">
          No backdrop
        </button>
        <okkly-modal
          [open]="which() === 'tinted'"
          (close)="which.set(null)"
          backdropClass="okkly-story-backdrop--tinted"
        >
          <div style="${centred}">
            <div style="${paper}">
              <p style="margin: 0">The scrim is restyled through <code>backdropClass</code>.</p>
              <button okklyButton size="small" variant="secondary" (click)="which.set(null)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
        <okkly-modal [open]="which() === 'hidden'" (close)="which.set(null)" hideBackdrop>
          <div style="${centred}">
            <div style="${paper}">
              <p style="margin: 0">
                No scrim at all. The page behind is fully visible, and there is nothing to
                click to dismiss — Escape and the button are the only ways out.
              </p>
              <button okklyButton size="small" variant="secondary" (click)="which.set(null)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * Modal has no transition of its own — it is present or it is not. Animate the
 * content yourself and pass `keepMounted` so the subtree survives long enough to
 * play the exit.
 *
 * Without `keepMounted` the modal is gone from the DOM on the same tick `open`
 * flips, and the exit never runs. That is why `closeAfterTransition` is absent from
 * the API: the decision belongs to whoever owns the animation.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" (click)="open.set(true)">Open, and watch it leave</button>
        <okkly-modal [open]="open()" (close)="open.set(false)" keepMounted>
          <div
            style="${centred}; transition: opacity 350ms ease"
            [style.opacity]="open() ? 1 : 0"
          >
            <div style="${paper}">
              <p style="margin: 0">Fades both ways, because the subtree outlives <code>open</code>.</p>
              <button okklyButton size="small" variant="secondary" (click)="open.set(false)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * Every guard can be switched off, and each one is off for a reason rather than for
 * convenience:
 *
 * - `disableEscapeKeyDown` — for a step the user must answer rather than dismiss.
 *   Leave them another way out; a modal with no exit is a trap.
 * - `disableScrollLock` — when the page behind is meant to stay usable.
 * - `disableAutoFocus` — when moving focus would interrupt something, e.g. an
 *   overlay that appears while the user is typing.
 * - `disableEnforceFocus` — when a third-party widget outside the portal needs
 *   focus. It also stops Tab from being confined, so screen-reader users can walk
 *   straight out into the page behind.
 * - `disableRestoreFocus` — when you are moving focus somewhere specific yourself
 *   on close.
 */
export const DisablingTheGuards: Story = {
  name: "Disabling the guards",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open.set(true)">
          Open an unguarded modal
        </button>
        <okkly-modal
          [open]="open()"
          (close)="open.set(false)"
          disableEscapeKeyDown
          disableScrollLock
          disableAutoFocus
          disableRestoreFocus
        >
          <div style="${centred}">
            <div style="${paper}">
              <p style="margin: 0">
                Escape does nothing, the page still scrolls, focus was not moved in and will
                not be moved back. The button below is the only way out — which is the bargain
                you make when you turn these off.
              </p>
              <button okklyButton size="small" (click)="open.set(false)">Close</button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * By default the modal is portalled to `document.body`, which is what keeps it out
 * of any ancestor's `overflow: hidden` or transform. `container` sends it somewhere
 * else instead; `disablePortal` leaves it where it is written.
 *
 * `disablePortal` is a smaller change than it looks: the modal is still
 * `position: fixed`, so it still covers the viewport — but it now inherits the
 * stacking context and the clipping of whatever it sits inside, which is usually
 * how a modal ends up trapped behind a header.
 */
export const PortalAndContainer: Story = {
  name: "Portal and container",
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="${surface}; flex-direction: column; align-items: flex-start">
        <button okklyButton size="small" variant="secondary" (click)="open.set(true)">
          Open into the box below
        </button>
        <div
          #host
          style="position: relative; width: 420px; height: 220px; border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 12px"
        >
          <p style="${caption}; padding: 12px">The modal is mounted inside this box.</p>
        </div>
        <okkly-modal [open]="open()" (close)="open.set(false)" [container]="host">
          <div style="${centred}">
            <div style="${paper}">
              <p style="margin: 0">Inspect the DOM: this is a child of the dashed box.</p>
              <button okklyButton size="small" variant="secondary" (click)="open.set(false)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
      </div>`,
  }),
};

/**
 * `keepMounted` leaves the subtree in the DOM while closed, hidden with
 * `visibility` rather than removed. Two reasons to want it: the content keeps its
 * state between openings, and it is there for crawlers and in-page find.
 *
 * The cost is that everything inside stays mounted and keeps running. Type into the
 * kept-mounted field, close it and reopen: the text is still there. On the plain one
 * beside it, the field starts empty again.
 */
export const KeepMounted: Story = {
  name: "Keep mounted",
  render: () => ({
    props: { which: signal<"kept" | "fresh" | null>(null) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="which.set('kept')">
          Kept mounted
        </button>
        <button okklyButton size="small" variant="secondary" (click)="which.set('fresh')">
          Remounted
        </button>
        <okkly-modal [open]="which() === 'kept'" (close)="which.set(null)" keepMounted>
          <div style="${centred}">
            <div style="${paper}">
              <label style="display: grid; gap: 8px">
                Kept mounted
                <input type="text" placeholder="Type something" />
              </label>
              <button okklyButton size="small" variant="secondary" (click)="which.set(null)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
        <okkly-modal [open]="which() === 'fresh'" (close)="which.set(null)">
          <div style="${centred}">
            <div style="${paper}">
              <label style="display: grid; gap: 8px">
                Remounted
                <input type="text" placeholder="Type something" />
              </label>
              <button okklyButton size="small" variant="secondary" (click)="which.set(null)">
                Close
              </button>
            </div>
          </div>
        </okkly-modal>
        <p style="${caption}">Type, close, reopen: only the kept one remembers.</p>
      </div>`,
  }),
};
