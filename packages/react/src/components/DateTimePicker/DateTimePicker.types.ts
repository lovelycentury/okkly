import type { ReactNode } from "react";
import type { CalendarTone, CalendarWeekStart } from "../Calendar/Calendar.types";
import type { TimePickerFormat } from "../TimePicker/TimePicker.types";

/** Tints the calendar, the time wheels, and the Confirm button's glow. */
export type DateTimePickerColor = CalendarTone;

/**
 * No MUI equivalent as a fixed inline card — MUI X's `DateTimePicker` is a
 * masked text input with a popover. Composed from `Calendar` + `TimePicker`.
 * Deliberate gaps: only a date → use `Calendar`; only a time → use
 * `TimePicker`; and there is no shortcut-preset sidebar (MUI's
 * `slotProps.shortcuts`) — a preset is one line of caller code against `value`.
 */
export interface DateTimePickerProps {
  /**
   * Selected date & time. Controlled if provided; otherwise driven by `defaultValue`.
   *
   * @default undefined
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Initial date & time when uncontrolled.
   *
   * @default null
   * @type {Date | null}
   */
  defaultValue?: Date | null;
  /**
   * Earliest selectable date (inclusive).
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive).
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
  /**
   * Minute wheel step.
   *
   * @default 1
   * @type {number}
   */
  timeStep?: number;
  /**
   * Hour wheel label format — the underlying value stays 24-hour either way.
   *
   * @default "24h"
   * @type {TimePickerFormat}
   */
  format?: TimePickerFormat;
  /**
   * First day of the week.
   *
   * @default "mon"
   * @type {CalendarWeekStart}
   */
  weekStart?: CalendarWeekStart;
  /**
   * Accent tone shared by the calendar, the time wheels, and the Confirm button's glow.
   *
   * @default "primary"
   * @type {DateTimePickerColor}
   */
  color?: DateTimePickerColor;
  /**
   * Locale for the month title, weekday labels, and the summary text.
   *
   * @default "en-US"
   * @type {string}
   */
  locale?: string;
  /**
   * Trailing chip next to the summary text (e.g. a timezone, "GMT+2"). Omitted when not set.
   *
   * @default undefined
   * @type {ReactNode}
   */
  timezoneLabel?: ReactNode;
  /**
   * Label shown above the summary text.
   *
   * @default "Selected time"
   * @type {ReactNode}
   */
  summaryLabel?: ReactNode;
  /**
   * Summary text shown before any date has been picked.
   *
   * @default "No date selected"
   * @type {ReactNode}
   */
  emptyLabel?: ReactNode;
  /**
   * Confirm button label.
   *
   * @default "Confirm"
   * @type {ReactNode}
   */
  confirmLabel?: ReactNode;
  /**
   * Fires whenever the calendar day or either time wheel changes.
   *
   * @default undefined
   * @type {(value: Date) => void}
   */
  onChange?: (value: Date) => void;
  /**
   * Fires when the Confirm button is clicked.
   *
   * @default undefined
   * @type {(value: Date) => void}
   */
  onConfirm?: (value: Date) => void;
  /**
   * Accessible name for the calendar's "previous month" button.
   *
   * @default undefined
   * @type {string}
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the calendar's "next month" button.
   *
   * @default undefined
   * @type {string}
   */
  nextMonthLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
