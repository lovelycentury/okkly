import type { HTMLAttributes, ReactNode } from "react";

export interface TimePickerValue {
  h: number;
  m: number;
}

export type TimePickerColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TimePickerFormat = "24h" | "12h";

export interface WheelColumnProps {
  /**
   * Values.
   *
   * @default undefined
   * @type {number[]}
   */
  values: number[];
  /**
   * Value.
   *
   * @default undefined
   * @type {number}
   */
  value: number;
  /**
   * On Value Change.
   *
   * @default undefined
   * @type {(value: number) => void}
   */
  onValueChange: (value: number) => void;
  /**
   * Format Value.
   *
   * @default undefined
   * @type {(value: number) => ReactNode}
   */
  formatValue: (value: number) => ReactNode;
  /**
   * Aria Label.
   *
   * @default undefined
   * @type {string}
   */
  ariaLabel: string;
}

/**
 * No MUI equivalent — MUI X's `TimePicker`/`DesktopTimePicker` is a masked text
 * input with a popover, not an always-visible inline picker; the source spec
 * deliberately calls that gap out ("Precise typed time → use a masked input").
 * The picker itself mirrors MUI's `MultiSectionDigitalClock`: up to three
 * plain scrollable columns (hours, minutes, and — only for `format="12h"` —
 * a third AM/PM column), each a simple list with the selected row picked out
 * by a filled pill, not a centered/enlarged carousel row. `value.h` is always
 * canonical 24-hour (0–23); the AM/PM column is purely a 12-hour selection
 * helper layered on top of it and is absent by default (`format` defaults to
 * `"24h"`, which has no AM/PM concept).
 */
export interface TimePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /**
   * Selected time. Controlled if provided; otherwise driven by `defaultValue`.
   *
   * @default undefined
   * @type {TimePickerValue}
   */
  value?: TimePickerValue;
  /**
   * Initial time when uncontrolled.
   *
   * @default { h: 0, m: 0 }
   * @type {TimePickerValue}
   */
  defaultValue?: TimePickerValue;
  /**
   * Minute column step.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
  /**
   * `"12h"` splits the hour column into 1–12 plus a third AM/PM column; the underlying value stays 24-hour either way.
   *
   * @default "24h"
   * @type {TimePickerFormat}
   */
  format?: TimePickerFormat;
  /**
   * Accent tone for the focus outline and selected-row pill.
   *
   * @default "primary"
   * @type {TimePickerColor}
   */
  color?: TimePickerColor;
  /**
   * Fires whenever any column settles on a new value.
   *
   * @default undefined
   * @type {(value: TimePickerValue) => void}
   */
  onChange?: (value: TimePickerValue) => void;
  /**
   * Accessible name for the hour column.
   *
   * @default "Hours"
   * @type {string}
   */
  hoursAriaLabel?: string;
  /**
   * Accessible name for the minute column.
   *
   * @default "Minutes"
   * @type {string}
   */
  minutesAriaLabel?: string;
  /**
   * Accessible name for the AM/PM column (only rendered for `format="12h"`).
   *
   * @default "AM/PM"
   * @type {string}
   */
  meridiemAriaLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
