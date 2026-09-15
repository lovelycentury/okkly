import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Popover from "./Popover.vue";

/**
 * A panel anchored to something on the page that closes when you click away from
 * it. It is the middle ground between a tooltip, which cannot be interacted with,
 * and a full-page dialog, which takes over the page: use it for menus, filter
 * panels, date pickers, a profile card — anything that belongs *to* a control
 * rather than to the page.
 *
 * It is `Popper` plus dismissal: the positioning is the same engine, and Popover
 * adds Escape, click-outside, a surface to put things on, and a scale+fade
 * transition. If you do not want any of that — a hover card, a dropdown that must
 * not steal focus — you want `Popper`.
 *
 * Note that it is **not** modal and has **no scrim by default**: `hideBackdrop`
 * starts at `true`, and dismissal comes from a click-outside listener rather than
 * from a backdrop catching the click. Pass `:hide-backdrop="false"` when you want
 * the page behind sealed off — see `WithABackdrop`.
 *
 * `anchorEl` is what it points at. It must be a real element, so keep it in a
 * `ref` set from an event rather than a template ref that is only populated once
 * the trigger renders; `anchorPosition` replaces it entirely when you want to
 * anchor to coordinates instead — a right-click menu, a point on a canvas.
 *
 * Props follow MUI's Popover where the shapes agree, with placement borrowed from
 * Popper's vocabulary rather than MUI's `anchorOrigin`/`transformOrigin` pair.
 */
const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  args: {
    placement: "bottom-start",
    matchAnchorWidth: false,
    // The component's own default. Set to `false` here it would look as though a
    // scrim were standard, which is the opposite of what this component does.
    hideBackdrop: true,
    disablePortal: false,
    transitionDuration: "auto",
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "bottom-start",
        "bottom-end",
        "top-start",
        "top-end",
      ],
    },
    matchAnchorWidth: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
    disablePortal: { control: "boolean" },
    minWidth: { control: "text" },
    open: { control: false },
    anchorEl: { control: false },
    anchorPosition: { control: false },
    paperClassName: { control: false },
  },
  render: (args) => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const openFrom = (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      return { args, anchorEl, openFrom, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="openFrom">Open the popover</Button>
        <Popover v-bind="args" :open="!!anchorEl" :anchor-el="anchorEl" @close="close">
          <div :style="bodyStyle">
            <p style="margin: 0">Anchored to the button. Click outside or press Escape.</p>
          </div>
        </Popover>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Popover>;

const surfaceStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  padding: "32px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The paper brings its own background and border; this is only the padding and
// text rhythm, which belong to the content rather than to the component.
const bodyStyle = {
  padding: "16px",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  color: "var(--okkly-text-secondary)",
};

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "9px 14px",
  border: "none",
  background: "none",
  color: "var(--okkly-text-secondary)",
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
  textAlign: "left" as const,
  cursor: "pointer",
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
 * The commonest use: a menu hanging off a button. `bottom-end` aligns its right
 * edge with the trigger's, which is what keeps a right-aligned toolbar menu from
 * running off the page.
 *
 * The toolbar is pushed to the right here for a reason. `bottom-end` is a
 * preference, and the flip logic changes the variation as readily as the side:
 * put this trigger near the left edge and a 200px menu aligned to its right edge
 * would start off-screen, so Popper quietly serves you `bottom-start` instead.
 * That is correct behaviour, and it is why a story about `-end` has to leave room
 * for it.
 *
 * Each item closes the popover. A menu that stays open after a choice makes the
 * user dismiss it themselves, which is one interaction too many.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const last = ref<string | null>(null);
      const items = ["Duplicate", "Move to…", "Rename", "Delete"];
      const open = (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      const choose = (item: string) => {
        last.value = item;
        close();
      };
      return {
        anchorEl,
        last,
        items,
        open,
        close,
        choose,
        surfaceStyle,
        menuItemStyle,
        captionStyle,
      };
    },
    template: `
      <div :style="surfaceStyle">
        <div style="display: flex; justify-content: flex-end; width: 420px">
          <Button size="small" variant="secondary" @click="open">Actions</Button>
        </div>
        <Popover
          :open="!!anchorEl"
          :anchor-el="anchorEl"
          placement="bottom-end"
          :min-width="200"
          @close="close"
        >
          <div style="padding: 6px 0">
            <button
              v-for="item in items"
              :key="item"
              type="button"
              :style="{ ...menuItemStyle, color: item === 'Delete' ? 'var(--okkly-accent-ember)' : menuItemStyle.color }"
              @click="choose(item)"
            >{{ item }}</button>
          </div>
        </Popover>
        <p :style="captionStyle">Chose: {{ last ?? '—' }}</p>
      </div>`,
  }),
};

