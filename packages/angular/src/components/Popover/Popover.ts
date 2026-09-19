import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  viewChild,
  type ElementRef,
} from "@angular/core";
import type { Modifier, VirtualElement } from "@popperjs/core";
import { onClickOutside, onEscapeKey } from "../../helpers/overlays";
import { portalTo } from "../../helpers/portal";
import { growSurface } from "../../helpers/transitions";
import type { OverlayCloseEvent, TransitionTimeoutWithAuto } from "../../types";
import { OkklyPopper, type PopperPlacement } from "../Popper/Popper";

/** A point in the viewport to anchor to, in place of an element. */
export interface PopoverAnchorPosition {
  top: number;
  left: number;
}

/** Keeps the paper clear of its anchor. */
const OFFSET_MODIFIERS: Array<Partial<Modifier<string, object>>> = [
  { name: "offset", options: { offset: [0, 8] } },
];

function createVirtualAnchor(position: PopoverAnchorPosition): VirtualElement {
  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: position.top,
      left: position.left,
      bottom: position.top,
      right: position.left,
      x: position.left,
      y: position.top,
      toJSON: () => ({}),
    }),
  };
}

/**
 * Inputs mirror `@okkly/react`'s `<Popover>` name-for-name, which in turn
 * follows MUI's Popover API (https://mui.com/material-ui/api/popover/) as
 * closely as this design allows: `open`/`anchorEl`/`anchorPosition`/
 * `placement`/`transitionDuration`/`disablePortal`/`hideBackdrop`/
 * `matchAnchorWidth`/`minWidth` match name-for-name, and closing reports a
 * reason. Opens with the same scale+fade "Grow" animation MUI's Menu and
 * Popover use. Deliberate gaps: no `sx`/`classes`/`slots`, no Modal
 * backdrop/scroll-lock, no `transformOrigin`/`marginThreshold` paper math
 * (Popper.js handles positioning).
 *
 * There is no backdrop to click by default, so a click anywhere outside the
 * paper reports `backdropClick` — from the caller's side it is the same
 * "clicked away" gesture.
 *
 * Angular-forced differences:
 * - `children` becomes the default `<ng-content />`.
 * - `onClose(event, reason)` becomes the `close` output, which emits the pair
 *   as one `OverlayCloseEvent` — an `output()` carries a single value.
 * - `className` and `paperClassName` become `popoverClass` and `paperClass`.
 *   The surfaces are portalled out of the `<okkly-popover>` host, so a `class`
 *   on it would never reach them; the host itself is `display: contents`.
 */
@Component({
  selector: "okkly-popover",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: { style: "display: contents" },
  imports: [OkklyPopper],
  templateUrl: "./Popover.html",
})
export class OkklyPopover {
  /**
   * Whether the popover is on screen.
   *
   * @default undefined
   */
  readonly open = input.required<boolean, unknown>({ transform: booleanAttribute });
  /**
   * Element the paper is positioned against.
   *
   * @default undefined
   */
  readonly anchorEl = input<HTMLElement | null>();
  /**
   * Point in the viewport to anchor to, for a context menu with no element to
   * hang off. Ignored when `anchorEl` is set.
   *
   * @default undefined
   */
  readonly anchorPosition = input<PopoverAnchorPosition>();
  /**
   * Side of the anchor the paper is placed on, before `flip` gets a say.
   *
   * @default "bottom"
   */
  readonly placement = input<PopperPlacement>("bottom");
  /**
   * Grow timeout; defaults to `'auto'` like MUI.
   *
   * @default "auto"
   */
  readonly transitionDuration = input<TransitionTimeoutWithAuto>("auto");
  /**
   * Whether the paper renders in place instead of in `document.body`.
   *
   * @default false
   */
  readonly disablePortal = input(false, { transform: booleanAttribute });
  /**
   * MUI's Popover is a Modal: it always lays an invisible backdrop over the
   * page, so a click anywhere dismisses it and never reaches what is beneath.
   * Here that is opt-in, and the default is inverted from MUI's on purpose —
   * this Popover is the surface behind a select, an autocomplete or a date
   * field, and a modal backdrop would swallow the very interactions those rely
   * on. Pass `false` for the MUI behaviour on a standalone popover.
   *
   * @default true
   */
  readonly hideBackdrop = input(true, { transform: booleanAttribute });
  /**
   * Whether the paper stretches to the anchor's width — what a select-style
   * panel wants.
   *
   * @default false
   */
  readonly matchAnchorWidth = input(false, { transform: booleanAttribute });
  /**
   * Floor for the paper's width. Useful with `matchAnchorWidth` on narrow anchors.
   *
   * @default undefined
   */
  readonly minWidth = input<number | string>();
  /**
   * Extra classes for the portalled popover root.
   *
   * @default ""
   */
  readonly popoverClass = input<string>("");
  /**
   * Extra classes for the paper surface.
   *
   * @default ""
   */
  readonly paperClass = input<string>("");

  /** Emitted when the popover asks to be closed, with the reason why. */
  readonly close = output<OverlayCloseEvent>();

  private readonly document = inject(DOCUMENT);
  private readonly paper = viewChild<ElementRef<HTMLElement>>("paper");
  private readonly backdrop = viewChild<ElementRef<HTMLElement>>("backdrop");
  private readonly popper = viewChild(OkklyPopper);

  protected readonly offsetModifiers = OFFSET_MODIFIERS;

  /** The portalled backdrop, kept reachable so it can be taken down on destroy. */
  private portalledBackdrop: HTMLElement | null = null;

  protected readonly resolvedAnchor = computed(() => {
    const anchorEl = this.anchorEl();
    if (anchorEl) return anchorEl;
    const anchorPosition = this.anchorPosition();
    if (anchorPosition) return createVirtualAnchor(anchorPosition);
    return undefined;
  });

  protected readonly popperClasses = computed(() =>
    ["okkly-popover", this.open() && "okkly-popover--open", this.popoverClass()]
      .filter(Boolean)
      .join(" "),
  );

  /** Whether the paper is in the DOM — `true` until its exit has finished. */
  protected readonly paperMounted = growSurface({
    open: () => this.open(),
    element: () => this.paper()?.nativeElement,
    timeout: () => this.transitionDuration(),
    transformOrigin: "center top",
    onEnter: () => this.popper()?.notifyEnter(),
    onExited: () => this.popper()?.notifyExited(),
  });

  constructor() {
    afterRenderEffect(() => {
      const backdrop = this.backdrop()?.nativeElement ?? null;
      this.portalledBackdrop = backdrop;
      if (backdrop) portalTo(backdrop, this.document.body);
    });

    inject(DestroyRef).onDestroy(() => this.portalledBackdrop?.remove());

    onEscapeKey(
      (event) => this.close.emit({ event, reason: "escapeKeyDown" }),
      () => this.open(),
    );

    onClickOutside(
      () => this.paper()?.nativeElement,
      (event) => {
        // The anchor is not "outside". Click-outside listens on mousedown,
        // which fires before the anchor's own click, so without this a click
        // on an open popover's trigger closes it and the trigger's own handler
        // immediately toggles it back open — the popover appears frozen open.
        // Letting the anchor own its click makes the trigger a plain toggle.
        if (this.anchorEl()?.contains(event.target as Node)) return;
        this.close.emit({ event, reason: "backdropClick" });
      },
      // In backdrop mode nothing under the popover is clickable, so the anchor
      // needs no special-casing: the click lands on the backdrop and dismisses.
      () => this.open() && this.hideBackdrop(),
    );
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.close.emit({ event, reason: "backdropClick" });
  }
}
