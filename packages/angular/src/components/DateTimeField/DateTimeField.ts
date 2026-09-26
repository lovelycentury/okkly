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
  maskitoDateTime,
  maskitoParseDateTime,
  maskitoStringifyDateTime,
  type MaskitoDateTimeParams,
} from "@maskito/kit";
import { iconCalendar, iconClock } from "@okkly/icons";
import { OkklyDateTimePicker } from "../DateTimePicker/DateTimePicker";
import { OkklyField, OkklyFieldEndAdornment, getFieldIds, type FieldSize } from "../Field/Field";
import { OkklyIcon } from "../Icon/Icon";
import { OkklyPopover } from "../Popover/Popover";

export type DateTimeFieldSize = FieldSize;
/**
 * Narrower than `Field.ts`'s own `FieldColor` (Angular's full seven-tone
 * accent palette) — mirrors react's actual `FieldColor` restriction and
 * `OkklyTimeField`'s same precedent, because the value flows straight into
 * `OkklyDateTimePicker`'s six-tone `DateTimePickerColor`, which has no
 * `"secondary"`/`"contrast"` to map onto.
 */
export type DateTimeFieldColor = "primary" | "dante";

let nextId = 0;

const DATE_TIME_PARAMS: MaskitoDateTimeParams = {
  dateMode: "dd/mm/yyyy",
  timeMode: "HH:MM",
  dateTimeSeparator: ", ",
  dateSeparator: ".",
};

function stringifyDateTime(value: Date | null, params: MaskitoDateTimeParams): string {
  return value ? maskitoStringifyDateTime(value, params) : "";
}

function sameDate(a: Date | null, b: Date | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

/**
 * Closest MUI counterpart is MUI X's `DateTimeField`/`DateTimePicker`: a
 * masked text input with a date+time popover. Deliberate gaps, the same
 * calls `OkklyDateField`/`OkklyTimeField` already made: no `defaultValue` —
 * `value`'s own `model()` default covers the uncontrolled case. Fixed
 * `dd.mm.yyyy, HH:mm` mask. No `className` forwarding.
 *
 * Two distinct paths out of the embedded `OkklyDateTimePicker`:
 * `(valueChange)` fires on every day pick or time-wheel nudge (updates the
 * text, leaves the popover open); `(confirm)` fires only on the picker's own
 * Confirm button (updates the text AND closes the popover) — the same split
 * react's `handlePickerChange`/`handleConfirm` make.
 */
@Component({
  selector: "okkly-date-time-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [
    MaskitoDirective,
    OkklyDateTimePicker,
    OkklyField,
    OkklyFieldEndAdornment,
    OkklyIcon,
    OkklyPopover,
  ],
  templateUrl: "./DateTimeField.html",
})
export class OkklyDateTimeField {
  /**
   * Label.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Hide Label.
   *
   * @default false
   */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /**
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<DateTimeFieldSize>("medium");
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<DateTimeFieldColor>("primary");
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
   * Earliest selectable date & time (inclusive). Also constrains what can be typed.
   *
   * @default undefined
   */
  readonly min = input<Date>();
  /**
   * Latest selectable date & time (inclusive). Also constrains what can be typed.
   *
   * @default undefined
   */
  readonly max = input<Date>();
  /**
   * Whether the date-time picker popover is open. Two-way bindable as `[(open)]`.
   *
   * @default false
   */
  readonly open = model(false);
  /**
   * Placeholder.
   *
   * @default "dd.mm.yyyy, HH:mm"
   */
  readonly placeholder = input("dd.mm.yyyy, HH:mm");
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
  protected readonly iconClock = iconClock;

  private readonly generatedId = `okkly-date-time-field-${nextId++}`;
  protected readonly fieldId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).helperId,
  );

  private readonly fieldRef = viewChild<OkklyField>("field");
  /** The field's control box, anchoring the popover. */
  protected readonly controlElement = computed(() => this.fieldRef()?.controlElement() ?? null);

  protected readonly dateTimeParams = computed<MaskitoDateTimeParams>(() => ({
    ...DATE_TIME_PARAMS,
    min: this.min(),
    max: this.max(),
  }));
  protected readonly maskOptions = computed(() => maskitoDateTime(this.dateTimeParams()));

  protected readonly text = signal(stringifyDateTime(this.value(), this.dateTimeParams()));

  // Holds the last `Date` this component itself committed (by typing, by
  // picking, or by confirming) — the same self-inflicted-vs-external
  // distinction `OkklyDateField`/`OkklyTimeField` use. Without it, every
  // keystroke's own `value.set()` would immediately re-stringify `text` from
  // the committed date and clobber whatever partial text the user is still
  // typing.
  private lastCommitted: Date | null = null;

  constructor() {
    effect(() => {
      const value = this.value();
      if (sameDate(value, this.lastCommitted)) return;
      this.lastCommitted = value;
      this.text.set(stringifyDateTime(value, this.dateTimeParams()));
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
    const parsed = maskitoParseDateTime(next, this.dateTimeParams());
    if (parsed) this.commit(parsed);
  }

  // `OkklyDateTimePicker.value` is nullable (nothing picked yet), but its
  // internal `commit()` only ever sets a real `Date` — this never actually
  // fires with `null`, matching react's own non-nullable `onChange`.
  protected onPickerChange(next: Date | null): void {
    if (!next) return;
    this.text.set(stringifyDateTime(next, this.dateTimeParams()));
    this.commit(next);
  }

  protected onConfirm(next: Date): void {
    this.text.set(stringifyDateTime(next, this.dateTimeParams()));
    this.commit(next);
    this.setOpen(false);
  }
}
