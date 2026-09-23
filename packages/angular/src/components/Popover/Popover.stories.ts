import { signal } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import type { TransitionTimeoutWithAuto } from "../../types";
import { OkklyButton } from "../Button/Button";
import type { PopperPlacement } from "../Popper/Popper";
import { OkklyPopover, type PopoverAnchorPosition } from "./Popover";

/** Every input the templates below bind. */
type PopoverArgs = {
  placement: PopperPlacement;
  matchAnchorWidth: boolean;
  hideBackdrop: boolean;
  disablePortal: boolean;
  transitionDuration: TransitionTimeoutWithAuto;
  minWidth?: number | string;
  popoverClass: string;
  paperClass: string;
};

const surface = `display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 32px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)`;

// The paper brings its own background and border; this is only the padding and
// the text rhythm, which belong to the content rather than to the component.
const body = `padding: 16px; font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm); color: var(--okkly-text-secondary)`;

const menuItem = `display: block; width: 100%; padding: 9px 14px; border: none; background: none; color: var(--okkly-text-secondary); font-family: var(--okkly-font-family-sans); font-size: var(--okkly-font-size-sm); text-align: left; cursor: pointer`;

const caption = `margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)`;

const bindings = `
    [placement]="placement"
    [matchAnchorWidth]="matchAnchorWidth"
    [hideBackdrop]="hideBackdrop"
    [disablePortal]="disablePortal"
    [transitionDuration]="transitionDuration"
    [minWidth]="minWidth"
    [popoverClass]="popoverClass"
    [paperClass]="paperClass"`;

/**
 * A panel anchored to something on the page that closes when you click away from
 * it. It is the middle ground between a `OkklyTooltip`, which cannot be interacted
 * with, and a dialog, which takes over the page: use it for menus, filter panels,
 * date pickers, a profile card — anything that belongs *to* a control rather than
 * to the page.
 *
 * It is `OkklyPopper` plus dismissal: the positioning is the same engine, and
 * Popover adds Escape, click-outside, a surface to put things on, and a Grow
 * transition. If you do not want any of that — a hover card, a dropdown that must
 * not steal focus — you want `OkklyPopper`.
 *
 * Note that it is **not** modal and has **no scrim by default**: `hideBackdrop`
 * starts at `true`, and dismissal comes from a click-outside listener rather than
 * from a backdrop catching the click. Pass `[hideBackdrop]="false"` when you want
 * the page behind sealed off — see `WithABackdrop`.
 *
 * `anchorEl` is what it points at, and a template reference variable is the natural
 * way to hand one over. `anchorPosition` replaces it entirely when you want to
 * anchor to coordinates instead — a right-click menu, a point on a canvas.
 *
 * Inputs follow MUI's Popover where the shapes agree, with placement borrowed from
 * Popper's vocabulary rather than MUI's `anchorOrigin`/`transformOrigin` pair.
 * `onClose(event, reason)` becomes the `close` output, carrying the same pair as
 * one object.
 */
