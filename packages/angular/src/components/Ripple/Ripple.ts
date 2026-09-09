import {
  DOCUMENT,
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  type OnDestroy,
} from "@angular/core";

/** The subset of a pointer/touch event the ripple needs to place its origin. */
type PointerLike = { clientX: number; clientY: number };

/**
 * Ripple feedback for a clickable element — the Angular counterpart of
 * `useRipple` + `<Ripple>` in `@okkly/react`, collapsed into one host
 * directive since Angular has no equivalent of returning event props.
 *
 * The overlay is created lazily on the first press and appended as the host's
 * first child, so it paints behind whatever the host's own template renders.
 * The host must be `position: relative; overflow: hidden` — `.okkly-button`
 * and friends already are.
 */
@Directive({
  selector: "[okklyRipple]",
  host: {
    "(pointerdown)": "start($event)",
    "(pointerup)": "release()",
    "(pointerleave)": "release()",
    "(pointercancel)": "release()",
  },
})
export class OkklyRipple implements OnDestroy {
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute, alias: "okklyRippleDisabled" });

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private overlay: HTMLElement | null = null;
  private isPointerDown = false;
  /**
   * Ripples whose animation finished while the pointer was still down. They
   * stay painted until release, so a held button reads as pressed.
   */
  private readonly finished = new Set<HTMLElement>();

  protected start(event: PointerLike): void {
    // `:disabled` covers a native control, `[aria-disabled]` the anchor and
    // role-based cases — so a host component only has to pass `disabled`
    // through to the DOM, never down into this directive.
    if (this.disabled() || this.host.nativeElement.matches(":disabled, [aria-disabled='true']")) {
      return;
    }

    const rect = this.host.nativeElement.getBoundingClientRect();
    this.isPointerDown = true;

    const ripple = this.document.createElement("span");
    ripple.className = "okkly-ripple__element";
    ripple.style.setProperty("--okkly-ripple-left", `${event.clientX - rect.left}px`);
    ripple.style.setProperty("--okkly-ripple-top", `${event.clientY - rect.top}px`);
    ripple.addEventListener(
      "animationend",
      () => {
        if (this.isPointerDown) this.finished.add(ripple);
        else ripple.remove();
      },
      { once: true },
    );

    this.ensureOverlay().append(ripple);
  }

  protected release(): void {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    for (const ripple of this.finished) ripple.remove();
    this.finished.clear();
  }

  ngOnDestroy(): void {
    this.finished.clear();
    this.overlay?.remove();
    this.overlay = null;
  }

  private ensureOverlay(): HTMLElement {
    if (this.overlay) return this.overlay;

    const overlay = this.document.createElement("span");
    overlay.className = "okkly-component okkly-ripple";
    overlay.setAttribute("aria-hidden", "true");
    this.host.nativeElement.prepend(overlay);
    this.overlay = overlay;
    return overlay;
  }
}
