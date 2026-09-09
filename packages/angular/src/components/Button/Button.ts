import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from "@angular/core";
import { OkklyRipple } from "../Ripple/Ripple";

export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

/** Marks the projected element that renders before the label. */
@Directive({ selector: "[okklyButtonStartIcon]" })
export class OkklyButtonStartIcon {}

/** Marks the projected element that renders after the label. */
@Directive({ selector: "[okklyButtonEndIcon]" })
export class OkklyButtonEndIcon {}

/**
 * Inputs follow Angular Material's button API
 * (https://material.angular.dev/components/button/api) where the two designs
 * overlap — attribute selector on a native `<button>`/`<a>`, `disabled`,
 * `disableRipple` — and mirror `@okkly/react`'s `<Button>` for everything
 * specific to this design system (`variant`/`color`/`shape`/`size`/
 * `fullWidth`/`loading*`). Deliberate gaps: no `disabledInteractive` (a
 * disabled button here is inert), and icons arrive as projected content
 * tagged with `okklyButtonStartIcon`/`okklyButtonEndIcon` rather than as
 * inputs, since Angular has no `ReactNode` equivalent.
 *
 * Anchors cannot be natively disabled, so a disabled `<a okklyButton>` gets
 * `aria-disabled`, `tabindex="-1"`, and swallowed clicks — the href stays put.
 */
@Component({
  selector: "button[okklyButton], a[okklyButton]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  hostDirectives: [{ directive: OkklyRipple, inputs: ["okklyRippleDisabled: disableRipple"] }],
  host: {
    class: "okkly-component okkly-button",
    "[class]": "modifiers()",
    "[attr.disabled]": "isNativeButton && isDisabled() ? '' : null",
    "[attr.aria-disabled]": "!isNativeButton && isDisabled() ? 'true' : null",
    "[attr.tabindex]": "!isNativeButton && isDisabled() ? '-1' : null",
    "(click)": "onClickCapture($event)",
  },
  templateUrl: "./Button.html",
  styles: `
    .okkly-button__loader {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class OkklyButton {
  /**
   * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
   *
   * @default "primary"
   */
  readonly variant = input<ButtonVariant>("primary");
  /**
   * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   */
  readonly color = input<ButtonColor>("primary");
  /**
   * Shape of the button. Can be `pill` or `rounded`.
   *
   * @default "pill"
   */
  readonly shape = input<ButtonShape>("pill");
  /**
   * Size of the button. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  readonly size = input<ButtonSize>("medium");
  /**
   * Whether the button takes the full width of its container.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Whether the loading indicator is visible and the button is disabled.
   *
   * @default false
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
   *
   * @default "center"
   */
  readonly loadingPosition = input<ButtonLoadingPosition>("center");
  /**
   * Whether the button is disabled. Implied by `loading`.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether the button is inert, either explicitly or because it is loading. */
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly isNativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === "BUTTON";

  private readonly startIcon = contentChild(OkklyButtonStartIcon);
  private readonly endIcon = contentChild(OkklyButtonEndIcon);

  /** Where the spinner renders this frame, or `null` when not loading. */
  protected readonly spinnerPosition = computed(() =>
    this.loading() ? this.loadingPosition() : null,
  );

  /** Whether a start icon was projected and the spinner has not taken its slot. */
  protected readonly showStartIcon = computed(
    () => !!this.startIcon() && this.spinnerPosition() !== "start",
  );
  /** Whether an end icon was projected and the spinner has not taken its slot. */
  protected readonly showEndIcon = computed(
    () => !!this.endIcon() && this.spinnerPosition() !== "end",
  );

  protected readonly modifiers = computed(() =>
    [
      `okkly-button--${this.variant()}`,
      this.color() !== "primary" && `okkly-button--color-${this.color()}`,
      this.shape() === "rounded" && "okkly-button--rounded",
      this.size() !== "medium" && `okkly-button--${this.size()}`,
      this.fullWidth() && "okkly-button--full-width",
    ]
      .filter(Boolean)
      .join(" "),
  );

  // Host listeners hand back a bare `Event`; nothing below needs more than that.
  protected onClickCapture(event: Event): void {
    // A native `<button disabled>` never fires this; an `<a>` would.
    if (!this.isDisabled()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
