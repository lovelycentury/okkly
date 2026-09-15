import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import TextField from "../TextField/TextField.vue";
import Dialog from "./Dialog.vue";
import DialogTitle from "./DialogTitle.vue";
import DialogContent from "./DialogContent.vue";
import DialogActions from "./DialogActions.vue";
import DialogClose from "./DialogClose.vue";
import type { DialogMaxWidth } from "./Dialog.types";

/**
 * A centred panel that interrupts. Use it when the page cannot usefully continue
 * until the user answers — a destructive action to confirm, a short form to
 * complete, a choice with consequences. Anything the user can ignore belongs in a
 * `Snackbar` or an inline `Alert`; anything anchored to a control belongs in a
 * `Popover`.
 *
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration. Dialog adds the centring and the sized paper, and ships
 * `DialogTitle` / `DialogContent` / `DialogActions` / `DialogClose` for the parts.
 *
 * `close` fires with `(event, reason)` — `"backdropClick"`, `"escapeKeyDown"` — so
 * a stray click beside the panel can be told apart from a deliberate dismissal.
 * That distinction matters for a form: losing typed input to a misplaced click is
 * the classic version of this bug.
 *
 * Props follow MUI's Dialog name-for-name (`fullWidth`, `maxWidth`, `fullScreen`,
 * plus the Modal pass-throughs). Deliberate gaps: no `sx`/`classes`, and a simple
 * focus trap.
 */
const meta: Meta<typeof Dialog> = {
  title: "Overlays/Dialog",
  component: Dialog,
  args: {
    maxWidth: "sm",
    fullWidth: false,
    fullScreen: false,
  },
  argTypes: {
    maxWidth: { control: "select", options: ["xs", "sm", "md", "lg", "xl", false] },
    fullWidth: { control: "boolean" },
    fullScreen: { control: "boolean" },
    open: { control: false },
    container: { control: false },
    backdropClass: { control: false },
  },
  render: (args) => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { args, open, close, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">Open the dialog</Button>
        <Dialog v-bind="args" :open="open" @close="close">
          <DialogTitle>Publish these changes?</DialogTitle>
          <DialogContent>They become visible to everyone with the link.</DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="close">Cancel</Button>
            <Button size="small" @click="close">Publish</Button>
          </DialogActions>
        </Dialog>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const surfaceStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const captionStyle = {
  margin: "0",
  width: "100%",
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The archetype: something irreversible, named plainly, with the destructive action
 * on the right and an escape on the left.
 *
 * Two details worth copying. The title says what will happen rather than "Are you
 * sure?", and the confirming button repeats the verb — a user who reads only the
 * buttons still knows which one deletes.
 */
export const ConfirmingADeletion: Story = {
  name: "Confirming a deletion",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions },
    setup() {
      const open = ref(false);
      const deleted = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, deleted, close, surfaceStyle, captionStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" color="ember" @click="open = true">Delete the project</Button>
        <Dialog :open="open" @close="close" max-width="xs">
          <DialogTitle>Delete “Night drive”?</DialogTitle>
          <DialogContent>
            The project, its releases and its analytics go with it. This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="close">Keep it</Button>
            <Button size="small" color="ember" @click="deleted = true; close()">Delete it</Button>
          </DialogActions>
        </Dialog>
        <p v-if="deleted" :style="captionStyle">Deleted. (Nothing actually happened.)</p>
      </div>`,
  }),
};

/**
 * `close` tells you *why* it is closing, which is what lets a form protect typed
 * input. Here a backdrop click is ignored once the field has something in it, while
 * Escape and Cancel still work — a misplaced click should not cost the user their
 * work, but it should not lock them in either.
 *
 * Reasons: `"backdropClick"` and `"escapeKeyDown"`. A click on your own close
 * button is your handler, so it arrives however you call it.
 */
export const AForm: Story = {
  name: "A form",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField },
    setup() {
      const open = ref(false);
      const name = ref("");
      const lastReason = ref<string | null>(null);
      const handleClose = (_event: Event, reason: string) => {
        lastReason.value = reason;
        // A stray click beside the panel is not a decision to discard a
        // half-typed form. Escape is — it takes deliberation to press.
        if (reason === "backdropClick" && name.value.length > 0) return;
        open.value = false;
      };
      return { open, name, lastReason, handleClose, surfaceStyle, captionStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="open = true">New release</Button>
        <Dialog :open="open" full-width max-width="sm" @close="handleClose">
          <DialogTitle>New release</DialogTitle>
          <DialogContent>
            <TextField label="Title" v-model="name" placeholder="Night drive vol. 2" />
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="open = false">Cancel</Button>
            <Button size="small" :disabled="name.length === 0" @click="open = false">Create</Button>
          </DialogActions>
        </Dialog>
        <p :style="captionStyle">
          Type something, then click the backdrop: nothing happens. Last reason: {{ lastReason ?? "—" }}
        </p>
      </div>`,
  }),
};

/**
 * `DialogClose` is the corner ✕. Add it when the dialog is something to read rather
 * than answer — where a pair of buttons would imply a decision that is not being
 * asked for.
 *
 * Do not add it *and* a Cancel button: two controls that do the same thing make the
 * user work out whether they really do.
 */
export const WithACloseButton: Story = {
  name: "With a close button",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogClose },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">What is a token?</Button>
        <Dialog :open="open" @close="close" max-width="sm">
          <DialogClose @click="close" />
          <DialogTitle>What is a token?</DialogTitle>
          <DialogContent>
            A named value — a colour, a radius, a duration — that components read instead of
            hard-coding it. Every one of them is a CSS variable on the root, which is why a theme
            can change the whole library without a single re-render.
          </DialogContent>
        </Dialog>
      </div>`,
  }),
};

/**
 * `maxWidth` caps the paper; the paper is still only as wide as its content unless
 * `fullWidth` makes it take the cap. The two are meant to be used together — on its
 * own, `maxWidth` on a short dialog does nothing visible.
 */
export const Widths: Story = {
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions },
    setup() {
      const options = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly DialogMaxWidth[];
      // `width` and `open` are deliberately separate state: the dialog exits with
      // a Grow, so it stays mounted (and rendering) for the length of that
      // shrink. Folding `width` back to a "closed" sentinel on close — as a
      // single piece of state tempts — would flip `maxWidth` mid-animation and
      // the paper would visibly resize to the closed value while it shrinks.
      const width = ref<DialogMaxWidth>("sm");
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { options, width, open, close, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button
          v-for="option in options"
          :key="option"
          size="small"
          variant="secondary"
          @click="width = option; open = true"
        >{{ option }}</Button>
        <Button size="small" variant="ghost" @click="width = false; open = true">
          false (uncapped)
        </Button>
        <Dialog :open="open" @close="close" full-width :max-width="width">
          <DialogTitle>maxWidth = {{ String(width) }}</DialogTitle>
          <DialogContent>
            With \`fullWidth\` the paper takes the whole cap. Without it, it would shrink to this
            paragraph.
          </DialogContent>
          <DialogActions>
            <Button size="small" @click="close">Close</Button>
          </DialogActions>
        </Dialog>
      </div>`,
  }),
};

