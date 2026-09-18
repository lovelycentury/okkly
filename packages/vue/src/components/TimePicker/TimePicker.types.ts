export interface TimePickerValue {
  h: number;
  m: number;
}

export type TimePickerColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TimePickerFormat = "24h" | "12h";

/**
 * No MUI equivalent — MUI X's `TimePicker`/`DesktopTimePicker` is a masked
 * text input with a popover, not an always-visible inline picker; the source
 * spec deliberately calls that gap out ("Precise typed time → use a masked
 * input"). The picker itself mirrors MUI's `MultiSectionDigitalClock`: up to
 * three plain scrollable columns (hours, minutes, and — only for
 * `format="12h"` — a third AM/PM column), each a simple list with the
 * selected row picked out by a filled pill, not a centered/enlarged
 * carousel row. `value.h` is always canonical 24-hour (0–23); the AM/PM
 * column is purely a 12-hour selection helper layered on top of it and is
 * absent by default (`format` defaults to `"24h"`, which has no AM/PM
 * concept).
 *
 * Props mirror `@okkly/react`'s `<TimePicker>` name-for-name. Vue-forced
 * differences: the controlled `value` + `onChange` pair becomes an unnamed
 * `defineModel<TimePickerValue>()`, so consumers can `v-model` it —
 * `defaultValue` still seeds it once on mount when nothing is bound, same as
 * React's uncontrolled mode. `className` is dropped — a consumer's `class`
 * merges onto the root automatically. Every other native attribute (`style`,
 * `data-*`, …) falls through the same way.
 */
export interface TimePickerProps {
  /**
   * Initial time when uncontrolled.
   *
   * @default { h: 0, m: 0 }
   */
  defaultValue?: TimePickerValue;
  /**
   * Minute column step.
   *
   * @default 1
   */
  step?: number;
  /**
   * `"12h"` splits the hour column into 1–12 plus a third AM/PM column; the underlying value stays 24-hour either way.
   *
   * @default "24h"
   */
  format?: TimePickerFormat;
  /**
   * Accent tone for the focus outline and selected-row pill.
   *
   * @default "primary"
   */
  color?: TimePickerColor;
  /**
   * Accessible name for the hour column.
   *
   * @default "Hours"
   */
  hoursAriaLabel?: string;
  /**
   * Accessible name for the minute column.
   *
   * @default "Minutes"
   */
  minutesAriaLabel?: string;
  /**
   * Accessible name for the AM/PM column (only rendered for `format="12h"`).
   *
   * @default "AM/PM"
   */
  meridiemAriaLabel?: string;
}
