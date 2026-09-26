import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import { MaskitoDirective } from "@maskito/angular";
import {
  maskitoDate,
  maskitoParseDate,
  maskitoStringifyDate,
  type MaskitoDateParams,
} from "@maskito/kit";
import { iconCalendar } from "@okkly/icons";
import { OkklyCalendar, type CalendarValue } from "../Calendar/Calendar";
import { OkklyField, OkklyFieldEndAdornment, getFieldIds, type FieldSize } from "../Field/Field";
import { OkklyIcon } from "../Icon/Icon";
import { OkklyPopover } from "../Popover/Popover";

export type DateFieldSize = FieldSize;
/**
 * Narrower than `Field.ts`'s own `FieldColor` (the full accent palette) —
 * mirrors react's actual `DateField`/`TimeField`/`Select` restriction to
 * `"primary" | "dante"`. Also sidesteps a real naming clash: `OkklyCalendar`'s
 * `CalendarTone` spells the indigo tone `"indigo"`, while `Field`'s
 * `FieldColor` spells the same accent `"secondary"` (a react-side quirk in
 * how the CSS variable is mapped) — neither type is assignable to the other,
 * so anything wider than the two tones they actually agree on the spelling
 * of would need a translation layer react never needed either.
 */
export type DateFieldColor = "primary" | "dante";

let nextId = 0;

function stringifyDate(value: Date | null, params: MaskitoDateParams): string {
  return value ? maskitoStringifyDate(value, params) : "";
}

function sameDate(a: Date | null, b: Date | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

/**
 * Closest MUI counterpart is MUI X's `DateField`/`DatePicker`
 * (https://mui.com/x/react-date-pickers/date-field/): a masked text input
 * with a calendar popover. Deliberate gaps, the same calls `OkklySelect`/
 * `OkklyCalendar` already made: no `defaultValue` — `value`'s own `model()`
 * default covers the uncontrolled case. Fixed `dd.mm.yyyy` mask (no locale
 * adapters), and the popover renders `OkklyCalendar` rather than a
 * `DateCalendar` clone. No `className` forwarding.
 */
@Component({
  selector: "okkly-date-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [
    MaskitoDirective,
    OkklyField,
    OkklyFieldEndAdornment,
    OkklyPopover,
    OkklyCalendar,
    OkklyIcon,
  ],
  templateUrl: "./DateField.html",
})
export class OkklyDateField {
  /**
   * Label.
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
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<DateFieldSize>("medium");
  /**
   * Color. Tints the field's focus ring and the calendar popover to match.
   *
   * @default "primary"
   */
  readonly color = input<DateFieldColor>("primary");
  /**
   * Error.
   *
   * @default false
   */
  readonly error = input(false, { transform: booleanAttribute });
  /**
   * Helper text.
   *
   * @default undefined
   */
  readonly helperText = input<string>();
  /**
   * Full width.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Value. Two-way bindable as `[(value)]`.
   *
   * @default null
   */
  readonly value = model<Date | null>(null);
  /**
   * Earliest selectable date (inclusive). Also constrains what can be typed.
   *
   * @default undefined
   */
  readonly min = input<Date>();
  /**
   * Latest selectable date (inclusive). Also constrains what can be typed.
   *
   * @default undefined
   */
  readonly max = input<Date>();
  /**
   * Whether the calendar popover is open. Two-way bindable as `[(open)]`.
   *
   * @default false
   */
  readonly open = model(false);
  /**
   * Placeholder.
   *
   * @default "dd.mm.yyyy"
   */
  readonly placeholder = input("dd.mm.yyyy");
  /**
   * Id of the field. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly iconCalendar = iconCalendar;

  private readonly generatedId = `okkly-date-field-${nextId++}`;
  protected readonly fieldId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).helperId,
  );

  private readonly fieldRef = viewChild<OkklyField>("field");
  /** The field's control box, anchoring the popover. */
  protected readonly controlElement = computed(() => this.fieldRef()?.controlElement() ?? null);

  protected readonly dateParams = computed<MaskitoDateParams>(() => ({
    mode: "dd/mm/yyyy",
    separator: ".",
    min: this.min(),
    max: this.max(),
  }));
  protected readonly maskOptions = computed(() => maskitoDate(this.dateParams()));

  protected readonly text = signal(stringifyDate(this.value(), this.dateParams()));

  // Holds the last `Date` this component itself committed (by typing or by
  // picking a day) — the same self-inflicted-vs-external distinction
  // `OkklyTimePicker`'s wheel columns use. Without it, every keystroke's own
  // `value.set()` would immediately re-stringify `text` from the committed
  // date and clobber whatever partial text the user is still typing.
  private lastCommitted: Date | null = null;

  constructor() {
    effect(() => {
      const value = this.value();
      if (sameDate(value, this.lastCommitted)) return;
      this.lastCommitted = value;
      this.text.set(stringifyDate(value, this.dateParams()));
    });
  }

  private commit(next: Date | null): void {
    this.lastCommitted = next;
    this.value.set(next);
  }

  protected setOpen(next: boolean): void {
    this.open.set(next);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.text.set(next);
    if (next === "") {
      this.commit(null);
      return;
    }
    const parsed = maskitoParseDate(next, this.dateParams());
    if (parsed) this.commit(parsed);
  }

  protected onSelect(next: CalendarValue | null): void {
    if (!(next instanceof Date)) return;
    this.text.set(stringifyDate(next, this.dateParams()));
    this.commit(next);
    this.setOpen(false);
  }
}
