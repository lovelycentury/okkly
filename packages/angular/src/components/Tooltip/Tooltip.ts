import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
  type ComponentRef,
} from "@angular/core";
import type { Modifier } from "@popperjs/core";
import { growSurface } from "../../helpers/transitions";
import type { TransitionTimeoutWithAuto } from "../../types";
import { OkklyPopper, type PopperPlacement } from "../Popper/Popper";

export type TooltipPlacement = PopperPlacement;

/** A tooltip's content: a plain string, or a template for something richer. */
export type TooltipTitle = string | TemplateRef<unknown>;

/** Keeps the arrow clear of a rounded corner. */
const ARROW_PADDING = 8;

/**
 * Grace period for reaching an interactive tooltip.
 *
 * The bubble is offset a few pixels off its anchor, and that gap belongs to
 * neither of them — leaving the trigger to walk into the tooltip still fires
 * `mouseleave`. With a `leaveDelay` of 0 the close timer fires on the next
 * tick, long before a pointer can cross, so an interactive tooltip would be
 * unreachable. This is the floor that makes the trip possible; entering the
 * bubble cancels the timer.
 */
const INTERACTIVE_LEAVE_DELAY = 120;

let nextId = 0;

/**
 * The bubble half of the tooltip. The trigger directive creates one of these
 * per tooltip and drives it through `setInput`, since a directive has no
 * template of its own to render a popper from.
 *
 * @internal
 */
@Component({
  selector: "okkly-tooltip-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: "display: contents" },
  imports: [NgTemplateOutlet, OkklyPopper],
  templateUrl: "./Tooltip.html",
})
export class OkklyTooltipPanel {
  readonly title = input<string>("");
  readonly titleTemplate = input<TemplateRef<unknown> | null>(null);
  readonly open = input(false);
  readonly anchorEl = input<HTMLElement | null>(null);
  readonly placement = input<TooltipPlacement>("top");
  readonly arrow = input(true);
  readonly interactive = input(true);
  readonly transitionDuration = input<TransitionTimeoutWithAuto>("auto");
  readonly tooltipId = input("");
  readonly tooltipClass = input("");

  /** The pointer arrived in the bubble; the trigger cancels its pending close. */
  readonly pointerEnter = output<void>();
  /** The pointer left the bubble; the trigger schedules a close. */
  readonly pointerLeave = output<void>();

  private readonly popper = viewChild(OkklyPopper);
  private readonly popup = viewChild<ElementRef<HTMLElement>>("popup");
  private readonly arrowElement = viewChild<ElementRef<HTMLElement>>("arrowElement");

  protected readonly popperClasses = computed(() =>
    ["okkly-tooltip", this.interactive() && "okkly-tooltip--interactive", this.tooltipClass()]
      .filter(Boolean)
      .join(" "),
  );

  /**
   * The side the tooltip actually landed on. `data-popper-placement` and the
   * popup modifier both key off it, so the arrow follows a flip instead of
   * pointing at the side that was originally requested.
   */
  protected readonly currentPlacement = computed(
    () => this.popper()?.resolvedPlacement() ?? this.placement(),
  );

