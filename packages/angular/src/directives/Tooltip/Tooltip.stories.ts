import { signal } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import type { TransitionTimeoutWithAuto } from "../../types";
import { OkklyButton } from "../../components/Button/Button";
import { OkklyTooltip, type TooltipPlacement } from "./Tooltip";

/** Every input the templates below bind, plus `label` for the trigger's text. */
type TooltipArgs = {
  label: string;
  title: string;
  placement: TooltipPlacement;
  arrow: boolean;
  enterDelay: number;
  leaveDelay: number;
  interactive: boolean;
  describeChild: boolean;
  disableHoverListener: boolean;
  disableFocusListener: boolean;
  transitionDuration: TransitionTimeoutWithAuto;
  tooltipClass: string;
};

// Generous padding: a tooltip is positioned against the viewport, and a trigger
// hard against an edge gets flipped to the other side, which makes a placement
// story lie about what it is showing.
const surface = `display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 48px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)`;

const caption = `margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)`;

const iconButton = `display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 10px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); cursor: pointer`;

/** `iconSettings`, `iconInfo` and `iconTrash` from `@okkly/icons`, inlined. */
const glyph = (path: string) =>
  `<span aria-hidden="true" style="display: inline-flex"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg></span>`;

const settingsGlyph = glyph(
  `<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />`,
);
const infoGlyph = glyph(
  `<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />`,
);
const trashGlyph = glyph(
  `<path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />`,
);

/**
 * The Playground reads its args off a single `args` object rather than binding
 * each one as a prop of its own. Storybook writes any story prop it does not
 * recognise as an input of `meta.component` straight onto that component's
 * instance — and since every input here is aliased the Angular Material way
 * (`okklyTooltipPlacement`), a prop called `placement` is not recognised, and
 * the assignment would overwrite the input signal it is named after.
 */
const bindings = `
    [okklyTooltip]="args.title"
    [okklyTooltipPlacement]="args.placement"
    [okklyTooltipArrow]="args.arrow"
    [okklyTooltipEnterDelay]="args.enterDelay"
    [okklyTooltipLeaveDelay]="args.leaveDelay"
    [okklyTooltipInteractive]="args.interactive"
    [okklyTooltipDescribeChild]="args.describeChild"
    [okklyTooltipDisableHoverListener]="args.disableHoverListener"
    [okklyTooltipDisableFocusListener]="args.disableFocusListener"
    [okklyTooltipTransitionDuration]="args.transitionDuration"
    [okklyTooltipClass]="args.tooltipClass"`;

/**
 * A short label that appears on hover or focus and says what a control is. Use it
 * where the control cannot say so itself — an icon button, a truncated cell, an
 * abbreviation.
 *
 * Two rules worth stating before the API, because they are what tooltips are
 * usually got wrong on:
 *
 * 1. **It is not a place for content.** It is unreachable on touch, invisible in
 *    print, and gone the moment the pointer moves. Anything the user actually needs
 *    belongs on the page or in an `OkklyPopover`.
 * 2. **It decides whether to name or to describe.** If the trigger already has a
 *    name — visible text or its own `aria-label` — the tooltip is attached as a
 *    description, so the button keeps saying what it says. If the trigger has no
 *    name at all, as an icon button does not, the tooltip becomes the name, and
 *    permanently rather than only while it is on screen. `okklyTooltipDescribeChild`
 *    forces the description side when you want it.
 *
 * `okklyTooltipInteractive` is on by default and keeps the tooltip open while the
 * pointer is inside it, which is what makes a tooltip with a link in it usable at
 * all. Turn it off and moving toward the tooltip closes it.
 *
 * Like Angular Material's `matTooltip`, this is a directive on the trigger itself
 * rather than a wrapper, and every input is namespaced so nothing collides with the
 * other directives the trigger carries. The values behind the prefix follow MUI's
 * Tooltip: `title`, `placement`, `arrow`, `enterDelay`, `leaveDelay`,
 * `open`/`defaultOpen`, `disableHoverListener`, `disableFocusListener`,
 * `interactive`, `describeChild`, `transitionDuration`. `title` takes a `TemplateRef`
 * as well as a string, which is how you pass content richer than a line of text.
 */
