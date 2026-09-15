import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Popper from "./Popper.vue";
import type { PopperPlacement } from "./Popper.types";

/**
 * Positioning and nothing else. Popper puts an element next to another element and
 * keeps it there — through scrolling, resizing, and the edges of the viewport — and
 * makes no decision about how it opens, closes, or looks.
 *
 * That is the difference from `Popover`, which is this plus a backdrop, a
 * click-outside, Escape and a surface. Choose Popper when you want to own the
 * dismissal: a hover card, an autocomplete list that must not steal focus, a toolbar
 * that follows a selection. Choose `Popover` for a menu or a panel — you will
 * otherwise rebuild it.
 *
 * It draws no surface, exactly as `Modal` draws none. The default slot brings its
 * own background, or it sits transparent on the page.
 *
 * Two behaviours worth knowing. It flips and shifts to stay on screen, so
 * `placement` is a preference rather than an instruction. And `anchorEl` accepts a
 * virtual element — an object with `getBoundingClientRect` — which is how you anchor
 * to a text selection or a point on a canvas that has no DOM node of its own.
 *
 * Props follow MUI's Popper: `anchorEl`, `placement`, `keepMounted`,
 * `disablePortal`, `container`, `modifiers`, `popperOptions`, `transition`.
 */
const meta: Meta<typeof Popper> = {
  title: "Overlays/Popper",
  component: Popper,
  args: {
    placement: "bottom",
    keepMounted: false,
    disablePortal: false,
    transition: false,
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "top-start",
        "top-end",
        "bottom-start",
        "bottom-end",
        "left-start",
        "right-start",
      ],
    },
    keepMounted: { control: "boolean" },
    disablePortal: { control: "boolean" },
    transition: { control: "boolean" },
    matchAnchorWidth: { control: false },
    minWidth: { control: "text" },
    open: { control: false },
    anchorEl: { control: false },
    modifiers: { control: false },
    popperOptions: { control: false },
    container: { control: false },
  },
  render: (args) => ({
    components: { Button, Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const toggle = (event: MouseEvent) => {
        anchorEl.value = anchorEl.value ? null : (event.currentTarget as HTMLElement);
      };
      return { args, anchorEl, toggle, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" @click="toggle">{{ anchorEl ? 'Hide' : 'Show' }} the popper</Button>
        <Popper v-bind="args" :open="!!anchorEl" :anchor-el="anchorEl">
          <div :style="paperStyle">
            Positioned, and nothing else. Nothing here closes it but the button.
          </div>
        </Popper>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Popper>;

const surfaceStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  padding: "48px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// Popper paints nothing, so every story has to bring a surface — the same bargain
// `Modal` makes, for the same reason: a component that drew a panel could not be the
// base of a tooltip, an autocomplete list and a selection toolbar at once.
const paperStyle = {
  maxWidth: "280px",
  padding: "14px 16px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  boxShadow: "0 0.75rem 2rem rgba(0, 0, 0, 0.55)",
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
 * A hover card — the case `Popover` cannot do, because its backdrop would swallow
 * the hover and its click-outside would fight the pointer. Popper positions; the
 * story owns when it appears.
 */
export const AHoverCard: Story = {
  name: "A hover card",
  render: () => ({
    components: { Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const show = (event: FocusEvent | MouseEvent) => {
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const hide = () => {
        anchorEl.value = null;
      };
      return { anchorEl, show, hide, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <p style="margin: 0; max-width: 460px; line-height: 1.7">
          The record was mixed by
          <a href="#ok" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide"
             style="color: var(--okkly-accent-primary)">
            Oleksii Kryshtopa
          </a>
          over two weeks in a room with no windows.
        </p>
        <Popper :open="!!anchorEl" :anchor-el="anchorEl" placement="top-start">
          <div :style="{ ...paperStyle, display: 'grid', gap: '6px' }">
            <strong style="color: var(--okkly-text-primary)">Oleksii Kryshtopa</strong>
            <span>Design systems, and records nobody asked for.</span>
          </div>
        </Popper>
      </div>`,
  }),
};

/**
 * Placement is a preference. The engine flips to the opposite side and shifts along
 * the axis to keep the element on screen, so what you ask for is what you get only
 * when there is room for it.
 *
 * The default slot's scope carries the placement that was actually used — which is
 * how a tooltip knows which way to point its arrow.
 */
export const Placements: Story = {
  render: () => ({
    components: { Button, Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const placement = ref<PopperPlacement>("bottom");
      const placements: PopperPlacement[] = [
        "top",
        "bottom",
        "left",
        "right",
        "top-start",
        "bottom-end",
      ];
      const open = (option: PopperPlacement) => (event: MouseEvent) => {
        placement.value = option;
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      return { anchorEl, placement, placements, open, surfaceStyle, paperStyle, captionStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, padding: '90px' }">
        <Button
          v-for="option in placements"
          :key="option"
          size="small"
          variant="ghost"
          @click="open(option)"
        >{{ option }}</Button>
        <Popper :open="!!anchorEl" :anchor-el="anchorEl" :placement="placement">
          <template #default="{ placement: resolved }">
            <div :style="paperStyle">
              asked for <code>{{ placement }}</code><br />
              resolved to <code>{{ resolved }}</code>
            </div>
          </template>
        </Popper>
        <p :style="captionStyle">
          Scroll the frame so a button nears an edge, then reopen: the two differ.
        </p>
      </div>`,
  }),
};

/**
 * `anchorEl` accepts a *virtual element* — anything with a `getBoundingClientRect`.
 * That is how you anchor to something with no node of its own: a text selection, a
 * cell in a canvas, a point on a map.
 *
 * Select some of the text below and a toolbar appears over it.
 */
export const AVirtualAnchor: Story = {
  name: "A virtual anchor",
  render: () => ({
    components: { Button, Popper },
    setup() {
      const rect = ref<DOMRect | null>(null);
      const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          rect.value = null;
          return;
        }
        rect.value = selection.getRangeAt(0).getBoundingClientRect();
      };
      const anchorEl = () =>
        rect.value ? { getBoundingClientRect: () => rect.value as DOMRect } : null;
      return { rect, handleSelection, anchorEl, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <p
          @mouseup="handleSelection"
          @keyup="handleSelection"
          style="margin: 0; max-width: 460px; line-height: 1.8; user-select: text"
        >
          Select any part of this sentence and a small toolbar will appear above the selection,
          anchored to a rectangle rather than to an element.
        </p>
        <Popper :open="rect !== null" :anchor-el="anchorEl" placement="top">
          <div :style="{ ...paperStyle, display: 'flex', gap: '8px', padding: '8px' }">
            <Button size="small" variant="ghost">Bold</Button>
            <Button size="small" variant="ghost">Link</Button>
            <Button size="small" variant="ghost">Quote</Button>
          </div>
        </Popper>
      </div>`,
  }),
};

/**
 * `transition` hands the default slot's scope a `transitionProps` object
 * (`{ in, onEnter, onExited }`) to spread onto a transition, and holds the element
 * mounted until `onExited` is called. Without it, Popper is present or absent with
 * nothing in between.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => ({
    components: { Button, Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const toggle = (event: MouseEvent) => {
        anchorEl.value = anchorEl.value ? null : (event.currentTarget as HTMLElement);
      };
      return { anchorEl, toggle, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="toggle">
          {{ anchorEl ? 'Hide' : 'Show' }}
        </Button>
        <Popper :open="!!anchorEl" :anchor-el="anchorEl" transition placement="bottom-start">
          <template #default="{ transitionProps }">
            <div
              :style="{
                ...paperStyle,
                opacity: transitionProps.in ? 1 : 0,
                transition: 'opacity 200ms ease',
              }"
              @transitionend="() => { if (!transitionProps.in) transitionProps.onExited(); }"
            >
              Fades in, and takes its time leaving.
            </div>
          </template>
        </Popper>
      </div>`,
  }),
};

/**
 * `matchAnchorWidth` locks the element to the anchor's width — `true` for exactly,
 * `"min"` for at least. This is what makes an autocomplete list line up with its
 * field instead of floating beside it.
 */
export const MatchingTheAnchor: Story = {
  name: "Matching the anchor",
  render: () => ({
    components: { Button, Popper },
    setup() {
      const mode = ref<true | "min" | false | null>(null);
      const anchorEl = ref<HTMLElement | null>(null);
      const options: Array<{ label: string; value: true | "min" | false }> = [
        { label: "true", value: true },
        { label: '"min"', value: "min" },
        { label: "false", value: false },
      ];
      const open = (value: true | "min" | false) => (event: MouseEvent) => {
        mode.value = value;
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      return { mode, anchorEl, options, open, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, flexDirection: 'column', alignItems: 'stretch', width: '460px' }">
        <Button
          v-for="option in options"
          :key="option.label"
          size="small"
          variant="ghost"
          @click="open(option.value)"
        >matchAnchorWidth = {{ option.label }}</Button>
        <Popper
          :open="mode !== null"
          :anchor-el="anchorEl"
          :match-anchor-width="mode === null ? false : mode"
          placement="bottom-start"
        >
          <div :style="paperStyle">Short.</div>
        </Popper>
      </div>`,
  }),
};

/**
 * `keepMounted` leaves the element in the DOM while closed, hidden rather than
 * removed. Worth it when the slot content is expensive to build or holds state you
 * do not want to lose; otherwise it is a subtree that keeps running for nothing.
 *
 * `disablePortal` leaves it where it is written instead of moving it to the body.
 * The positioning still works, but the element now inherits any ancestor's
 * `overflow: hidden` — which is the usual reason a dropdown appears clipped.
 */
export const MountingAndPortals: Story = {
  name: "Mounting and portals",
  render: () => ({
    components: { Button, Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const clipped = ref<HTMLElement | null>(null);
      const toggle = (event: MouseEvent) => {
        anchorEl.value = anchorEl.value ? null : (event.currentTarget as HTMLElement);
      };
      const toggleClipped = (event: MouseEvent) => {
        clipped.value = clipped.value ? null : (event.currentTarget as HTMLElement);
      };
      return { anchorEl, clipped, toggle, toggleClipped, surfaceStyle, paperStyle, captionStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, flexDirection: 'column', alignItems: 'flex-start' }">
        <Button size="small" variant="secondary" @click="toggle">
          Toggle a kept-mounted popper
        </Button>
        <Popper :open="!!anchorEl" :anchor-el="anchorEl" keep-mounted>
          <div :style="paperStyle">Still in the DOM when hidden — inspect it.</div>
        </Popper>

        <div
          style="overflow: hidden; width: 320px; height: 90px; padding: 16px;
                 border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 12px"
        >
          <Button size="small" variant="ghost" @click="toggleClipped">
            Open inside an overflow:hidden box
          </Button>
          <Popper :open="!!clipped" :anchor-el="clipped" disable-portal placement="bottom-start">
            <div :style="paperStyle">Cut off by the box, because \`disablePortal\` kept it inside.</div>
          </Popper>
        </div>
        <p :style="captionStyle">The second popper is clipped. Remove \`disablePortal\` and it is not.</p>
      </div>`,
  }),
};

/**
 * `modifiers` reaches Popper.js directly. The commonest one by far is `offset` —
 * the gap between the anchor and the element, which is otherwise zero and makes the
 * two look glued together.
 */
export const Offset: Story = {
  render: () => ({
    components: { Button, Popper },
    setup() {
      const distance = ref<number | null>(null);
      const anchorEl = ref<HTMLElement | null>(null);
      const open = (value: number) => (event: MouseEvent) => {
        distance.value = value;
        anchorEl.value = event.currentTarget as HTMLElement;
      };
      const modifiers = () => [{ name: "offset", options: { offset: [0, distance.value ?? 0] } }];
      return { distance, anchorEl, open, modifiers, surfaceStyle, paperStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button v-for="value in [0, 8, 24]" :key="value" size="small" variant="ghost" @click="open(value)">
          offset {{ value }}px
        </Button>
        <Popper :open="distance !== null" :anchor-el="anchorEl" placement="bottom" :modifiers="modifiers()">
          <div :style="paperStyle">{{ distance }}px from the anchor.</div>
        </Popper>
      </div>`,
  }),
};

/**
 * Popper has no dismissal of its own — that is the contract, not an omission. A
 * click outside, Escape, and closing on scroll are all yours to add.
 *
 * If your list of things to add is "backdrop, click-outside, Escape", stop and use
 * `Popover`.
 */
export const YouOwnTheDismissal: Story = {
  name: "You own the dismissal",
  render: () => ({
    components: { Button, Popper },
    setup() {
      const anchorEl = ref<HTMLElement | null>(null);
      const toggle = (event: MouseEvent) => {
        anchorEl.value = anchorEl.value ? null : (event.currentTarget as HTMLElement);
      };
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") anchorEl.value = null;
      };
      return { anchorEl, toggle, onKeydown, surfaceStyle, paperStyle, captionStyle };
    },
    template: `
      <div :style="surfaceStyle" @keydown="onKeydown">
        <Button size="small" variant="secondary" @click="toggle">Open</Button>
        <Popper :open="!!anchorEl" :anchor-el="anchorEl" placement="bottom-start">
          <div :style="paperStyle">
            Escape closes this because the story added a handler. Clicking elsewhere does not,
            because nobody wrote that either.
          </div>
        </Popper>
        <p :style="captionStyle">Focus this frame first, then press Escape.</p>
      </div>`,
  }),
};
