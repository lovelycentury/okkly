import { signal } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyPopper, type PopperMatchAnchorWidth, type PopperPlacement } from "./Popper";

/** Every input the templates below bind. */
type PopperArgs = {
  placement: PopperPlacement;
  keepMounted: boolean;
  disablePortal: boolean;
  transition: boolean;
  matchAnchorWidth: PopperMatchAnchorWidth;
  minWidth?: number | string;
  role: string;
  popperClass: string;
};

const surface = `display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 48px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)`;

// Popper paints nothing, so every story has to bring a surface — the same
// bargain `OkklyModal` makes, for the same reason: a component that drew a
// panel could not be the base of a tooltip, an autocomplete list and a
// selection toolbar at once.
const paper = `max-width: 280px; padding: 14px 16px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 12px; background: var(--okkly-bg-surface-raised); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm); box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.55)`;

const caption = `margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)`;

const bindings = `
    [placement]="placement"
    [keepMounted]="keepMounted"
    [disablePortal]="disablePortal"
    [transition]="transition"
    [matchAnchorWidth]="matchAnchorWidth"
    [minWidth]="minWidth"
    [role]="role"
    [popperClass]="popperClass"`;

/**
 * Positioning and nothing else. Popper puts an element next to another element and
 * keeps it there — through scrolling, resizing, and the edges of the viewport — and
 * makes no decision about how it opens, closes, or looks.
 *
 * That is the difference from `OkklyPopover`, which is this plus a backdrop, a
 * click-outside, Escape and a surface. Choose Popper when you want to own the
 * dismissal: a hover card, an autocomplete list that must not steal focus, a toolbar
 * that follows a selection. Choose `OkklyPopover` for a menu or a panel — you will
 * otherwise rebuild it.
 *
 * It draws no surface, exactly as `OkklyModal` draws none. The projected content
 * brings its own background, or it sits transparent on the page.
 *
 * Two behaviours worth knowing. It flips and shifts to stay on screen, so
 * `placement` is a preference rather than an instruction. And `anchorEl` accepts a
 * virtual element — an object with `getBoundingClientRect` — which is how you anchor
 * to a text selection or a point on a canvas that has no DOM node of its own.
 *
 * Inputs follow MUI's Popper: `anchorEl`, `placement`, `keepMounted`,
 * `disablePortal`, `container`, `modifiers`, `popperOptions`, `transition`. React's
 * render-prop `children({ placement, TransitionProps })` becomes public state on the
 * component: read `resolvedPlacement()` off a template reference variable, and drive
 * a transition through `notifyEnter()`/`notifyExited()`.
 */