const meta: Meta<PopoverArgs> = {
  title: "Overlays/Popover",
  component: OkklyPopover,
  decorators: [moduleMetadata({ imports: [OkklyPopover, OkklyButton] })],
  args: {
    placement: "bottom-start",
    matchAnchorWidth: false,
    // The component's own default. Set to `false` here it would look as though
    // a scrim were standard, which is the opposite of what this component does.
    hideBackdrop: true,
    disablePortal: false,
    transitionDuration: "auto",
    minWidth: undefined,
    popoverClass: "",
    paperClass: "",
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
        "bottom-start",
        "bottom-end",
        "top-start",
        "top-end",
      ],
    },
    matchAnchorWidth: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    hideBackdrop: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    disablePortal: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    minWidth: { control: "text" },
    popoverClass: { control: "text" },
    paperClass: { control: "text" },
  },
  parameters: { controls: { exclude: ["open", "anchorEl", "anchorPosition", "close"] } },
  render: (args) => ({
    props: { ...args, anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" (click)="anchor.set($event.currentTarget)">
          Open the popover
        </button>
        <okkly-popover
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          (close)="anchor.set(null)"
          ${bindings}
        >
          <div style="${body}">
            <p style="margin: 0">Anchored to the button. Click outside or press Escape.</p>
          </div>
        </okkly-popover>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<PopoverArgs>;

/**
 * Play with every input from the controls panel.
 */
export const Playground: Story = {};

/**
 * The commonest use: a menu hanging off a button. `bottom-end` aligns its right
 * edge with the trigger's, which is what keeps a right-aligned toolbar menu from
 * running off the page.
 *
 * The toolbar is pushed to the right here for a reason. `bottom-end` is a
 * preference, and the `flip` modifier changes the variation as readily as the side:
 * put this trigger near the left edge and a 200px menu aligned to its right edge
 * would start off-screen, so Popper quietly serves you `bottom-start` instead. That
 * is correct behaviour, and it is why a story about `-end` has to leave room for it.
 *
 * Each item closes the popover. A menu that stays open after a choice makes the
 * user dismiss it themselves, which is one interaction too many.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => ({
    props: {
      anchor: signal<HTMLElement | null>(null),
      last: signal<string | null>(null),
      items: ["Duplicate", "Move to…", "Rename", "Delete"],
    },
    template: `
      <div style="${surface}">
        <div style="display: flex; justify-content: flex-end; width: 420px">
          <button okklyButton size="small" variant="secondary" (click)="anchor.set($event.currentTarget)">
            Actions
          </button>
        </div>
        <okkly-popover
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          (close)="anchor.set(null)"
          placement="bottom-end"
          [minWidth]="200"
        >
          <div style="padding: 6px 0">
            @for (item of items; track item) {
              <button
                type="button"
                style="${menuItem}"
                [style.color]="item === 'Delete' ? 'var(--okkly-accent-ember)' : null"
                (click)="last.set(item); anchor.set(null)"
              >{{ item }}</button>
            }
          </div>
        </okkly-popover>
        <p style="${caption}">Chose: {{ last() ?? "—" }}</p>
      </div>`,
  }),
};

/**
 * `matchAnchorWidth` locks the paper to the trigger's width, which is what makes a
 * popover read as a dropdown belonging to the field above it rather than a panel
 * that happens to be nearby. It is what a select or an autocomplete uses.
 *
 * `minWidth` is the other half: a floor for the case where the anchor is tiny.
 */
export const MatchingTheAnchor: Story = {
  name: "Matching the anchor",
  render: () => ({
    props: {
      anchor: signal<HTMLElement | null>(null),
      which: signal<"matched" | "free" | null>(null),
    },
    template: `
      <div style="${surface}; flex-direction: column; align-items: stretch; width: 420px">
        <button
          okklyButton
          size="small"
          variant="secondary"
          (click)="which.set('matched'); anchor.set($event.currentTarget)"
        >A wide trigger — matched width</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          (click)="which.set('free'); anchor.set($event.currentTarget)"
        >A wide trigger — natural width</button>
        <okkly-popover
          [open]="which() !== null"
          [anchorEl]="anchor()"
          [matchAnchorWidth]="which() === 'matched'"
          (close)="which.set(null); anchor.set(null)"
        >
          <div style="${body}">
            {{ which() === "matched"
              ? "As wide as the trigger, however wide that is."
              : "As wide as this text needs to be." }}
          </div>
        </okkly-popover>
      </div>`,
  }),
};

/**
 * `anchorPosition` anchors to a point instead of an element — the context-menu case.
 * Right-click the panel below: the popover opens where the pointer was, not where
 * any button is.
 *
 * `anchorEl` wins when both are set, so there is nothing to keep in state except
 * the coordinates.
 */
export const AtAPoint: Story = {
  name: "At a point",
  render: () => ({
    props: {
      position: signal<PopoverAnchorPosition | undefined>(undefined),
      items: ["Cut", "Copy", "Paste"],
    },
    template: `
      <div style="${surface}">
        <div
          style="display: grid; place-items: center; width: 420px; height: 200px; border: var(--okkly-1px-in-rem) dashed var(--okkly-border-default); border-radius: 14px; color: var(--okkly-text-muted); font-size: var(--okkly-font-size-sm)"
          (contextmenu)="$event.preventDefault(); position.set({ top: $event.clientY, left: $event.clientX })"
        >Right-click anywhere in here</div>
        <okkly-popover
          [open]="!!position()"
          [anchorPosition]="position()"
          (close)="position.set(undefined)"
        >
          <div style="padding: 6px 0; min-width: 170px">
            @for (item of items; track item) {
              <button type="button" style="${menuItem}" (click)="position.set(undefined)">
                {{ item }}
              </button>
            }
          </div>
        </okkly-popover>
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
    props: {
      anchor: signal<HTMLElement | null>(null),
      placement: signal<PopperPlacement>("bottom"),
      placements: ["top", "bottom", "left", "right"],
    },
    template: `
      <div style="${surface}; padding: 80px">
        @for (option of placements; track option) {
          <button
            okklyButton
            size="small"
            variant="ghost"
            (click)="placement.set(option); anchor.set($event.currentTarget)"
          >{{ option }}</button>
        }
        <okkly-popover
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          [placement]="placement()"
          (close)="anchor.set(null)"
        >
          <div style="${body}">placement = {{ placement() }}</div>
        </okkly-popover>
      </div>`,
  }),
};

/**
 * Something worth putting in a popover: a small form. It is the shape a dialog
 * would be too heavy for and a tooltip could not hold at all.
 *
 * Note that focus is not trapped — a popover is not modal. Escape and a click
 * outside close it, and Tab walks out of it into the page, which is the behaviour a
 * dropdown wants.
 */
export const AFilterPanel: Story = {
  name: "A filter panel",
  render: () => {
    const active = signal<string[]>(["Albums"]);
    return {
      props: {
        anchor: signal<HTMLElement | null>(null),
        active,
        filters: ["Albums", "Singles", "Remixes", "Unreleased"],
        toggle: (filter: string) =>
          active.update((current) =>
            current.includes(filter)
              ? current.filter((item) => item !== filter)
              : [...current, filter],
          ),
      },
      template: `
        <div style="${surface}">
          <button okklyButton size="small" variant="secondary" (click)="anchor.set($event.currentTarget)">
            Filters ({{ active().length }})
          </button>
          <okkly-popover
            [open]="!!anchor()"
            [anchorEl]="anchor()"
            (close)="anchor.set(null)"
            [minWidth]="260"
          >
            <div style="${body}; display: grid; gap: 12px">
              <strong style="color: var(--okkly-text-primary)">Show</strong>
              @for (filter of filters; track filter) {
                <label style="display: flex; align-items: center; gap: 8px">
                  <input
                    type="checkbox"
                    [checked]="active().includes(filter)"
                    (change)="toggle(filter)"
                  />
                  {{ filter }}
                </label>
              }
              <button okklyButton size="small" (click)="anchor.set(null)">Apply</button>
            </div>
          </okkly-popover>
          <p style="${caption}">Active: {{ active().join(", ") || "none" }}</p>
        </div>`,
    };
  },
};

/**
 * `[hideBackdrop]="false"` adds a real scrim. Both modes dismiss on a click outside;
 * what changes is what that click *also* does.
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
  render: () => {
    const clicks = signal(0);
    return {
      props: {
        anchor: signal<HTMLElement | null>(null),
        which: signal<"bare" | "scrim" | null>(null),
        clicks,
        bump: () => clicks.update((value) => value + 1),
      },
      template: `
        <div style="${surface}">
          <button
            okklyButton
            size="small"
            variant="secondary"
            (click)="which.set('bare'); anchor.set($event.currentTarget)"
          >Open without a scrim</button>
          <button
            okklyButton
            size="small"
            variant="secondary"
            (click)="which.set('scrim'); anchor.set($event.currentTarget)"
          >Open with a scrim</button>
          <button okklyButton size="small" variant="ghost" (click)="bump()">
            A button behind it ({{ clicks() }})
          </button>
          <okkly-popover
            [open]="which() !== null"
            [anchorEl]="anchor()"
            [hideBackdrop]="which() !== 'scrim'"
            (close)="which.set(null); anchor.set(null)"
          >
            <div style="${body}">
              Now click “A button behind it”. Without a scrim the counter goes up as this
              closes; with one, it does not.
            </div>
          </okkly-popover>
        </div>`,
    };
  },
};

/**
 * `transitionDuration` takes `"auto"`, a number, or `{ enter, exit }`. `"auto"`
 * derives it from the paper's height, which keeps a long menu and a short one
 * feeling like the same control.
 */
export const TransitionDuration: Story = {
  name: "Transition duration",
  render: () => ({
    props: {
      anchor: signal<HTMLElement | null>(null),
      duration: signal<TransitionTimeoutWithAuto>("auto"),
      options: ["auto", 0, 150, 600],
    },
    template: `
      <div style="${surface}">
        @for (option of options; track option) {
          <button
            okklyButton
            size="small"
            variant="ghost"
            (click)="duration.set(option); anchor.set($event.currentTarget)"
          >{{ option }}</button>
        }
        <okkly-popover
          [open]="!!anchor()"
          [anchorEl]="anchor()"
          [transitionDuration]="duration()"
          (close)="anchor.set(null)"
        >
          <div style="${body}">
            transitionDuration = {{ duration() }}
            <br />
            Close it to see the exit at the same speed.
          </div>
        </okkly-popover>
      </div>`,
  }),
};

/**
 * The anchor has to be a value change detection can see. A template reference
 * variable is one — it resolves to the real element before the binding is read, so
 * there is no first-click-opens-in-the-corner version of this in Angular. What you
 * still must not do is stash the element in a plain field that nothing re-reads: put
 * it in a signal, as every story here does.
 */
export const AnchorMustBeState: Story = {
  name: "Anchor must be state",
  render: () => ({
    props: { anchor: signal<HTMLElement | null>(null) },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="anchor.set($event.currentTarget)">
          Correct — anchor in a signal
        </button>
        <okkly-popover [open]="!!anchor()" [anchorEl]="anchor()" (close)="anchor.set(null)">
          <div style="${body}">Anchored where it should be.</div>
        </okkly-popover>
      </div>`,
  }),
};