  protected readonly popupClasses = computed(() =>
    [
      "okkly-tooltip__popup",
      `okkly-tooltip__popup--${this.currentPlacement().split("-")[0]}`,
      !this.arrow() && "okkly-tooltip__popup--no-arrow",
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected readonly modifiers = computed<Array<Partial<Modifier<string, object>>>>(() => {
    const arrowElement = this.arrowElement()?.nativeElement;
    return [
      { name: "offset", options: { offset: [0, this.arrow() ? 10 : 6] } },
      ...(this.arrow() && arrowElement
        ? [{ name: "arrow", options: { element: arrowElement, padding: ARROW_PADDING } }]
        : []),
    ];
  });

  /** Whether the bubble is in the DOM — `true` until its exit has finished. */
  protected readonly popupMounted = growSurface({
    open: () => this.open(),
    element: () => this.popup()?.nativeElement,
    timeout: () => this.transitionDuration(),
    onEnter: () => this.popper()?.notifyEnter(),
    onExited: () => this.popper()?.notifyExited(),
  });
}

/**
 * Inputs follow Angular Material's tooltip API
 * (https://material.angular.dev/components/tooltip/api): it is a directive on
 * the trigger itself rather than a wrapper, and every input is namespaced the
 * way `matTooltip*` is, so nothing collides with the other directives a
 * trigger carries. Everything specific to this design system mirrors
 * `@okkly/react`'s `<Tooltip>`, which follows MUI's Tooltip API
 * (https://mui.com/material-ui/api/tooltip/): `placement`/`open`/
 * `defaultOpen`/`enterDelay`/`leaveDelay`/`arrow`/`disableHoverListener`/
 * `disableFocusListener`/`describeChild`/`transitionDuration` match
 * name-for-name behind the prefix. `interactive` is MUI's `disableInteractive`
 * with the sense flipped — same default behaviour, and see the input for why.
 * Deliberate gaps: no `sx`/`classes`/`slots`, no `followCursor`, no
 * `enterTouchDelay`, and no `show()`/`hide()`/`toggle()` — `okklyTooltipOpen`
 * is a two-way binding, which is the same control without the imperative call.
 *
 * Built on `OkklyPopper`, like MUI's. That is what makes it flip near a
 * viewport edge, escape an `overflow: hidden` ancestor, and put its arrow on
 * the side it actually ended up on rather than the side that was asked for.
 *
 * Angular-forced differences:
 * - React's single-child `children` is the host element: the directive sits on
 *   the trigger, so its listeners and ARIA attributes land on the real control
 *   with no wrapper — the same DOM `cloneElement` produces in React.
 * - `title` becomes the `okklyTooltip` input, a string or a `TemplateRef` for
 *   the rich content React passes as a `ReactNode`.
 * - `onOpen`/`onClose` become the `okklyTooltipOpened`/`okklyTooltipClosed`
 *   outputs, and the controlled `open` becomes a `model` so it can be bound
 *   with `[(okklyTooltipOpen)]`.
 */
@Directive({
  selector: "[okklyTooltip]",
  host: {
    class: "okkly-tooltip__trigger",
    "[attr.aria-describedby]": "describedBy()",
    "[attr.aria-label]": "ariaLabel()",
    "[attr.aria-labelledby]": "labelledBy()",
    "(mouseenter)": "onPointerEnter()",
    "(mouseleave)": "onPointerLeave()",
    // `focusin`/`focusout` rather than `focus`/`blur`, so a trigger that
    // focuses something inside itself still counts — React's synthetic
    // `onFocus`/`onBlur` bubble the same way.
    "(focusin)": "onFocus()",
    "(focusout)": "onBlur()",
  },
})
export class OkklyTooltip {
  /**
   * Tooltip content. An empty title renders nothing, as in MUI. Pass a
   * `TemplateRef` for content richer than a string.
   *
   * @default ""
   */
  readonly title = input<TooltipTitle | undefined>(undefined, { alias: "okklyTooltip" });
  /**
   * Side of the trigger the tooltip is placed on, before `flip` gets a say.
   *
   * @default "top"
   */
  readonly placement = input<TooltipPlacement>("top", { alias: "okklyTooltipPlacement" });
  /**
   * Whether the tooltip is open. Bind it with `[(okklyTooltipOpen)]` to drive
   * the tooltip yourself; leave it unbound and the component owns the state.
   *
   * @default undefined
   */
  readonly open = model<boolean | undefined>(undefined, { alias: "okklyTooltipOpen" });
  /**
   * Seeds the open state while `okklyTooltipOpen` is unbound.
   *
   * @default false
   */
  readonly defaultOpen = input(false, {
    alias: "okklyTooltipDefaultOpen",
    transform: booleanAttribute,
  });
  /**
   * Delay before opening on hover, in ms.
   *
   * @default 200
   */
  readonly enterDelay = input(200, {
    alias: "okklyTooltipEnterDelay",
    transform: numberAttribute,
  });
  /**
   * Delay before closing on unhover, in ms.
   *
   * @default 0
   */
  readonly leaveDelay = input(0, { alias: "okklyTooltipLeaveDelay", transform: numberAttribute });
  /**
   * Whether a small arrow points back at the trigger.
   *
   * @default true
   */
  readonly arrow = input(true, { alias: "okklyTooltipArrow", transform: booleanAttribute });
  /**
   * Whether hovering the trigger stops opening the tooltip.
   *
   * @default false
   */
  readonly disableHoverListener = input(false, {
    alias: "okklyTooltipDisableHoverListener",
    transform: booleanAttribute,
  });
  /**
   * Whether focusing the trigger stops opening the tooltip.
   *
   * @default false
   */
  readonly disableFocusListener = input(false, {
    alias: "okklyTooltipDisableFocusListener",
    transform: booleanAttribute,
  });
  /**
   * Keep the tooltip open while the pointer is inside it, so its content can be
   * read at leisure — or selected, or followed to a link. MUI spells this
   * `disableInteractive` and has been interactive-by-default since v5; the
   * sense is inverted here, but the default behaviour matches.
   *
   * @default true
   */
  readonly interactive = input(true, {
    alias: "okklyTooltipInteractive",
    transform: booleanAttribute,
  });
  /**
   * Force the tooltip to *describe* the trigger rather than name it, even when
   * the trigger has no name of its own. Off by default: the choice is normally
   * made automatically, see the class comment.
   *
   * @default false
   */
  readonly describeChild = input(false, {
    alias: "okklyTooltipDescribeChild",
    transform: booleanAttribute,
  });
  /**
   * Grow timeout; `'auto'` like MUI.
   *
   * @default "auto"
   */
  readonly transitionDuration = input<TransitionTimeoutWithAuto>("auto", {
    alias: "okklyTooltipTransitionDuration",
  });
  /**
   * Extra classes for the tooltip's own root, Angular Material's `matTooltipClass`.
   *
   * @default ""
   */
  readonly tooltipClass = input("", { alias: "okklyTooltipClass" });

  /** Emitted when the tooltip opens. */
  readonly opened = output<void>({ alias: "okklyTooltipOpened" });
  /** Emitted when the tooltip closes. */
  readonly closed = output<void>({ alias: "okklyTooltipClosed" });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly tooltipId = `okkly-tooltip-${nextId++}`;

  private enterTimer: ReturnType<typeof setTimeout> | undefined;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly panel = signal<ComponentRef<OkklyTooltipPanel> | null>(null);
  /** The trigger's own visible label, re-read after every render. */
  private readonly triggerText = signal("");
  /**
   * Read once, before any binding below could overwrite it: a trigger that
   * names itself keeps its own name.
   */
  private readonly ownAriaLabel = this.host.nativeElement.getAttribute("aria-label");

  private readonly titleTemplate = computed(() => {
    const title = this.title();
    return title instanceof TemplateRef ? title : null;
  });
  private readonly titleText = computed(() => {
    const title = this.title();
    return typeof title === "string" ? title : "";
  });
  private readonly hasTitle = computed(() => Boolean(this.titleTemplate() || this.titleText()));

  /** Whether the tooltip is on screen. An empty title renders nothing, as in MUI. */
  readonly isOpen = computed(() => (this.open() ?? this.defaultOpen()) && this.hasTitle());

  /**
   * A description is not a name. An icon button whose only label is its tooltip
   * was announced as a bare "button", because `aria-describedby` is all this
   * used to contribute — and only while open at that. So: when the trigger has
   * a name of its own, the tooltip stays a description; when it has none, the
   * tooltip becomes the name, permanently rather than on hover.
   *
   * MUI takes the blunter route and labels the child whenever `title` is a
   * string, overwriting whatever the button already said. That breaks "label in
   * name" for anyone driving the page by voice — they read the visible word and
   * say it, and it is not the accessible name. Hence the check rather than the
   * blanket rule.
   */
  private readonly describes = computed(
    () => this.describeChild() || Boolean(this.ownAriaLabel) || Boolean(this.triggerText()),
  );

  protected readonly describedBy = computed(() =>
    this.describes() && this.isOpen() ? this.tooltipId : null,
  );
  protected readonly ariaLabel = computed(() => {
    if (this.ownAriaLabel) return this.ownAriaLabel;
    if (this.describes() || this.titleTemplate()) return null;
    return this.titleText() || null;
  });
  protected readonly labelledBy = computed(() =>
    !this.describes() && this.titleTemplate() && this.isOpen() ? this.tooltipId : null,
  );

  constructor() {
    afterEveryRender(() => this.triggerText.set(this.host.nativeElement.textContent?.trim() ?? ""));

    // Created after the first render rather than in the constructor, so the
    // view tree is settled before a component is added to it. The panel draws
    // nothing while closed, so an always-present one costs a host element.
    afterNextRender(() => {
      const panel = this.viewContainer.createComponent(OkklyTooltipPanel);
      panel.instance.pointerEnter.subscribe(() => this.onTooltipEnter());
      panel.instance.pointerLeave.subscribe(() => this.onTooltipLeave());
      this.panel.set(panel);
    });

    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      panel.setInput("open", this.isOpen());
      panel.setInput("anchorEl", this.host.nativeElement);
      panel.setInput("title", this.titleText());
      panel.setInput("titleTemplate", this.titleTemplate());
      panel.setInput("placement", this.placement());
      panel.setInput("arrow", this.arrow());
      panel.setInput("interactive", this.interactive());
      panel.setInput("transitionDuration", this.transitionDuration());
      panel.setInput("tooltipId", this.tooltipId);
      panel.setInput("tooltipClass", this.tooltipClass());
    });

    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  private clearTimers(): void {
    clearTimeout(this.enterTimer);
    clearTimeout(this.leaveTimer);
  }

  private setOpen(next: boolean): void {
    // Committing a state change now makes any scheduled one stale. Without
    // this, a hover-open still inside its `enterDelay` when focus/blur decides
    // the matter fires afterwards and reopens a tooltip the blur just closed —
    // which is what a pointer resting on the trigger does.
    this.clearTimers();
    this.open.set(next);
    if (next) this.opened.emit();
    else this.closed.emit();
  }

  private scheduleOpen(): void {
    this.clearTimers();
    this.enterTimer = setTimeout(() => this.setOpen(true), this.enterDelay());
  }

  private scheduleClose(): void {
    this.clearTimers();
    const delay = this.interactive()
      ? Math.max(this.leaveDelay(), INTERACTIVE_LEAVE_DELAY)
      : this.leaveDelay();
    this.leaveTimer = setTimeout(() => this.setOpen(false), delay);
  }

  protected onPointerEnter(): void {
    if (!this.disableHoverListener()) this.scheduleOpen();
  }

  protected onPointerLeave(): void {
    if (!this.disableHoverListener()) this.scheduleClose();
  }

  protected onFocus(): void {
    if (!this.disableFocusListener()) this.setOpen(true);
  }

  protected onBlur(): void {
    if (!this.disableFocusListener()) this.setOpen(false);
  }

  // Arriving in the tooltip cancels the pending close; leaving it starts a new
  // one. Without the first of these, a tooltip you reach for vanishes exactly
  // as you get there.
  private onTooltipEnter(): void {
    if (this.interactive()) this.clearTimers();
  }

  private onTooltipLeave(): void {
    if (this.interactive()) this.scheduleClose();
  }
}
