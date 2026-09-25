import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { OkklyRipple } from "../../directives/Ripple/Ripple";

export type IconButtonVariant = "ghost" | "glass" | "solid";
export type IconButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type IconButtonSize = "small" | "medium" | "large";

/**
 * Inputs follow Angular Material's icon button (`button[mat-icon-button]`)
 * where the two designs overlap — attribute selector on a native
 * `<button>`/`<a>`, `disabled`, `disableRipple` — and mirror `@okkly/react`'s
 * `<IconButton>` for everything specific to this design system
 * (`variant`/`color`/`size`).
 *
 * Deliberate gaps: the glyph is the projected content — React's `icon` and
 * `children` collapse into one slot, since Angular has no `ReactNode` input —
 * and a link is an `<a okklyIconButton href>` rather than an `href` input. As
 * with `OkklyButton`, a disabled anchor keeps its `href` but gets
 * `aria-disabled`, `tabindex="-1"` and swallowed clicks, where React drops the
 * `href`. The host has no text, so give it an `aria-label`.
 */
@Component({
  selector: "button[okklyIconButton], a[okklyIconButton]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [{ directive: OkklyRipple, inputs: ["okklyRippleDisabled: disableRipple"] }],
  host: {
    class: "okkly-component okkly-icon-button",
    "[class]": "modifiers()",
    "[attr.disabled]": "isNativeButton && disabled() ? '' : null",
    "[attr.aria-disabled]": "!isNativeButton && disabled() ? 'true' : null",
    "[attr.tabindex]": "!isNativeButton && disabled() ? '-1' : null",
  },
  templateUrl: "./IconButton.html",
})
export class OkklyIconButton {
  /**
   * Surface treatment. Can be `ghost`, `glass`, or `solid`.
   *
   * @default "ghost"
   */
  readonly variant = input<IconButtonVariant>("ghost");
  /**
   * Accent tone for the icon and focus glow. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   */
  readonly color = input<IconButtonColor>("primary");
  /**
   * Square tap target size. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  readonly size = input<IconButtonSize>("medium");
  /**
   * Whether the button is disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isNativeButton = this.element.tagName === "BUTTON";

  constructor() {
    // A native `<button disabled>` never fires a click; an `<a>` would. This
    // has to be a capture listener: the consumer's `(click)` on the same
    // element is registered before any host listener, and only capture-phase
    // listeners run ahead of it at the target.
    const swallowWhileDisabled = (event: Event) => {
      if (!this.disabled()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.element.addEventListener("click", swallowWhileDisabled, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      this.element.removeEventListener("click", swallowWhileDisabled, { capture: true }),
    );
  }

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "ghost" && `okkly-icon-button--${this.variant()}`,
      this.color() !== "primary" && `okkly-icon-button--color-${this.color()}`,
      this.size() !== "medium" && `okkly-icon-button--${this.size()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