/**
 * `matchAnchorWidth` locks the paper to the trigger's width, which is what makes a
 * popover read as a dropdown belonging to the field above it rather than a panel
 * that happens to be nearby. It is what `Select` and `Autocomplete` use.
 *
 * `minWidth` is the other half: a floor for the case where the anchor is tiny.
 */
export const MatchingTheAnchor: Story = {
  name: "Matching the anchor",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const which = ref<"matched" | "free" | null>(null);
      const anchorEl = ref<HTMLElement | null>(null);
      const open = (kind: "matched" | "free") => (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
        which.value = kind;
      };
      const close = () => {
        which.value = null;
        anchorEl.value = null;
      };
      return { which, anchorEl, open, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, flexDirection: 'column', alignItems: 'stretch', width: '420px' }">
        <Button size="small" variant="secondary" @click="open('matched')">
          A wide trigger — matched width
        </Button>
        <Button size="small" variant="ghost" @click="open('free')">
          A wide trigger — natural width
        </Button>
        <Popover
          :open="which !== null"
          :anchor-el="anchorEl"
          :match-anchor-width="which === 'matched'"
          @close="close"
        >
          <div :style="bodyStyle">
            {{ which === 'matched' ? 'As wide as the trigger, however wide that is.' : 'As wide as this text needs to be.' }}
          </div>
        </Popover>
      </div>`,
  }),
};

/**
 * `anchorPosition` anchors to a point instead of an element — the context-menu case.
 * Right-click the panel below: the popover opens where the pointer was, not where
 * any button is.
 *
 * `anchorEl` is ignored when this is set, so there is nothing to keep in state
 * except the coordinates.
 */
export const AtAPoint: Story = {
  name: "At a point",
  render: () => ({
    components: { Popover },
    setup() {
      const position = ref<{ top: number; left: number } | null>(null);
      const openAt = (event: MouseEvent) => {
        event.preventDefault();
        position.value = { top: event.clientY, left: event.clientX };
      };
      const close = () => {
        position.value = null;
      };
      return { position, openAt, close, surfaceStyle, menuItemStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <div
          @contextmenu="openAt"
          style="display: grid; place-items: center; width: 420px; height: 200px;
                 border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 14px;
                 color: var(--okkly-text-muted); font-size: var(--okkly-font-size-sm)"
        >Right-click anywhere in here</div>
        <Popover :open="position !== null" :anchor-position="position ?? undefined" @close="close">
          <div style="padding: 6px 0; min-width: 170px">
            <button
              v-for="item in ['Cut', 'Copy', 'Paste']"
              :key="item"
              type="button"
              :style="menuItemStyle"
              @click="close"
            >{{ item }}</button>
          </div>
        </Popover>
      </div>`,
  }),
};

/**
 * Placement is a preference. The engine flips and shifts the paper to keep it on
 * screen, so a popover asked for `top` near the top edge comes out at the bottom —
 * which is the correct answer, and the reason not to hard-code a position.
 */
