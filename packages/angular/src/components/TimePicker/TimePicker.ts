import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  numberAttribute,
} from "@angular/core";
import { OkklyTimePickerColumn } from "./WheelColumn";

export interface TimePickerValue {
  h: number;
  m: number;
}

export type TimePickerColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TimePickerFormat = "24h" | "12h";

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MERIDIEM_VALUES = [0, 1];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function minuteValues(step: number): number[] {
  const s = Math.min(59, Math.max(1, Math.round(step)));
  const values: number[] = [];
  for (let m = 0; m < 60; m += s) values.push(m);
  return values;
}

function nearestValue(target: number, values: readonly number[]): number {
  return values.reduce(
    (best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best),
    values[0] ?? target,
  );
}

function hour12From(h: number): number {
  const twelveHour = h % 12;
  return twelveHour === 0 ? 12 : twelveHour;
}

function meridiemFrom(h: number): number {
  return h < 12 ? 0 : 1;
}

function combineHour12(hour12: number, meridiem: number): number {
  const base = hour12 === 12 ? 0 : hour12;
  return meridiem === 1 ? base + 12 : base;
}

function formatMeridiem(v: number): string {
  return v === 0 ? "AM" : "PM";
}

/**
 * No MUI equivalent — MUI X's `TimePicker`/`DesktopTimePicker` is a masked
 * text input with a popover, not an always-visible inline picker; the source
 * `@okkly/react` spec deliberately calls that gap out ("Precise typed time →
 * use a masked input"). This mirrors MUI's `MultiSectionDigitalClock`: up to
 * three plain scrollable columns (hours, minutes, and — only for
 * `format="12h"` — a third AM/PM column), each a simple list with the
 * selected row picked out by a filled pill, not a centered/enlarged carousel
 * row. `value().h` is always canonical 24-hour (0–23); the AM/PM column is
 * purely a 12-hour selection helper layered on top of it and is absent by
 * default (`format` defaults to `"24h"`, which has no AM/PM concept).
 *
 * Inputs mirror `@okkly/react`'s `<TimePicker>` name-for-name — `step`/
 * `format`/`color`/`hoursAriaLabel`/`minutesAriaLabel`/`meridiemAriaLabel` all
 * match. `value` is a two-way `model()` (`[(value)]`) standing in for react's
 * `value`/`defaultValue` + `onChange`; unset, it starts at `{ h: 0, m: 0 }`.
 * No `className` forwarding onto the host, matching `OkklySelect`/
 * `OkklyAutocomplete`.
 */
@Component({
  selector: "okkly-time-picker",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-time-picker",
    "[class]": "colorClass()",
  },
  imports: [OkklyTimePickerColumn],
  templateUrl: "./TimePicker.html",
})
export class OkklyTimePicker {
  /**
   * Selected time. Two-way bindable as `[(value)]`.
   *
   * @default { h: 0, m: 0 }
   */
  readonly value = model<TimePickerValue>({ h: 0, m: 0 });
  /**
   * Minute column step, clamped 1–59.
   *
   * @default 1
   */
  readonly step = input(1, { transform: numberAttribute });
  /**
   * `"12h"` splits the hour column into 1–12 plus a third AM/PM column; the
   * underlying value stays 24-hour either way.
   *
   * @default "24h"
   */
  readonly format = input<TimePickerFormat>("24h");
  /**
   * Accent tone for the focus outline and selected-row pill.
   *
   * @default "primary"
   */
  readonly color = input<TimePickerColor>("primary");
  /**
   * Accessible name for the hour column.
   *
   * @default "Hours"
   */
  readonly hoursAriaLabel = input("Hours");
  /**
   * Accessible name for the minute column.
   *
   * @default "Minutes"
   */
  readonly minutesAriaLabel = input("Minutes");
  /**
   * Accessible name for the AM/PM column (only rendered for `format="12h"`).
   *
   * @default "AM/PM"
   */
  readonly meridiemAriaLabel = input("AM/PM");

  protected readonly pad2 = pad2;
  protected readonly formatMeridiem = formatMeridiem;
  protected readonly meridiemValues = MERIDIEM_VALUES;

  private readonly minuteVals = computed(() => minuteValues(this.step()));

  private clamp(v: TimePickerValue): TimePickerValue {
    return {
      h: ((v.h % 24) + 24) % 24,
      m: nearestValue(((v.m % 60) + 60) % 60, this.minuteVals()),
    };
  }

  protected readonly currentValue = computed(() => this.clamp(this.value()));
  protected readonly minuteValuesList = this.minuteVals;

  protected readonly isTwelveHour = computed(() => this.format() === "12h");
  protected readonly hourValues = computed(() => (this.isTwelveHour() ? HOURS_12 : HOURS_24));
  protected readonly hourValue = computed(() =>
    this.isTwelveHour() ? hour12From(this.currentValue().h) : this.currentValue().h,
  );
  protected readonly meridiemValue = computed(() => meridiemFrom(this.currentValue().h));

  protected readonly colorClass = computed(() =>
    this.color() !== "primary" ? `okkly-time-picker--color-${this.color()}` : "",
  );

  protected onHourChange(h: number): void {
    const current = this.currentValue();
    const nextH = this.isTwelveHour() ? combineHour12(h, meridiemFrom(current.h)) : h;
    this.value.set({ h: nextH, m: current.m });
  }

  protected onMinuteChange(m: number): void {
    this.value.set({ h: this.currentValue().h, m });
  }

  protected onMeridiemChange(meridiem: number): void {
    const current = this.currentValue();
    this.value.set({ h: combineHour12(hour12From(current.h), meridiem), m: current.m });
  }
}
