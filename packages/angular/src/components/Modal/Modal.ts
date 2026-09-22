import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { lockBodyScroll, onEscapeKey, trapFocus } from "../../helpers/overlays";
import { portalTo } from "../../helpers/portal";
import type { OverlayCloseEvent } from "../../types";

/**
 * The low-level primitive the modal overlays are built from — a dialog, a
 * drawer, and anything else that needs "portal + backdrop + trapped focus"
 * tomorrow. Modal owns only that plumbing; it renders no surface of its own,
 * so the projected content supplies all visual chrome.
 *
 * Inputs mirror `@okkly/react`'s `<Modal>` name-for-name, which in turn
 * follows MUI's Modal API (https://mui.com/material-ui/api/modal/) as closely
 * as this design allows: `open`/`container`/`keepMounted`/`hideBackdrop`/
 * `disablePortal`/`disableEscapeKeyDown`/`disableAutoFocus`/
 * `disableEnforceFocus`/`disableRestoreFocus`/`disableScrollLock` match
 * name-for-name, and closing reports a reason. Deliberate gaps: no
 * `sx`/`classes`, no `closeAfterTransition` — with no built-in transition to
 * wait on, a consumer that animates keeps itself mounted with `keepMounted`.
 *
 * Angular-forced differences:
 * - `children` becomes the default `<ng-content />`.
 * - `onClose(event, reason)` becomes the `close` output, which emits the pair
 *   as one `OverlayCloseEvent` — an `output()` carries a single value.
 * - `slotProps.backdrop`, MUI's general "merge arbitrary props onto the
 *   backdrop" escape hatch, narrows to `backdropClass`. Anything the backdrop
 *   click should additionally do belongs in the `close` handler, which already
 *   sees the `"backdropClick"` reason.
 * - `className` becomes `modalClass`: the root is portalled out of the
 *   `<okkly-modal>` host, so a `class` on it would never reach it; the host
 *   itself is `display: contents`.
 */
@Component({
  selector: "okkly-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: { style: "display: contents" },
  templateUrl: "./Modal.html",
})
export class OkklyModal {
  /**
   * Whether the modal is on screen.
   *
   * @default undefined
   */
  readonly open = input.required<boolean, unknown>({ transform: booleanAttribute });
  /**
   * Node the modal is portalled into. Defaults to `document.body`.
   *
   * @default undefined
   */
  readonly container = input<Element | null>();
  /**
   * Whether the modal renders in place instead of in the portal container.
   *
   * @default false
   */
  readonly disablePortal = input(false, { transform: booleanAttribute });
  /**
   * Whether Escape stops closing the modal.
   *
   * @default false
   */
  readonly disableEscapeKeyDown = input(false, { transform: booleanAttribute });
  /**
   * Whether opening stops moving focus into the modal. The Tab loop stays.
   *
   * @default false
   */
  readonly disableAutoFocus = input(false, { transform: booleanAttribute });
  /**
   * Whether Tab is allowed to leave the modal.
   *
   * @default false
   */
  readonly disableEnforceFocus = input(false, { transform: booleanAttribute });
  /**
   * Whether closing stops returning focus to whatever had it before.
   *
   * @default false
   */
  readonly disableRestoreFocus = input(false, { transform: booleanAttribute });
  /**
   * Whether the page behind the modal is allowed to keep scrolling.
   *
   * @default false
   */
  readonly disableScrollLock = input(false, { transform: booleanAttribute });
  /**
   * Whether the backdrop is left out.
   *
   * @default false
   */
  readonly hideBackdrop = input(false, { transform: booleanAttribute });
  /**
   * Whether the content stays in the DOM while closed, hidden with
   * `visibility` so its children keep their state between openings.
   *
   * @default false
   */
  readonly keepMounted = input(false, { transform: booleanAttribute });
  /**
   * Extra classes for the portalled modal root.
   *
   * @default ""
   */
  readonly modalClass = input<string>("");
  /**
   * Extra classes for the backdrop.
   *
   * @default ""
   */
  readonly backdropClass = input<string>("");

  /** Emitted when the modal asks to be closed, with the reason why. */
  readonly close = output<OverlayCloseEvent>();

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly root = viewChild<ElementRef<HTMLElement>>("root");

  /** The portalled root, kept reachable so it can be taken down on destroy. */
  private portalledNode: HTMLElement | null = null;

  protected readonly rootClasses = computed(() =>
    [!this.open() && "okkly-modal--hidden", this.modalClass()].filter(Boolean).join(" "),
  );

  constructor() {
    // Declared ahead of the focus trap on purpose, and captured on the way in
    // rather than read on the way out: by the time the modal closes, focus
    // lives inside the subtree that is about to disappear. This effect runs
    // during change detection, the trap after render, so it still sees the
    // trigger rather than whatever the trap focused inside the modal.
    effect((onCleanup) => {
      if (!this.open()) return;
      const restoreFocusTarget = this.document.activeElement as HTMLElement | null;
      onCleanup(() => {
        if (this.disableRestoreFocus()) return;
        restoreFocusTarget?.focus?.();
      });
    });

    afterRenderEffect(() => {
      const root = this.root()?.nativeElement ?? null;
      this.portalledNode = root;
      if (!root) return;
      const target = this.disablePortal()
        ? this.host.nativeElement
        : (this.container() ?? this.document.body);
      portalTo(root, target);
    });

    inject(DestroyRef).onDestroy(() => this.portalledNode?.remove());

    onEscapeKey(
      (event) => this.close.emit({ event, reason: "escapeKeyDown" }),
      () => this.open() && !this.disableEscapeKeyDown(),
    );
    trapFocus(
      () => this.root()?.nativeElement,
      () => this.open() && !this.disableEnforceFocus(),
      { autoFocus: () => !this.disableAutoFocus() },
    );
    lockBodyScroll(() => this.open() && !this.disableScrollLock());
  }

  protected onBackdropClick(event: MouseEvent): void {
    // A press that began inside the surface and merely *ended* on the backdrop
    // (drag-selecting text, releasing a slider) is not a dismissal gesture.
    if (event.target !== event.currentTarget) return;
    this.close.emit({ event, reason: "backdropClick" });
  }
}