export const Placements: Story = {
  render: () => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const placement = ref<"top" | "bottom" | "left" | "right">("bottom");
      const options: Array<"top" | "bottom" | "left" | "right"> = [
        "top",
        "bottom",
        "left",
        "right",
      ];
      const open = (option: "top" | "bottom" | "left" | "right") => (event: MouseEvent) => {
        placement.value = option;
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      return { anchorEl, placement, options, open, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, padding: '80px' }">
        <Button
          v-for="option in options"
          :key="option"
          size="small"
          variant="ghost"
          @click="open(option)"
        >{{ option }}</Button>
        <Popover :open="!!anchorEl" :anchor-el="anchorEl" :placement="placement" @close="close">
          <div :style="bodyStyle">placement = {{ placement }}</div>
        </Popover>
      </div>`,
  }),
};

/**
 * Something worth putting in a popover: a small form. It is the shape a full-page
 * dialog would be too heavy for and a tooltip could not hold at all.
 *
 * Note that focus is not trapped — a popover is not modal. Escape and a click
 * outside close it, and Tab walks out of it into the page, which is the behaviour a
 * dropdown wants.
 */
export const AFilterPanel: Story = {
  name: "A filter panel",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const active = ref<string[]>(["Albums"]);
      const filters = ["Albums", "Singles", "Remixes", "Unreleased"];
      const open = (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      const toggle = (filter: string) => {
        active.value = active.value.includes(filter)
          ? active.value.filter((item) => item !== filter)
          : [...active.value, filter];
      };
      return {
        anchorEl,
        active,
        filters,
        open,
        close,
        toggle,
        surfaceStyle,
        bodyStyle,
        captionStyle,
      };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open">Filters ({{ active.length }})</Button>
        <Popover :open="!!anchorEl" :anchor-el="anchorEl" :min-width="260" @close="close">
          <div :style="{ ...bodyStyle, display: 'grid', gap: '12px' }">
            <strong style="color: var(--okkly-text-primary)">Show</strong>
            <label v-for="filter in filters" :key="filter" style="display: flex; align-items: center; gap: 8px">
              <input type="checkbox" :checked="active.includes(filter)" @change="toggle(filter)" />
              {{ filter }}
            </label>
            <Button size="small" @click="close">Apply</Button>
          </div>
        </Popover>
        <p :style="captionStyle">Active: {{ active.join(', ') || 'none' }}</p>
      </div>`,
  }),
};

/**
 * `:hide-backdrop="false"` adds a real scrim. Both modes dismiss on a click
 * outside; what changes is what that click *also* does.
 *
 * Without a scrim — the default — the page behind stays live, so the click that
 * closes the popover lands on whatever was under it. For a menu that is usually
 * welcome. For a form it means a stray click can close and act in one go, and the
 * scrim is worth the weight.
 *
 * Try both buttons below and watch the counter.
 */
export const WithABackdrop: Story = {
  name: "With a backdrop",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const which = ref<"bare" | "scrim" | null>(null);
      const anchorEl = ref<HTMLElement | null>(null);
      const clicks = ref(0);
      const open = (kind: "bare" | "scrim") => (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
        which.value = kind;
      };
      const close = () => {
        which.value = null;
        anchorEl.value = null;
      };
      return { which, anchorEl, clicks, open, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open('bare')">Open without a scrim</Button>
        <Button size="small" variant="secondary" @click="open('scrim')">Open with a scrim</Button>
        <Button size="small" variant="ghost" @click="clicks += 1">A button behind it ({{ clicks }})</Button>
        <Popover
          :open="which !== null"
          :anchor-el="anchorEl"
          :hide-backdrop="which !== 'scrim'"
          @close="close"
        >
          <div :style="bodyStyle">
            Now click "A button behind it". Without a scrim the counter goes up as this closes; with
            one, it does not.
          </div>
        </Popover>
      </div>`,
  }),
};

/**
 * `transitionDuration` takes `"auto"`, a number, or `{ enter, exit }`. `"auto"`
 * derives it from the paper's height, which keeps a long menu and a short one
 * feeling like the same control.
 */
export const TransitionDuration: Story = {
  name: "Transition duration",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const duration = ref<"auto" | number>("auto");
      const options: Array<"auto" | number> = ["auto", 0, 150, 600];
      const open = (option: "auto" | number) => (event: MouseEvent) => {
        duration.value = option;
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      return { anchorEl, duration, options, open, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button
          v-for="option in options"
          :key="String(option)"
          size="small"
          variant="ghost"
          @click="open(option)"
        >{{ option }}</Button>
        <Popover :open="!!anchorEl" :anchor-el="anchorEl" :transition-duration="duration" @close="close">
          <div :style="bodyStyle">
            transitionDuration = {{ duration }}<br />
            Close it to see the exit at the same speed.
          </div>
        </Popover>
      </div>`,
  }),
};

/**
 * The anchor has to live in reactive state, not a plain variable read once. A
 * value that is not tracked does not cause a re-render, so the popover would open
 * against `null` on the first click and be positioned in the corner.
 */
export const AnchorMustBeState: Story = {
  name: "Anchor must be state",
  render: () => ({
    components: { Button, Popover },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const open = (event: MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const close = () => {
        anchorEl.value = null;
      };
      return { anchorEl, open, close, surfaceStyle, bodyStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open">Correct — anchor in a ref</Button>
        <Popover :open="!!anchorEl" :anchor-el="anchorEl" @close="close">
          <div :style="bodyStyle">Anchored where it should be.</div>
        </Popover>
      </div>`,
  }),
};
