import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  signal,
} from "@angular/core";
import { iconChevronDown, iconChevronUp, iconMinus, iconPlus } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";

export type NumberInputSize = "small" | "medium" | "large";
export type NumberInputColor = "primary" | "dante";
export type NumberInputControls = "stepper" | "chevrons";

/** `numberAttribute` that keeps an unset input unset rather than `NaN`. */
const optionalNumber = (value: unknown): number | undefined =>
  value == null || value === "" ? undefined : numberAttribute(value);

function parseInputValue(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function clampValue(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

let nextId = 0;

/**
 * A numeric text field with +/- (or chevron) steppers, arrow-key stepping and
 * clamping to `min`/`max`. Inputs follow MUI's TextField, as `@okkly/react`'s
 * `<NumberInput>` does — `label`, `hideLabel`, `size`, `color`, `error`,
 * `helperText`, `fullWidth`, `disabled`, `controls`, `min`, `max`, `step`,
 * `required`.
 *
 * Deliberate gaps: `value` is a `model<number | null>()` (`[(value)]`)
 * standing in for React's `value`/`defaultValue` + `onChange`; it reports the
 * parsed, clamped number on every keystroke, `null` when empty. `label` and
 * `helperText` are text where React takes any node. Only `id`, `name` and
 * `placeholder` reach the native `<input>`.
 */
@Component({
  selector: "okkly-number-input",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyIcon],
  host: {
    class: "okkly-component okkly-number-input",
    "[class]": "modifiers()",
    // These belong on the native input, not on this element.
    "[attr.id]": "null",
    "[attr.name]": "null",
  },
  templateUrl: "./NumberInput.html",
})
export class OkklyNumberInput {
  /**
   * The number, `null` for an empty field. Two-way bindable as `[(value)]`.
   *
   * @default null
   */
  readonly value = model<number | null>(null);
  /**
   * Field label.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /**
   * Field height and text.
   *
   * @default "medium"
   */
  readonly size = input<NumberInputSize>("medium");
  /**
   * Tints the focus ring and glow.
   *
   * @default "primary"
   */
  readonly color = input<NumberInputColor>("primary");
  /**
   * Marks the field invalid, with a red border.
   *
   * @default false
   */
  readonly error = input(false, { transform: booleanAttribute });
  /**
   * Text below the field.
   *
   * @default undefined
   */
  readonly helperText = input<string>();
  /**
   * Takes the full width of its container.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Whether the field and its steppers are disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Trailing +/- layout (`stepper`) or up/down chevrons (`chevrons`).
   *
   * @default "stepper"
   */
  readonly controls = input<NumberInputControls>("stepper");
  /**
   * Lower bound for stepping and clamping.
   *
   * @default undefined
   */
  readonly min = input(undefined, { transform: optionalNumber });
  /**
   * Upper bound for stepping and clamping.
   *
   * @default undefined
   */
  readonly max = input(undefined, { transform: optionalNumber });
  /**
   * Increment for the steppers and arrow keys.
   *
   * @default 1
   */
  readonly step = input(1, { transform: numberAttribute });
  /**
   * Marks the field required and shows an asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Empty-state hint.
   *
   * @default undefined
   */
  readonly placeholder = input<string>();
  /**
   * Id of the native input. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Form field name, set on the native input.
   *
   * @default undefined
   */
  readonly name = input<string>();

  /** What the user has typed, while it differs from the formatted value. */
  private readonly draftText = signal<string | null>(null);

  private readonly generatedId = `okkly-number-input-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(() =>
    this.helperText() ? `${this.inputId()}-helper` : null,
  );

  protected readonly displayValue = computed(() => {
    const value = this.value();
    return this.draftText() ?? (value === null ? "" : String(value));
  });
  private readonly base = computed(() => this.value() ?? this.min() ?? 0);
  protected readonly canIncrement = computed(() => {
    const max = this.max();
    return max === undefined || this.base() < max;
  });
  protected readonly canDecrement = computed(() => {
    const min = this.min();
    return min === undefined || this.base() > min;
  });

  protected readonly incrementIcon = computed(() =>
    this.controls() === "stepper" ? iconPlus : iconChevronUp,
  );
  protected readonly decrementIcon = computed(() =>
    this.controls() === "stepper" ? iconMinus : iconChevronDown,
  );

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-number-input--color-${this.color()}`,
      this.size() !== "medium" && `okkly-number-input--${this.size()}`,
      this.error() && "okkly-number-input--error",
      this.fullWidth() && "okkly-number-input--full-width",
    ]
      .filter(Boolean)
      .join(" "),
  );

  private setValue(next: number | null): void {
    this.value.set(next === null ? null : clampValue(next, this.min(), this.max()));
  }

  protected stepBy(direction: 1 | -1): void {
    this.setValue(this.base() + direction * this.step());
    this.draftText.set(null);
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.draftText.set(text);
    this.setValue(parseInputValue(text));
  }

  protected onBlur(): void {
    const value = this.value();
    if (value !== null) this.setValue(value);
    this.draftText.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!this.disabled() && this.canIncrement()) this.stepBy(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!this.disabled() && this.canDecrement()) this.stepBy(-1);
    }
  }
}