const meta: Meta<TooltipArgs> = {
  title: "Overlays/Tooltip",
  component: OkklyTooltip,
  decorators: [moduleMetadata({ imports: [OkklyTooltip, OkklyButton] })],
  args: {
    label: "Hover me",
    title: "Saved to your library",
    placement: "top",
    arrow: false,
    enterDelay: 100,
    leaveDelay: 0,
    // The component's own defaults, so the Playground starts where the
    // component does rather than somewhere the docs would then have to explain.
    interactive: true,
    describeChild: false,
    disableHoverListener: false,
    disableFocusListener: false,
    transitionDuration: "auto",
    tooltipClass: "",
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here. `booleanAttribute` inputs need an explicit
  // one — their compiled default reads as the whole `input()` call, which
  // Storybook cannot infer a toggle from.
  argTypes: {
    label: { control: "text", description: "The trigger's own text." },
    title: { control: "text" },
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
      ],
    },
    enterDelay: { control: "number" },
    leaveDelay: { control: "number" },
    arrow: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    interactive: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    describeChild: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableHoverListener: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disableFocusListener: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    tooltipClass: { control: "text" },
  },
  // `isOpen` is public but derived from `open`/`defaultOpen`/`title` rather than
  // set, so Compodoc surfaces it and it does not belong in a table of knobs.
  parameters: { controls: { exclude: ["open", "defaultOpen", "isOpen", "opened", "closed"] } },
  render: (args) => ({
    props: { args },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary"${bindings}>{{ args.label }}</button>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<TooltipArgs>;

/**
 * Play with every input from the controls panel.
 */
export const Playground: Story = {};

/**
 * The case tooltips are for: a row of icon buttons where nothing is written down.
 * Each one is a real `<button>` with no text, so the tooltip is what names it — for
 * the eye and for the accessibility tree both.
 *
 * Inspect one in the accessibility panel: it carries `aria-label`, not
 * `aria-describedby`, and it carries it whether or not the tooltip is showing. A
 * description would leave the button nameless, which is what "button, button,
 * button" sounds like to a screen reader.
 */
export const NamingIconButtons: Story = {
  name: "Naming icon buttons",
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <button type="button" style="${iconButton}" okklyTooltip="Settings">${settingsGlyph}</button>
        <button type="button" style="${iconButton}" okklyTooltip="About this release">${infoGlyph}</button>
        <button
          type="button"
          style="${iconButton}"
          okklyTooltip="Delete — this cannot be undone"
        >${trashGlyph}</button>
        <p style="${caption}">Tab through them: each one is announced by its tooltip.</p>
      </div>`,
  }),
};

/**
 * Twelve placements. The one you ask for is a preference, not a guarantee — a
 * tooltip that would leave the viewport flips to the opposite side. That is why the
 * stories here sit well inside the frame.
 */
export const Placements: Story = {
  render: () => ({
    props: {
      placements: [
        "top-start",
        "top",
        "top-end",
        "left-start",
        "left",
        "left-end",
        "right-start",
        "right",
        "right-end",
        "bottom-start",
        "bottom",
        "bottom-end",
      ],
    },
    template: `
      <div style="${surface}; display: grid; grid-template-columns: repeat(3, 1fr); width: 560px">
        @for (placement of placements; track placement) {
          <button
            okklyButton
            size="small"
            variant="ghost"
            [okklyTooltip]="placement"
            [okklyTooltipPlacement]="placement"
          >{{ placement }}</button>
        }
      </div>`,
  }),
};

/**
 * Naming versus describing, side by side. The choice is made from the trigger, not
 * from an input:
 *
 * - **No name of its own** (an icon button) → the tooltip becomes the name,
 *   `aria-label`, present whether or not the tooltip is open.
 * - **Has a name** (a button with text, or its own `aria-label`) → the tooltip is a
 *   description, `aria-describedby`, added while it is open. The button goes on
 *   saying what is written on it, which is what voice control needs.
 * - **`okklyTooltipDescribeChild`** → forces the description side even for a
 *   nameless trigger. For when something else on the page already labels it.
 *
 * The alternative — labelling every trigger with its title, as MUI does — renames
 * “Publish” to whatever the tooltip says, and then the user who says “click
 * Publish” is talking about a control that is no longer called that.
 */
export const NamingVersusDescribing: Story = {
  name: "Naming versus describing",
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <button type="button" style="${iconButton}" okklyTooltip="Settings">${settingsGlyph}</button>
        <button
          okklyButton
          size="small"
          variant="secondary"
          okklyTooltip="Makes your edits visible to everyone"
        >Publish</button>
        <button
          type="button"
          style="${iconButton}"
          okklyTooltip="Described, not named"
          okklyTooltipDescribeChild
        >${infoGlyph}</button>
        <p style="${caption}">
          Left: named by the tooltip. Middle: still called “Publish”, with the tooltip as
          its description. Right: describeChild, so it has no name at all — deliberately.
        </p>
      </div>`,
  }),
};

/**
 * `okklyTooltipArrow` points at the trigger. It earns its keep when several targets
 * sit close together and the tooltip could plausibly belong to any of them; on a
 * lone button it is decoration.
 */
