import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Modal from "./Modal.vue";

/**
 * The plumbing behind every modal overlay, and nothing else: a portal, a backdrop,
 * a focus trap, a scroll lock, Escape handling, and focus put back where it came
 * from when you close.
 *
 * **It draws no surface of its own.** That is deliberate and it is the whole point
 * of the component. If you render `<Modal>` with some text in it, you get that
 * text floating on the backdrop with no panel behind it. To get a panel, put your
 * own element inside with your own background, padding and radius: that is the
 * `YourOwnDialog` story below, and it is the intended way to use this directly.
 *
 * Reach for `Modal` when you need a shape a plain centred dialog does not have —
 * a lightbox, a command palette, a full-bleed media viewer.
 *
 * Props follow MUI's Modal name-for-name. Deliberate gaps: no `sx`/`classes`, no
 * arbitrary backdrop `slotProps` (see `backdropClass`), and no
 * `closeAfterTransition` — with no built-in transition to wait on, a consumer
 * that animates keeps itself mounted with `keepMounted`.
 */
const meta: Meta<typeof Modal> = {
  title: "Overlays/Modal",
  component: Modal,
  args: {
    hideBackdrop: false,
    keepMounted: false,
    disablePortal: false,
    disableEscapeKeyDown: false,
    disableAutoFocus: false,
    disableEnforceFocus: false,
    disableRestoreFocus: false,
    disableScrollLock: false,
  },
  argTypes: {
    open: { control: false },
    container: { control: false },
    backdropClass: { control: false },
    hideBackdrop: { control: "boolean" },
    keepMounted: { control: "boolean" },
    disablePortal: { control: "boolean" },
    disableEscapeKeyDown: { control: "boolean" },
    disableAutoFocus: { control: "boolean" },
    disableEnforceFocus: { control: "boolean" },
    disableRestoreFocus: { control: "boolean" },
    disableScrollLock: { control: "boolean" },
  },
  render: (args) => ({
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { args, open, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">Open the modal</Button>
        <Modal v-bind="args" :open="open" @close="close">
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">
                This panel is a plain div in the story, not something Modal drew. Escape, the
                backdrop and the focus trap are Modal's.
              </p>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Modal>;

const surfaceStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// Modal fills the viewport and stacks its children on the backdrop; it does not
// place them. Anything that should sit in the middle needs its own centring layer.
const centredStyle = {
  position: "absolute",
  inset: "0",
  display: "grid",
  placeItems: "center",
  padding: "24px",
};

const paperStyle = {
  display: "grid",
  gap: "16px",
  justifyItems: "start",
  width: "min(420px, 100%)",
  padding: "24px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "18px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.6)",
};

const captionStyle = {
  margin: "0",
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The recipe. `Modal` gives you the behaviour; the surface is yours.
 *
 * Three things the panel has to bring itself, because the component deliberately
 * does not:
 *
 * 1. **Position.** Modal covers the viewport and stacks children over the backdrop
 *    — it does not centre them. The wrapper below is what does.
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
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">Open a hand-built dialog</Button>
        <Modal :open="open" @close="close">
          <div :style="centredStyle">
            <div :style="paperStyle" role="dialog" aria-modal="true" aria-labelledby="own-dialog-title">
              <h2 id="own-dialog-title" style="margin: 0; font-size: var(--okkly-font-size-lg); color: var(--okkly-text-primary)">
                Built by hand
              </h2>
              <p style="margin: 0">
                Everything visible here — the panel, the centring, the heading — is in the story.
                Modal contributed the portal, the scrim, the focus trap, the scroll lock and Escape.
              </p>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
      </div>`,
  }),
};

/**
 * What "no chrome" actually looks like. The same content with no wrapper of its
 * own lands in the top-left corner, unstyled, on the scrim.
 *
 * This is not a bug to work around — it is the contract. A component that painted
 * a panel could not be the base of a full-bleed lightbox, which has no panel at
 * all.
 */
export const NoSurfaceOfItsOwn: Story = {
  name: "No surface of its own",
  render: () => ({
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">Open with no panel</Button>
        <Modal :open="open" @close="close">
          <p style="color: var(--okkly-text-primary); font-family: var(--okkly-font-family-sans)">
            Bare content. Press Escape to close.
          </p>
        </Modal>
      </div>`,
  }),
};

/**
 * A shape a plain centred dialog does not have: a full-bleed viewer with no
 * panel, closing on any click. This is the case `Modal` exists for.
 */
export const ALightbox: Story = {
  name: "A lightbox",
  render: () => ({
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle, centredStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">Open the viewer</Button>
        <Modal :open="open" @close="close" backdrop-class="lightbox-backdrop">
          <div :style="{ ...centredStyle, cursor: 'zoom-out' }" @click="close">
            <div
              style="display: grid; place-items: center; width: min(560px, 90vw); aspect-ratio: 16 / 10;
                     border-radius: 12px; background: linear-gradient(140deg, #1b2f3a, #3a1b2f);
                     color: var(--okkly-text-muted); font-family: var(--okkly-font-family-mono);
                     font-size: var(--okkly-font-size-sm)"
            >the artwork</div>
          </div>
        </Modal>
      </div>`,
  }),
};

/**
 * `backdropClass` reaches the scrim without a wrapper component — restyle it, or
 * give it a hook to select in a test. `hideBackdrop` removes it altogether: the
 * modal is still modal — focus is still trapped and the page is still locked —
 * but nothing tells the user that, and a click beside the panel lands on the page
 * behind. Use it only when your own content paints something that reads as a
 * scrim.
 */
export const TheBackdrop: Story = {
  name: "The backdrop",
  render: () => ({
    components: { Button, Modal },
    setup() {
      const which = ref<"tinted" | "hidden" | null>(null);
      const close = () => {
        which.value = null;
      };
      return { which, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="which = 'tinted'">Tinted backdrop</Button>
        <Button size="small" variant="secondary" @click="which = 'hidden'">No backdrop</Button>
        <Modal :open="which === 'tinted'" @close="close" backdrop-class="tinted-backdrop">
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">The scrim is restyled through \`backdrop-class\`.</p>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
        <Modal :open="which === 'hidden'" @close="close" hide-backdrop>
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">
                No scrim at all. The page behind is fully visible, and there is nothing to click to
                dismiss — Escape and the button are the only ways out.
              </p>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
      </div>`,
  }),
};

/**
 * `Modal` has no transition of its own — it is present or it is not. Wrap the
 * content in a `<Transition>` and pass `keep-mounted` so the subtree survives
 * long enough to animate out.
 *
 * Without `keepMounted` the modal is gone from the DOM on the same tick `open`
 * flips, and the exit never plays.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => ({
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">Open, and watch it leave</Button>
        <Modal :open="open" @close="close" keep-mounted>
          <Transition name="modal-fade">
            <div v-if="open" :style="centredStyle">
              <div :style="paperStyle">
                <p style="margin: 0">Fades both ways, because the subtree outlives \`open\`.</p>
                <Button size="small" variant="secondary" @click="close">Close</Button>
              </div>
            </div>
          </Transition>
        </Modal>
      </div>`,
  }),
};

/**
 * Every guard can be switched off, and each one is off for a reason rather than
 * for convenience:
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
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">Open an unguarded modal</Button>
        <Modal
          :open="open"
          @close="close"
          disable-escape-key-down
          disable-scroll-lock
          disable-auto-focus
          disable-restore-focus
        >
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">
                Escape does nothing, the page still scrolls, focus was not moved in and will not be
                moved back. The button below is the only way out — which is the bargain you make
                when you turn these off.
              </p>
              <Button size="small" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
      </div>`,
  }),
};

/**
 * By default the modal is portalled to `document.body`, which is what keeps it
 * out of any ancestor's `overflow: hidden` or transform. `container` sends it
 * somewhere else instead; `disablePortal` leaves it where it is written.
 */
export const PortalAndContainer: Story = {
  name: "Portal and container",
  render: () => ({
    components: { Button, Modal },
    setup() {
      const open = ref(false);
      const host = ref<HTMLDivElement | null>(null);
      const close = () => {
        open.value = false;
      };
      return { open, host, close, surfaceStyle, centredStyle, paperStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, flexDirection: 'column', alignItems: 'flex-start' }">
        <Button size="small" variant="secondary" @click="open = true">Open into the box below</Button>
        <div
          ref="host"
          style="position: relative; width: 420px; height: 220px;
                 border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 12px"
        >
          <p style="margin: 0; padding: 12px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">
            The modal is mounted inside this box.
          </p>
        </div>
        <Modal :open="open" @close="close" :container="host">
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">Inspect the DOM: this is a child of the dashed box.</p>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
      </div>`,
  }),
};

/**
 * `keepMounted` leaves the subtree in the DOM while closed, hidden with
 * `visibility` rather than removed. Two reasons to want it: the content keeps its
 * state between openings, and it is there for crawlers and in-page find.
 *
 * The cost is that everything inside stays mounted and keeps running. The counter
 * below survives closing; on the plain modal next to it, it starts again at zero.
 */
const FreshCounter = {
  emits: ["close"],
  setup(_props: unknown, { emit }: { emit: (event: "close") => void }) {
    const count = ref(0);
    return { count, emit, centredStyle, paperStyle };
  },
  template: `
    <div :style="centredStyle">
      <div :style="paperStyle">
        <p style="margin: 0">Remounted: {{ count }}</p>
        <button type="button" @click="count += 1">Count up</button>
        <button type="button" @click="emit('close')">Close</button>
      </div>
    </div>`,
};

export const KeepMounted: Story = {
  name: "Keep mounted",
  render: () => ({
    components: { Button, Modal, FreshCounter },
    setup() {
      const which = ref<"kept" | "fresh" | null>(null);
      const keptCount = ref(0);
      const close = () => {
        which.value = null;
      };
      return { which, keptCount, close, surfaceStyle, centredStyle, paperStyle, captionStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="which = 'kept'">Kept mounted</Button>
        <Button size="small" variant="secondary" @click="which = 'fresh'">Remounted</Button>
        <Modal :open="which === 'kept'" @close="close" keep-mounted>
          <div :style="centredStyle">
            <div :style="paperStyle">
              <p style="margin: 0">Kept mounted: {{ keptCount }}</p>
              <Button size="small" variant="ghost" @click="keptCount += 1">Count up</Button>
              <Button size="small" variant="secondary" @click="close">Close</Button>
            </div>
          </div>
        </Modal>
        <Modal :open="which === 'fresh'" @close="close">
          <FreshCounter @close="close" />
        </Modal>
        <p :style="captionStyle">Count up, close, reopen: only the kept one remembers.</p>
      </div>`,
  }),
};
