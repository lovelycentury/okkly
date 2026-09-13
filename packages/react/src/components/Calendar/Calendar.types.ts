import type { CSSProperties } from "react";

export type CalendarWeekStart = "mon" | "sun";
/** `"single"` commits on every click; `"range"` takes two clicks to commit a pair. */
export type CalendarMode = "single" | "range";
/** `Date` in single mode, `[start, end]` in range mode. */
export type CalendarValue = Date | [Date, Date];

/**
 * Accent names the surrounding date components already speak — `Calendar`'s own
 * `color` prop, and the one this maps onto its `--okkly-calendar-tone` CSS
 * variable via `calendarToneStyle`, below.
 */
export type CalendarTone = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/** Which grid is currently showing — drills up on the header label click (`day` → `year`),
 * back down once a year/month is actually picked (`year` → `month` → `day`), matching MUI's
 * `DateCalendar` with `views={["year", "month", "day"]}`. */
export type CalendarView = "day" | "month" | "year";

export interface CalendarDay {
  date: Date;
  outside: boolean;
}

/**
 * Closest MUI counterpart is MUI X's `DateCalendar`
 * (https://mui.com/x/api/date-pickers/date-calendar/): `value`/`onChange`
 * naming is mirrored as `value`/`onSelect`, and the header drills through
 * the same year → month → day hierarchy MUI exposes via
 * `views={["year","month","day"]}`. `mode="range"` covers what MUI splits into
 * a separate `DateRangeCalendar`. Deliberate gaps: no controlled
 * `view`/`onViewChange` and no shortcut-preset sidebar.
 *
 * There is also no decorative "availability window" tint. It used to exist as a
 * `highlight` prop and was indistinguishable from a selected range — same 12%
 * wash, different meaning. A caller who needs it can paint it with a class.
 */
export interface CalendarBaseProps {
  /**
   * Any date within the visible month. Uncontrolled unless re-supplied on `onMonthChange`.
   *
   * @default undefined
   * @type {Date}
   */
  month?: Date;
  /**
   * Fires when the prev/next arrows change the visible month (day view), or when a month is picked from the month grid.
   *
   * @default undefined
   * @type {(month: Date) => void}
   */
  onMonthChange?: (month: Date) => void;
  /**
   * Earliest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
  /**
   * First day of the week.
   *
   * @default "mon"
   * @type {CalendarWeekStart}
   */
  weekStart?: CalendarWeekStart;
  /**
   * Locale for the month title, weekday labels, and month-grid labels.
   *
   * @default "en-US"
   * @type {string}
   */
  locale?: string;
  /**
   * Accessible name for the "previous month" button (day view).
   *
   * @default "Previous month"
   * @type {string}
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the "next month" button (day view).
   *
   * @default "Next month"
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
  /**
   * Accent tone — the same named palette Button/Chip use. Applied via
   * `calendarToneStyle`, so it merges into `style` rather than replacing it;
   * an explicit `--okkly-calendar-tone` in `style` still wins.
   *
   * @default "primary"
   * @type {CalendarTone}
   */
  color?: CalendarTone;
  /**
   * Inline styles. The accent tone is a CSS variable rather than a prop, so this is how a caller retints the calendar directly: `style={{ "--okkly-calendar-tone": "var(--okkly-accent-dante)" }}`. Prefer `color` for the named palette — this is for a one-off/custom tone.
   *
   * @default undefined
   * @type {CSSProperties}
   */
  style?: CSSProperties;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /**
   * One date at a time.
   *
   * @default "single"
   * @type {"single"}
   */
  mode?: "single";
  /**
   * Selected date.
   *
   * @default null
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Fires with the clicked date.
   *
   * @default undefined
   * @type {(date: Date) => void}
   */
  onSelect?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /**
   * A start/end pair, picked in two clicks.
   *
   * @default "single"
   * @type {"range"}
   */
  mode: "range";
  /**
   * Selected `[start, end]` pair.
   *
   * @default null
   * @type {[Date, Date] | null}
   */
  value?: [Date, Date] | null;
  /**
   * Fires on the *second* click, with the pair already ordered — the first click only arms the start, which the calendar holds internally.
   *
   * @default undefined
   * @type {(range: [Date, Date]) => void}
   */
  onSelect?: (range: [Date, Date]) => void;
}

/**
 * Discriminated on `mode`, so `onSelect` is typed `(date: Date)` in single mode
 * and `(range: [Date, Date])` in range mode — no narrowing at the call site.
 */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/** The union collapsed to what the body actually reads. Narrowed once, below. */
export interface CalendarInternalProps extends CalendarBaseProps {
  mode?: CalendarMode;
  value?: CalendarValue | null;
  onSelect?: (value: CalendarValue) => void;
}
