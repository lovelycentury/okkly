import type { CalendarTone, CalendarWeekStart } from "../Calendar/Calendar.types";
import type { TimePickerFormat } from "../TimePicker/TimePicker.types";

/** Tints the calendar, the time wheels, and the Confirm button's glow. */
export type DateTimePickerColor = CalendarTone;

/**
 * No MUI equivalent as a fixed inline card — MUI X's `DateTimePicker` is a
 * masked text input with a popover. Composed from `Calendar` + `TimePicker`.
 * Deliberate gaps: only a date → use `Calendar`; only a time → use
 * `TimePicker`; and there is no shortcut-preset sidebar (MUI's
 * `slotProps.shortcuts`) — a preset is one line of caller code against
 * `v-model`.
 *
 * Props mirror `@okkly/react`'s `<DateTimePicker>` name-for-name.
 * Vue-forced differences: the controlled `value` + `onChange` pair becomes
 * an unnamed `defineModel<Date | null>()`, so consumers can `v-model` it —
 * `defaultValue` still seeds it once on mount when nothing is bound.
 * `onConfirm` becomes the `confirm` emit. `timezoneLabel`/`summaryLabel`/
 * `emptyLabel`/`confirmLabel` (all `ReactNode` in React) become the
 * `timezone-label`/`summary-label`/`empty-label`/`confirm-label` slots —
 * each falls back to React's own default text when left unfilled, same as
 * an unset `ReactNode` prop would. `className` is dropped — a consumer's
 * `class` merges onto the root automatically.
 */
export interface DateTimePickerProps {
  /**
   * Earliest selectable date (inclusive).
   *
   * @default undefined
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive).
   *
   * @default undefined
   */
  max?: Date;
  /**
   * Initial date & time when uncontrolled.
   *
   * @default null
   */
  defaultValue?: Date | null;
  /**
   * Minute wheel step.
   *
   * @default 1
   */
  timeStep?: number;
  /**
   * Hour wheel label format — the underlying value stays 24-hour either way.
   *
   * @default "24h"
   */
  format?: TimePickerFormat;
  /**
   * First day of the week.
   *
   * @default "mon"
   */
  weekStart?: CalendarWeekStart;
  /**
   * Accent tone shared by the calendar, the time wheels, and the Confirm button's glow.
   *
   * @default "primary"
   */
  color?: DateTimePickerColor;
  /**
   * Locale for the month title, weekday labels, and the summary text.
   *
   * @default "en-US"
   */
  locale?: string;
  /**
   * Accessible name for the calendar's "previous month" button.
   *
   * @default undefined
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the calendar's "next month" button.
   *
   * @default undefined
   */
  nextMonthLabel?: string;
}
