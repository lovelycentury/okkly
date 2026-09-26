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

export type FabVariant = "standard" | "soft";
export type FabColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type FabSize = "small" | "medium" | "large";

/**
 * Floating action button for the screen's primary action. Inputs follow
 * Angular Material's FAB (`button[mat-fab]`, `button[mat-extended-fab]`) where
 * the two designs overlap — attribute selector on a native `<button>`/`<a>`,
 * `disabled`, `disableRipple` — and mirror `@okkly/react`'s `<Fab>` for
 * everything specific to this design system (`variant`/`color`/`size`/`label`).
 *
 * Deliberate gaps: the glyph is the projected content (React's `icon`), and
 * `label` is text. A link is an `<a okklyFab href>` rather than an `href`
 * input; as with the icon button, a disabled anchor keeps its `href` but gets
 * `aria-disabled`, `tabindex="-1"` and swallowed clicks, where React drops the
 * `href`. Without a `label` the host has no text, so give it an `aria-label`.
 */
@Component({
  selector: "button[okklyFab], a[okklyFab]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [{ directive: OkklyRipple, inputs: ["okklyRippleDisabled: disableRipple"] }],
  host: {
    class: "okkly-component okkly-fab",
    "[class]": "modifiers()",
    "[attr.disabled]": "isNativeButton && disabled() ? '' : null",
    "[attr.aria-disabled]": "!isNativeButton && disabled() ? 'true' : null",
    "[attr.tabindex]": "!isNativeButton && disabled() ? '-1' : null",
  },
  templateUrl: "./FAB.html",
})
export class OkklyFab {
  /**
   * Surface treatment. Can be `standard` or `soft`.
   *
   * @default "standard"
   */
  readonly variant = input<FabVariant>("standard");
  /**
   * Accent tone. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   */
  readonly color = input<FabColor>("primary");
  /**
   * Diameter (or height, when extended). Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  readonly size = input<FabSize>("medium");
  /**
   * Text beside the icon — turns the FAB into an extended pill.
   *
   * @default undefined
   */
  readonly label = input<string>();
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
      this.variant() !== "standard" && `okkly-fab--${this.variant()}`,
      this.color() !== "primary" && `okkly-fab--color-${this.color()}`,
      this.label() != null && "okkly-fab--extended",
      this.size() !== "medium" && `okkly-fab--${this.size()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