const meta: Meta<PopperArgs> = {
  title: "Overlays/Popper",
  component: OkklyPopper,
  decorators: [moduleMetadata({ imports: [OkklyPopper, OkklyButton] })],
  args: {
    placement: "bottom",
    keepMounted: false,
    disablePortal: false,
    transition: false,
    matchAnchorWidth: false,
    minWidth: undefined,
    role: "tooltip",
    popperClass: "",
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here. `booleanAttribute` inputs need an explicit
  // one — their compiled default reads as the whole `input()` call, which
  // Storybook cannot infer a toggle from.
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
    keepMounted: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disablePortal: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    transition: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    matchAnchorWidth: { control: "inline-radio", options: [false, true, "min"] },
    minWidth: { control: "text" },
    role: { control: "text" },
    popperClass: { control: "text" },
  },
  // Public, but read rather than set: they are the component's output side, not
  // knobs a docs table should offer.
  parameters: {
    controls: { exclude: ["open", "anchorEl", "resolvedPlacement", "popperInstance", "update"] },
  },
  render: (args) => ({
    props: { ...args, anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          #trigger
          (click)="anchor.set(anchor() ? null : trigger)"
        >{{ anchor() ? "Hide" : "Show" }} the popper</button>
        <okkly-popper [open]="!!anchor()" [anchorEl]="anchor()"${bindings}>
          <div style="${paper}">
            Positioned, and nothing else. Nothing here closes it but the button.
          </div>
        </okkly-popper>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<PopperArgs>;

/**
 * Play with every input from the controls panel.
 */
export const Playground: Story = {};

/**
 * A hover card — the case `OkklyPopover` cannot do, because its backdrop would
 * swallow the hover and its click-outside would fight the pointer. Popper positions;
 * the story owns when it appears.
 */
export const AHoverCard: Story = {
  name: "A hover card",
  render: () => ({
    props: { anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}">
        <p style="margin: 0; max-width: 460px; line-height: 1.7">
          The record was mixed by
          <a
            #link
            href="#ok"
            style="color: var(--okkly-accent-primary)"
            (mouseenter)="anchor.set(link)"
            (mouseleave)="anchor.set(null)"
            (focus)="anchor.set(link)"
            (blur)="anchor.set(null)"
          >Oleksii Kryshtopa</a>
          over two weeks in a room with no windows.
        </p>
        <okkly-popper [open]="!!anchor()" [anchorEl]="anchor()" placement="top-start">
          <div style="${paper}; display: grid; gap: 6px">
            <strong style="color: var(--okkly-text-primary)">Oleksii Kryshtopa</strong>
            <span>Design systems, and records nobody asked for.</span>
          </div>
        </okkly-popper>
      </div>`,
  }),
};

/**
 * Placement is a preference. The engine flips to the opposite side and shifts along
 * the axis to keep the element on screen, so what you ask for is what you get only
 * when there is room for it.
 *
 * `resolvedPlacement()` reports the placement that was actually used — which is how
 * a tooltip knows which way to point its arrow.
 */
export const Placements: Story = {
  render: () => ({
    props: {
      anchor: signal<HTMLElement | null>(null),
      placement: signal<PopperPlacement>("bottom"),
      placements: ["top", "bottom", "left", "right", "top-start", "bottom-end"],
    },
    template: `
      <div style="${surface}; padding: 90px">
        @for (option of placements; track option) {
          <button
            okklyButton
            size="small"
            variant="ghost"
            #button
            (click)="placement.set(option); anchor.set(button)"
          >{{ option }}</button>
        }
        <okkly-popper #popper [open]="!!anchor()" [anchorEl]="anchor()" [placement]="placement()">
          <div style="${paper}">
            asked for <code>{{ placement() }}</code>
            <br />
            resolved to <code>{{ popper.resolvedPlacement() }}</code>
          </div>
        </okkly-popper>
        <p style="${caption}">
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
  render: () => {
    const rect = signal<DOMRect | null>(null);
    return {
      props: {
        rect,
        anchor: () => {
          const current = rect();
          return current ? { getBoundingClientRect: () => current } : null;
        },
        onSelection: () => {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            rect.set(null);
            return;
          }
          rect.set(selection.getRangeAt(0).getBoundingClientRect());
        },
      },
      template: `
        <div style="${surface}">
          <p
            style="margin: 0; max-width: 460px; line-height: 1.8; user-select: text"
            (mouseup)="onSelection()"
            (keyup)="onSelection()"
          >
            Select any part of this sentence and a small toolbar will appear above the
            selection, anchored to a rectangle rather than to an element.
          </p>
          <okkly-popper [open]="!!rect()" [anchorEl]="anchor" placement="top">
            <div style="${paper}; display: flex; gap: 8px; padding: 8px">
              <button okklyButton size="small" variant="ghost">Bold</button>
              <button okklyButton size="small" variant="ghost">Link</button>
              <button okklyButton size="small" variant="ghost">Quote</button>
            </div>
          </okkly-popper>
        </div>`,
    };
  },
};

/**
 * `transition` keeps the popper mounted and positioned until the content says its
 * exit has finished — `notifyEnter()` on the way in, `notifyExited()` on the way
 * out. Without it, Popper is present or absent with nothing in between.
 *
 * `growSurface()` wires both to a Grow animation for you; this story does it by hand
 * so the contract is visible. `OkklyPopover` and `OkklyTooltip` are the real thing.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => ({
    props: { anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          variant="secondary"
          #trigger
          (click)="anchor.set(anchor() ? null : trigger)"
        >{{ anchor() ? "Hide" : "Show" }}</button>
        <okkly-popper
          #popper
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          transition
          placement="bottom-start"
        >
          <div
            style="${paper}; transition: opacity 300ms ease"
            [style.opacity]="anchor() ? 1 : 0"
            (transitionend)="anchor() || popper.notifyExited()"
          >Fades in, and takes its time leaving.</div>
        </okkly-popper>
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
    props: {
      anchor: signal<HTMLElement | null>(null),
      mode: signal<PopperMatchAnchorWidth>(false),
      options: [
        { label: "true", value: true },
        { label: '"min"', value: "min" },
        { label: "false", value: false },
      ],
    },
    template: `
      <div style="${surface}; flex-direction: column; align-items: stretch; width: 460px">
        @for (option of options; track option.label) {
          <button
            okklyButton
            size="small"
            variant="ghost"
            #button
            (click)="mode.set(option.value); anchor.set(button)"
          >matchAnchorWidth = {{ option.label }}</button>
        }
        <okkly-popper
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          [matchAnchorWidth]="mode()"
          placement="bottom-start"
        >
          <div style="${paper}">Short.</div>
        </okkly-popper>
      </div>`,
  }),
};

/**
 * `keepMounted` leaves the element in the DOM while closed, hidden rather than
 * removed. Worth it when the content is expensive to build or holds state you do not
 * want to lose; otherwise it is a subtree that keeps running for nothing.
 *
 * `disablePortal` leaves it where it is written instead of moving it to the body.
 * The positioning still works, but the element now inherits any ancestor's
 * `overflow: hidden` — which is the usual reason a dropdown appears clipped.
 */
export const MountingAndPortals: Story = {
  name: "Mounting and portals",
  render: () => ({
    props: {
      anchor: signal<HTMLElement | null>(null),
      clipped: signal<HTMLElement | null>(null),
    },
    template: `
      <div style="${surface}; flex-direction: column; align-items: flex-start">
        <button
          okklyButton
          size="small"
          variant="secondary"
          #trigger
          (click)="anchor.set(anchor() ? null : trigger)"
        >Toggle a kept-mounted popper</button>
        <okkly-popper [open]="!!anchor()" [anchorEl]="anchor()" keepMounted>
          <div style="${paper}">Still in the DOM when hidden — inspect it.</div>
        </okkly-popper>

        <div style="overflow: hidden; width: 320px; height: 90px; padding: 16px; border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 12px">
          <button
            okklyButton
            size="small"
            variant="ghost"
            #clippedTrigger
            (click)="clipped.set(clipped() ? null : clippedTrigger)"
          >Open inside an overflow:hidden box</button>
          <okkly-popper
            [open]="!!clipped()"
            [anchorEl]="clipped()"
            disablePortal
            placement="bottom-start"
          >
            <div style="${paper}">Cut off by the box, because disablePortal kept it inside.</div>
          </okkly-popper>
        </div>
        <p style="${caption}">The second popper is clipped. Remove disablePortal and it is not.</p>
      </div>`,
  }),
};

/**
 * `modifiers` reaches Popper.js directly. The commonest one by far is `offset` —
 * the gap between the anchor and the element, which is otherwise zero and makes the
 * two look glued together.
 */
export const Offset: Story = {
  render: () => {
    const distance = signal<number | null>(null);
    return {
      props: {
        distance,
        anchor: signal<HTMLElement | null>(null),
        distances: [0, 8, 24],
        modifiers: () => [{ name: "offset", options: { offset: [0, distance() ?? 0] } }],
      },
      template: `
        <div style="${surface}">
          @for (value of distances; track value) {
            <button
              okklyButton
              size="small"
              variant="ghost"
              #button
              (click)="distance.set(value); anchor.set(button)"
            >offset {{ value }}px</button>
          }
          <okkly-popper
            [open]="distance() !== null"
            [anchorEl]="anchor()"
            placement="bottom"
            [modifiers]="modifiers()"
          >
            <div style="${paper}">{{ distance() }}px from the anchor.</div>
          </okkly-popper>
        </div>`,
    };
  },
};

/**
 * Popper has no dismissal of its own — that is the contract, not an omission. A
 * click outside, Escape, and closing on scroll are all yours to add.
 *
 * If your list of things to add is "backdrop, click-outside, Escape", stop and use
 * `OkklyPopover`.
 */
export const YouOwnTheDismissal: Story = {
  name: "You own the dismissal",
  render: () => ({
    props: { anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}" (keydown.escape)="anchor.set(null)">
        <button
          okklyButton
          size="small"
          variant="secondary"
          #trigger
          (click)="anchor.set(anchor() ? null : trigger)"
        >Open</button>
        <okkly-popper [open]="!!anchor()" [anchorEl]="anchor()" placement="bottom-start">
          <div style="${paper}">
            Escape closes this because the story added a handler. Clicking elsewhere does
            not, because nobody wrote that either.
          </div>
        </okkly-popper>
        <p style="${caption}">Focus this frame first, then press Escape.</p>
      </div>`,
  }),
};