/**
 * `fullScreen` drops the centring and the radius and takes the whole viewport. It is
 * for narrow screens, where a centred panel with margins wastes the space it needs —
 * switch to it on a media query rather than choosing it outright.
 */
export const FullScreen: Story = {
  name: "Full screen",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogClose },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      return { open, close, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">Open full screen</Button>
        <Dialog :open="open" @close="close" full-screen>
          <DialogClose @click="close" />
          <DialogTitle>Edit the release</DialogTitle>
          <DialogContent>
            The paper fills the viewport. On a phone this is usually the right shape; on a desktop
            it is almost never.
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="close">Cancel</Button>
            <Button size="small" @click="close">Save</Button>
          </DialogActions>
        </Dialog>
      </div>`,
  }),
};

/**
 * Long content scrolls inside `DialogContent`, so the title and the actions stay
 * put. That is the reason to use the subcomponents rather than one block of
 * content: the buttons must not scroll out of reach.
 */
export const ScrollingContent: Story = {
  name: "Scrolling content",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions },
    setup() {
      const open = ref(false);
      const close = () => {
        open.value = false;
      };
      const paragraphs = Array.from({ length: 14 }, (_, index) => index + 1);
      return { open, close, paragraphs, surfaceStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">Open the terms</Button>
        <Dialog :open="open" @close="close" full-width max-width="sm">
          <DialogTitle>Terms</DialogTitle>
          <DialogContent>
            <p v-for="n in paragraphs" :key="n" style="margin-top: 0">
              {{ n }}. A paragraph of terms nobody reads, present so the content is taller than the
              viewport and the actions below have something to stay put against.
            </p>
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="close">Decline</Button>
            <Button size="small" @click="close">Accept</Button>
          </DialogActions>
        </Dialog>
      </div>`,
  }),
};

/**
 * A dialog the user has to answer. `disableEscapeKeyDown` plus a `close` handler
 * that ignores the backdrop leaves the two buttons as the only way out.
 *
 * Use this sparingly and never without an exit: "Cancel" is an answer. A dialog with
 * one button and no dismissal is a dead end, and the user's only remaining move is
 * to reload the page.
 */
export const MustBeAnswered: Story = {
  name: "Must be answered",
  render: () => ({
    components: { Button, Dialog, DialogTitle, DialogContent, DialogActions },
    setup() {
      const open = ref(false);
      const answer = ref<string | null>(null);
      const handleClose = (_event: Event, reason: string) => {
        if (reason === "backdropClick") return;
        open.value = false;
      };
      return { open, answer, handleClose, surfaceStyle, captionStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = true">
          Leave with unsaved changes
        </Button>
        <Dialog :open="open" disable-escape-key-down @close="handleClose" max-width="xs">
          <DialogTitle>You have unsaved changes</DialogTitle>
          <DialogContent>Leaving now discards them.</DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" @click="answer = 'stayed'; open = false">
              Stay
            </Button>
            <Button size="small" color="ember" @click="answer = 'discarded'; open = false">
              Discard
            </Button>
          </DialogActions>
        </Dialog>
        <p :style="captionStyle">Escape and the backdrop do nothing. Answer: {{ answer ?? "—" }}</p>
      </div>`,
  }),
};
