export type CalendarWeekStart = "mon" | "sun";
/** `"single"` commits on every click; `"range"` takes two clicks to commit a pair. */
export type CalendarMode = "single" | "range";
/** `Date` in single mode, `[start, end]` in range mode. */
export type CalendarValue = Date | [Date, Date];

/**
 * Accent names the surrounding date components already speak — `Calendar`'s own
 * `color` prop, and the one this maps onto its `--okkly-calendar-tone` CSS
 * variable via `calendarToneStyle` (exported from `Calendar.vue`).
 */
export type CalendarTone = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Which grid is currently showing — drills up on the header label click
 * (`day` → `year`), back down once a year/month is actually picked
 * (`year` → `month` → `day`), matching MUI's `DateCalendar` with
 * `views={["year", "month", "day"]}`.
 */
export type CalendarView = "day" | "month" | "year";

export interface CalendarDay {
  date: Date;
  outside: boolean;
}

/**
 * Closest MUI counterpart is MUI X's `DateCalendar`
 * (https://mui.com/x/api/date-pickers/date-calendar/), mirroring
 * `@okkly/react`'s `<Calendar>` name-for-name: the header drills through the
 * same year → month → day hierarchy MUI exposes via
 * `views={["year","month","day"]}`. `mode="range"` covers what MUI splits
 * into a separate `DateRangeCalendar`. Deliberate gaps carried over from
 * React: no controlled `view`/`onViewChange` and no shortcut-preset
 * sidebar.
 *
 * There is also no decorative "availability window" tint. It used to exist
 * as a `highlight` prop and was indistinguishable from a selected range —
 * same 12% wash, different meaning. A caller who needs it can paint it with
 * a class.
 *
 * Vue-forced differences:
 * - The controlled `value`/`onSelect` pair becomes the primary `v-model`;
 *   `month`/`onMonthChange` becomes the named model `v-model:month`, seeded
 *   from `new Date()` when left unbound — read in a computed fallback
 *   rather than written into the model on mount, the same reasoning
 *   `Slider`'s `defaultValue` handling documents.
 * - React discriminates `onSelect`'s signature on `mode` via a union type
 *   (`CalendarSingleProps | CalendarRangeProps`), so a `range`-mode caller's
 *   handler is typed `(range: [Date, Date]) => void` with no narrowing at
 *   the call site. A single `defineModel` can't carry two different value
 *   shapes gated by a sibling prop, so `v-model` here is always typed
 *   `CalendarValue | null` (the same collapsed shape React's own
 *   `CalendarInternalProps` reads internally) — check `mode` yourself if
 *   the branch matters.
 * - `className`/`style` are dropped — a consumer's `class`/`style` fall
 *   through and merge onto the root automatically, the same as everywhere
 *   else in this package.
 */
export interface CalendarProps {
  /**
   * One date at a time, or a start/end pair.
   *
   * @default "single"
   */
  mode?: CalendarMode;
  /**
   * Earliest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   */
  max?: Date;
  /**
   * First day of the week.
   *
   * @default "mon"
   */
  weekStart?: CalendarWeekStart;
  /**
   * Locale for the month title, weekday labels, and month-grid labels.
   *
   * @default "en-US"
   */
  locale?: string;
  /**
   * Accessible name for the "previous month" button (day view).
   *
   * @default "Previous month"
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the "next month" button (day view).
   *
   * @default "Next month"
   */
  nextMonthLabel?: string;
  /**
   * Accent tone — the same named palette Button/Chip use. Applied via
   * `calendarToneStyle`, so it merges into the fallthrough `style` rather
   * than replacing it; an explicit `--okkly-calendar-tone` in a consumer's
   * own `style` still wins (bound after this component's own).
   *
   * @default "primary"
   */
  color?: CalendarTone;
}
