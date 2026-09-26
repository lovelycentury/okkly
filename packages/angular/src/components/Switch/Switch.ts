import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
  output,
} from "@angular/core";

export type SwitchSize = "small" | "medium" | "large";
export type SwitchColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

let nextId = 0;

/**
 * An immediate on/off toggle. Inputs mirror `@okkly/react`'s `<Switch>`
 * name-for-name — `checked`, `size`, `color`, `disabled`, `label` — which
 * follows MUI's Switch API; the element selector follows Angular Material's
 * `mat-slide-toggle` in spirit.
 *
 * Deliberate gaps: as with `OkklyCheckbox`, `checked` + `checkedChange` stand
 * in for React's `checked`/`defaultChecked` + `onChange` (`[(checked)]`), the
 * host is the block rather than a `<label>`, and the text is a `<label for>`
 * tied to the native input — a checkbox carrying `role="switch"`. `name`,
 * `value`, `id` and `aria-label` go on that input.
 */
@Component({
  selector: "okkly-switch",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-switch",
    "[class]": "modifiers()",
    // These belong on the native input, not on this element.
    "[attr.id]": "null",
    "[attr.name]": "null",
    "[attr.aria-label]": "null",
  },
  templateUrl: "./Switch.html",
})
export class OkklySwitch {
  /**
   * On/off value. Two-way bindable as `[(checked)]`.
   *
   * @default false
   */
  readonly checked = input(false, { transform: booleanAttribute });
  /**
   * Track size.
   *
   * @default "medium"
   */
  readonly size = input<SwitchSize>("medium");
  /**
   * Track colour when on.
   *
   * @default "primary"
   */
  readonly color = input<SwitchColor>("primary");
  /**
   * Non-interactive.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Text beside the track.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Form field name.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * Value submitted with the form while on.
   *
   * @default undefined
   */
  readonly value = input<string>();
  /**
   * Id of the native input. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Accessible name for a switch with no visible `label`, set on the native input.
   *
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Emits the new state when the user toggles — the other half of `[(checked)]`. */
  readonly checkedChange = output<boolean>();

  // An input, not a `model()`, so a bare `checked` attribute reads as `true`
  // through `booleanAttribute`; the user's toggles live here in between.
  protected readonly isChecked = linkedSignal(() => this.checked());

  private readonly generatedId = `okkly-switch-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-switch--color-${this.color()}`,
      this.size() !== "medium" && `okkly-switch--${this.size()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected onChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isChecked.set(checked);
    this.checkedChange.emit(checked);
  }
}
