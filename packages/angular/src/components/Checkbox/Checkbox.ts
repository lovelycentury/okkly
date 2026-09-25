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

export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * What an `OkklyCheckboxGroup` shares with the checkboxes nested in it — the
 * counterpart of React's `CheckboxGroupContext`.
 */
export interface CheckboxGroupState {
  name: Signal<string>;
  disabled: Signal<boolean>;
  size: Signal<CheckboxSize>;
  color: Signal<CheckboxColor>;
  isChecked(value: string): boolean;
  toggle(value: string, checked: boolean): void;
}

export const CHECKBOX_GROUP = new InjectionToken<CheckboxGroupState>("CHECKBOX_GROUP");

let nextId = 0;

/**
 * Binary or indeterminate choice. Inputs mirror `@okkly/react`'s `<Checkbox>`
 * name-for-name — `checked`, `value`, `name`, `indeterminate`, `size`,
 * `color`, `disabled`, `label` — which follows MUI's Checkbox API; the
 * element selector follows Angular Material's `mat-checkbox`.
 *
 * Deliberate gaps: React's `checked` + `onChange` pair becomes `checked` +
 * `checkedChange`, so `[(checked)]` binds it; `indeterminate` pairs the same way and clears when
 * the user toggles, as Material's does. The host is the block, not a
 * `<label>` as React's root is: the text renders as a `<label for>` tied to
 * the native input, which is what names it and makes the text clickable.
 * `aria-label` is an input forwarded to that input, for a checkbox with no
 * visible label. No `ngModel`/reactive-forms binding yet, as with
 * `OkklyTextField`.
 *
 * Nested in an `OkklyCheckboxGroup`, it takes its name, checked state,
 * disabled state, size and colour from the group, and `value` picks the option.
 */
@Component({
  selector: "okkly-checkbox",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-checkbox",
    "[class]": "modifiers()",
    // The input's id is ours to generate; a consumer's `id` goes on the input.
    "[attr.id]": "null",
    "[attr.aria-label]": "null",
  },
  templateUrl: "./Checkbox.html",
})
export class OkklyCheckbox {
  /**
   * On/off value. Two-way bindable as `[(checked)]`.
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
   * Form field name.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * Third, mixed state (a parent of partly-checked children). Cleared when the
   * user toggles. Two-way bindable as `[(indeterminate)]`.
   *
   * @default false
   */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /**
   * Box size. Unset, it follows a surrounding group, else `medium`.
   *
   * @default undefined
   */
  readonly size = input<CheckboxSize>();
  /**
   * Fill colour. Unset, it follows a surrounding group, else `primary`.
   *
   * @default undefined
   */
  readonly color = input<CheckboxColor>();
  /**
   * Non-interactive.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Text beside the box.
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
   * Accessible name for a checkbox with no visible `label`, set on the native input.
   *
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Emits the new state when the user toggles — the other half of `[(checked)]`. */
  readonly checkedChange = output<boolean>();
  /** Emits `false` when a toggle clears the mixed state — the other half of `[(indeterminate)]`. */
  readonly indeterminateChange = output<boolean>();

  // Inputs, not `model()`s, so a bare `checked` attribute reads as `true`
  // through `booleanAttribute`; the user's toggles live here in between.
  protected readonly isChecked = linkedSignal(() => this.checked());
  protected readonly isIndeterminate = linkedSignal(() => this.indeterminate());

  /** Set when the checkbox is nested in an `OkklyCheckboxGroup`. */
  private readonly group = inject(CHECKBOX_GROUP, { optional: true });

  private readonly generatedId = `okkly-checkbox-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);

  protected readonly effectiveChecked = computed(() => {
    const value = this.value();
    return this.group && value !== undefined ? this.group.isChecked(value) : this.isChecked();
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
      this.effectiveColor() !== "primary" && `okkly-checkbox--color-${this.effectiveColor()}`,
      this.effectiveSize() !== "medium" && `okkly-checkbox--${this.effectiveSize()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected onChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.isIndeterminate()) {
      this.isIndeterminate.set(false);
      this.indeterminateChange.emit(false);
    }
    const value = this.value();
    if (this.group && value !== undefined) this.group.toggle(value, checked);
    else this.isChecked.set(checked);
    this.checkedChange.emit(checked);
  }
}
