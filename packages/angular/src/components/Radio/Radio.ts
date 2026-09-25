import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  type Signal,
} from "@angular/core";

export type RadioSize = "small" | "medium" | "large";
export type RadioColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * What an `OkklyRadioGroup` shares with the radios nested in it — the
 * counterpart of React's `RadioGroupContext`.
 */
export interface RadioGroupState {
  name: Signal<string>;
  value: Signal<string | undefined>;
  disabled: Signal<boolean>;
  size: Signal<RadioSize>;
  color: Signal<RadioColor>;
  select(value: string): void;
}

export const RADIO_GROUP = new InjectionToken<RadioGroupState>("RADIO_GROUP");

let nextId = 0;

/**
 * One option of a single choice. Inputs mirror `@okkly/react`'s `<Radio>`
 * name-for-name — `checked`, `value`, `name`, `size`, `color`, `disabled`,
 * `label` — which follows MUI's Radio API; the element selector follows
 * Angular Material's `mat-radio-button` in spirit.
 *
 * Deliberate gaps: as with `OkklyCheckbox`, `checked` + `checkedChange` stand
 * in for React's `checked` + `onChange` (`[(checked)]`), the host is the
 * block rather than a `<label>`, and the text is a `<label for>` tied to the
 * native input. `name`, `value`, `id` and `aria-label` go on that input.
 *
 * Nested in an `OkklyRadioGroup`, it takes its name, checked state, disabled
 * state, size and colour from the group, and `value` picks the option.
 */
@Component({
  selector: "okkly-radio",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-radio",
    "[class]": "modifiers()",
    // These belong on the native input, not on this element.
    "[attr.id]": "null",
    "[attr.name]": "null",
    "[attr.aria-label]": "null",
  },
  templateUrl: "./Radio.html",
})
export class OkklyRadio {
  /**
   * Selected state. Two-way bindable as `[(checked)]`.
   *
   * @default false
   */
  readonly checked = input(false, { transform: booleanAttribute });
  /**
   * This option's value — submitted with the form, and the key a group selects by.
   *
   * @default undefined
   */
  readonly value = input<string>();
  /**
   * Form field name — radios with the same name form one choice.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * Circle size. Unset, it follows a surrounding group, else `medium`.
   *
   * @default undefined
   */
  readonly size = input<RadioSize>();
  /**
   * Accent colour. Unset, it follows a surrounding group, else `primary`.
   *
   * @default undefined
   */
  readonly color = input<RadioColor>();
  /**
   * Non-interactive.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Text beside the circle.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Id of the native input. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Accessible name for a radio with no visible `label`, set on the native input.
   *
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Emits `true` when the user selects this radio — the other half of `[(checked)]`. */
  readonly checkedChange = output<boolean>();

  /** Set when the radio is nested in an `OkklyRadioGroup`. */
  private readonly group = inject(RADIO_GROUP, { optional: true });

  // An input, not a `model()`, so a bare `checked` attribute reads as `true`
  // through `booleanAttribute`; the user's selection lives here in between.
  private readonly isChecked = linkedSignal(() => this.checked());

  private readonly generatedId = `okkly-radio-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);

  protected readonly effectiveChecked = computed(() => {
    const value = this.value();
    return this.group && value !== undefined ? this.group.value() === value : this.isChecked();
  });
  protected readonly effectiveName = computed(() => this.name() ?? this.group?.name());
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || !!this.group?.disabled(),
  );
  private readonly effectiveSize = computed(() => this.size() ?? this.group?.size() ?? "medium");
  private readonly effectiveColor = computed(
    () => this.color() ?? this.group?.color() ?? "primary",
  );

  protected readonly modifiers = computed(() =>
    [
      this.effectiveColor() !== "primary" && `okkly-radio--color-${this.effectiveColor()}`,
      this.effectiveSize() !== "medium" && `okkly-radio--${this.effectiveSize()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected onChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const value = this.value();
    if (this.group && value !== undefined) this.group.select(value);
    else this.isChecked.set(checked);
    this.checkedChange.emit(checked);
  }
}