export const WithAnArrow: Story = {
  name: "With an arrow",
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          variant="secondary"
          okklyTooltip="No arrow"
          [okklyTooltipArrow]="false"
        >Plain</button>
        <button
          okklyButton
          size="small"
          variant="secondary"
          okklyTooltip="With an arrow"
        >Arrow</button>
      </div>`,
  }),
};

/**
 * `okklyTooltipEnterDelay` is what stops a row of controls from flashing tooltips as
 * the pointer crosses it. `okklyTooltipLeaveDelay` holds it open a moment after
 * leaving, which matters when the pointer has to cross a gap to reach the tooltip
 * itself.
 *
 * Around 100ms in and 0 out is the working default. Zero in means every pass over
 * the control fires; a long delay means the user has stopped and wondered before it
 * answers.
 */
export const Delays: Story = {
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="No delay at all"
          okklyTooltipEnterDelay="0"
        >0ms</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="The default"
          okklyTooltipEnterDelay="100"
        >100ms</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="Deliberate"
          okklyTooltipEnterDelay="600"
        >600ms</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="Lingers after you leave"
          okklyTooltipEnterDelay="0"
          okklyTooltipLeaveDelay="800"
        >leaveDelay 800ms</button>
        <p style="${caption}">Sweep the pointer across all four to feel the difference.</p>
      </div>`,
  }),
};

/**
 * `okklyTooltipInteractive` keeps the tooltip open while the pointer is over it, so
 * a link or a shortcut inside it can actually be reached. Without it, the tooltip
 * closes as soon as the pointer leaves the trigger — including on its way to the
 * tooltip.
 *
 * Both tooltips below are templates rather than strings, which is how you pass
 * content richer than a line of text.
 *
 * If you find yourself needing this, check whether the content should be in an
 * `OkklyPopover` instead: a tooltip with things to click in it is usually a small
 * popover that has not admitted it yet.
 */
export const Interactive: Story = {
  render: () => ({
    props: {},
    template: `
      <ng-template #plain>
        Not reachable — try to move onto this
        <a href="#nope" style="color: var(--okkly-accent-primary)">link</a>
      </ng-template>
      <ng-template #reachable>
        Reachable — this
        <a href="#yes" style="color: var(--okkly-accent-primary)">link</a>
        can be clicked
      </ng-template>
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          variant="ghost"
          [okklyTooltip]="plain"
          [okklyTooltipInteractive]="false"
        >Plain</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          [okklyTooltip]="reachable"
          okklyTooltipLeaveDelay="150"
        >Interactive</button>
      </div>`,
  }),
};

/**
 * Bind `okklyTooltipOpen` and the tooltip is yours to drive — for an onboarding
 * hint, a validation message, or anything that should appear without the pointer.
 * It is a two-way binding, so `[(okklyTooltipOpen)]` keeps your state in step with
 * the hover and focus the component still detects.
 */
export const Controlled: Story = {
  render: () => ({
    props: { open: signal(true) },
    template: `
      <div style="${surface}">
        <button
          okklyButton
          size="small"
          variant="secondary"
          okklyTooltip="Held open from the outside"
          [okklyTooltipOpen]="open()"
        >The target</button>
        <button okklyButton size="small" variant="ghost" (click)="open.set(!open())">
          {{ open() ? "Hide it" : "Show it" }}
        </button>
        <p style="${caption}">
          Hover does nothing lasting here — okklyTooltipOpen is what decides.
        </p>
      </div>`,
  }),
};

/**
 * The listeners can be switched off one at a time. `okklyTooltipDisableFocusListener`
 * is the one to think twice about: it is what removes the tooltip for anyone
 * navigating by keyboard, so unless the trigger carries its own accessible name,
 * that user is left with an unlabelled control.
 */
export const DisablingListeners: Story = {
  name: "Disabling listeners",
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="ghost" okklyTooltip="Hover and focus both">
          Both
        </button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="Focus only"
          okklyTooltipDisableHoverListener
        >Focus only — Tab to it</button>
        <button
          okklyButton
          size="small"
          variant="ghost"
          okklyTooltip="Hover only"
          okklyTooltipDisableFocusListener
        >Hover only</button>
      </div>`,
  }),
};

/**
 * A tooltip on a disabled control needs a wrapper: a disabled button fires no
 * pointer events, so the listeners never hear anything. Put the directive on a span
 * around it — and say *why* it is disabled, which is the one thing a disabled
 * control cannot tell anyone by itself.
 */
export const OnADisabledControl: Story = {
  name: "On a disabled control",
  render: () => ({
    props: {},
    template: `
      <div style="${surface}">
        <span
          tabindex="0"
          style="display: inline-flex"
          okklyTooltip="Add a title before you can publish"
        >
          <button okklyButton size="small" disabled>Publish</button>
        </span>
        <button
          okklyButton
          size="small"
          disabled
          okklyTooltip="This one hears nothing — the button swallows the events"
        >Publish (no wrapper)</button>
        <p style="${caption}">Only the first one responds.</p>
      </div>`,
  }),
};
