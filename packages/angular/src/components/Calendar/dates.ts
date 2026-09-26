/** First day of the week the day grid starts on. */
export type CalendarWeekStart = "mon" | "sun";
/** `"single"` commits on every click; `"range"` takes two clicks to commit a pair. */
export type CalendarMode = "single" | "range";
/** `Date` in single mode, `[start, end]` in range mode. */
export type CalendarValue = Date | [Date, Date];

/**
 * Accent names the surrounding date components already speak — `Calendar`'s own
 * `color` input, and the one this maps onto its `--okkly-calendar-tone` CSS
 * variable via `calendarToneVar`, below.
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

export const YEAR_PAGE_SIZE = 12;

/** `--okkly-calendar-tone` for a calendar tinted with `tone`, or `null` for the default. */
export function calendarToneVar(tone: CalendarTone): string | null {
  if (tone === "primary") return null;
  // The palette calls indigo "secondary"; every other tone is its own token.
  const token = tone === "indigo" ? "secondary" : tone;
  return `var(--okkly-accent-${token})`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/** A year is unreachable once its last day is before `min`, or its first day is after `max`. */
export function isYearDisabled(year: number, min?: Date, max?: Date): boolean {
  if (min && year < min.getFullYear()) return true;
  if (max && year > max.getFullYear()) return true;
  return false;
}

/** A month is unreachable once its last day is before `min`, or its first day is after `max`. */
export function isMonthDisabled(year: number, monthIndex: number, min?: Date, max?: Date): boolean {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  if (min && end < startOfDay(min)) return true;
  if (max && start > startOfDay(max)) return true;
  return false;
}

/** Short month labels ("Jan", "Feb", ...) for the given locale, Jan → Dec. */
export function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2023, i, 1).toLocaleDateString(locale, { month: "short" }),
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  const day = startOfDay(date).getTime();
  const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
  return day >= startOfDay(from).getTime() && day <= startOfDay(to).getTime();
}

/** Weeks of `CalendarDay`s covering the full grid, including the leading/trailing days from adjacent months. */
export function getMonthGrid(month: Date, weekStart: CalendarWeekStart): CalendarDay[][] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + (weekStart === "mon" ? 6 : 0)) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const days: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, monthIndex, i - firstWeekday + 1);
    days.push({ date, outside: date.getMonth() !== monthIndex });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/** Two-letter weekday labels ("Mo", "Tu", ...) for the given locale, ordered from `weekStart`. */
export function getWeekdayLabels(weekStart: CalendarWeekStart, locale: string): string[] {
  // 2023-01-01 is a Sunday — a stable reference week to read labels off.
  return Array.from({ length: 7 }, (_, i) => {
    const offset = weekStart === "mon" ? i + 1 : i;
    const date = new Date(2023, 0, 1 + offset);
    return date
      .toLocaleDateString(locale, { weekday: "short" })
      .slice(0, 2)
      .replace(/^./, (c) => c.toUpperCase());
  });
}
