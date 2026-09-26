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
  maskitoParseTime,
  maskitoStringifyTime,
  maskitoTime,
  type MaskitoTimeParams,
} from "@maskito/kit";
import { iconClock } from "@okkly/icons";
import { OkklyField, OkklyFieldEndAdornment, getFieldIds, type FieldSize } from "../Field/Field";
import { OkklyIcon } from "../Icon/Icon";
import { OkklyPopover } from "../Popover/Popover";
import { OkklyTimePicker, type TimePickerValue } from "../TimePicker/TimePicker";

export type TimeFieldSize = FieldSize;
/**
 * Narrower than `Field.ts`'s own `FieldColor` (the full accent palette) —
 * mirrors react's actual `TimeField`/`DateField`/`Select` restriction to
 * `"primary" | "dante"`. Also sidesteps a real naming clash: `OkklyTimePicker`'s
 * `TimePickerColor` spells the indigo tone `"indigo"`, while `Field`'s
 * `FieldColor` spells the same accent `"secondary"` (a react-side quirk in
 * how the CSS variable is mapped) — neither type is assignable to the other,
 * so anything wider than the two tones they actually agree on the spelling
 * of would need a translation layer react never needed either.
 */
export type TimeFieldColor = "primary" | "dante";

let nextId = 0;

const TIME_PARAMS: MaskitoTimeParams = { mode: "HH:MM" };

function dateToMs(date: Date): number {
  return (
    ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 +
    date.getMilliseconds()
  );
}

function msToDate(ms: number): Date {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milliseconds = ms % 1000;
  const date = new Date();
  date.setHours(hours, minutes, seconds, milliseconds);
  return date;
}

function dateToTimeValue(date: Date): TimePickerValue {
  return { h: date.getHours(), m: date.getMinutes() };
}

function timeValueToDate(time: TimePickerValue): Date {
  const date = new Date();
  date.setHours(time.h, time.m, 0, 0);
  return date;
}

function stringifyTime(value: Date | null): string {
  if (!value) return "";
  return maskitoStringifyTime(dateToMs(value), TIME_PARAMS);
}

function isCompleteTime(text: string): boolean {
  return /^\d{2}:\d{2}$/.test(text);
}

/**
 * Closest MUI counterpart is MUI X's `TimeField` /
 * `TimePicker` (https://mui.com/x/react-date-pickers/time-field/): masked
 * text input with a time popover. Deliberate gaps, matching react: no
 * `sx`/`slots`, fixed `HH:mm` mask, and the value API is `Date | null`
 * (time-of-day on a fixed base day) for consistency with `DateField`/
 * `DateTimeField`. `min`/`max` are accepted for prop parity but are currently
 * inert upstream in react too — neither port wires them into the mask or the
 * picker.
 *
 * `value`/`open` become two-way-bindable `model()`s (`[(value)]`, `[(open)]`)
 * in place of react's `value`/`defaultValue`/`onChange` split — Angular's
 * `model()` already covers controlled and uncontrolled usage from one
 * signal, so there is no separate "is this controlled" branch to port. The
 * displayed text resyncs from `value()` through one `effect()` rather than
 * react's `valueKey`-compared `useEffect`, since every commit path here
 * (typed, picked, or an external `[value]` change) converges on the same
 * signal.
 */
@Component({
  selector: "okkly-time-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [
    MaskitoDirective,
    OkklyField,
    OkklyFieldEndAdornment,
    OkklyIcon,
    OkklyPopover,
    OkklyTimePicker,
  ],
  templateUrl: "./TimeField.html",
})
export class OkklyTimeField {
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
  readonly size = input<TimeFieldSize>("medium");
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<TimeFieldColor>("primary");
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
   * Earliest selectable time. Accepted for prop parity with react; currently inert.
   *
   * @default undefined
   */
  readonly min = input<Date>();
  /**
   * Latest selectable time. Accepted for prop parity with react; currently inert.
   *
   * @default undefined
   */
  readonly max = input<Date>();
  /**
   * Whether the time picker popover is open. Two-way bindable as `[(open)]`.
   *
   * @default false
   */
  readonly open = model(false);
  /**
   * Placeholder.
   *
   * @default "HH:mm"
   */
  readonly placeholder = input("HH:mm");
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

  protected readonly iconClock = iconClock;
  protected readonly maskOptions = maskitoTime(TIME_PARAMS);

  private readonly generatedId = `okkly-time-field-${nextId++}`;
  protected readonly fieldId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).helperId,
  );

  private readonly fieldRef = viewChild<OkklyField>("field");
  protected readonly controlElement = computed(() => this.fieldRef()?.controlElement() ?? null);

  protected readonly text = signal(stringifyTime(this.value()));
  protected readonly pickerValue = computed(() => {
    const value = this.value();
    return value ? dateToTimeValue(value) : { h: 0, m: 0 };
  });

  constructor() {
    // Every commit path (typed, picked, or an external `[value]` change)
    // converges here. Resyncing on our own commits is harmless — the text a
    // commit produced already equals `stringifyTime` of the value it
    // produced, so this is a same-string, no-op assignment on the input.
    effect(() => {
      this.text.set(stringifyTime(this.value()));
    });
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.text.set(next);
    if (next === "") {
      this.value.set(null);
      return;
    }
    if (!isCompleteTime(next)) return;
    const ms = maskitoParseTime(next, TIME_PARAMS);
    if (Number.isFinite(ms)) this.value.set(msToDate(ms));
  }

  protected onPickerChange(time: TimePickerValue): void {
    this.value.set(timeValueToDate(time));
  }

  protected onTriggerClick(): void {
    if (this.disabled()) return;
    this.open.set(!this.open());
  }
}
