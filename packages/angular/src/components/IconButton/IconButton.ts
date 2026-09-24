import {
  ChangeDetectionStrategy,
  Component,
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
    "(click)": "onClickCapture($event)",
  },
  template: `<span class="okkly-icon-button__icon" aria-hidden="true"><ng-content /></span>`,
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

  protected readonly isNativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === "BUTTON";

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "ghost" && `okkly-icon-button--${this.variant()}`,
      this.color() !== "primary" && `okkly-icon-button--color-${this.color()}`,
      this.size() !== "medium" && `okkly-icon-button--${this.size()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected onClickCapture(event: Event): void {
    // A native `<button disabled>` never fires this; an `<a>` would.
    if (!this.disabled()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
