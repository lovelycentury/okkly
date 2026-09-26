import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  signal,
} from "@angular/core";
import { iconChevronDown, iconChevronLeft, iconChevronRight } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";
import {
  YEAR_PAGE_SIZE,
  addMonths,
  calendarToneVar,
  getMonthGrid,
  getMonthLabels,
  getWeekdayLabels,
  isBetween,
  isMonthDisabled,
  isSameDay,
  isYearDisabled,
  startOfDay,
  startOfMonth,
  type CalendarDay,
  type CalendarMode,
  type CalendarTone,
  type CalendarValue,
  type CalendarView,
  type CalendarWeekStart,
} from "./dates";

export type {
  CalendarDay,
  CalendarMode,
  CalendarTone,
  CalendarValue,
  CalendarView,
  CalendarWeekStart,
} from "./dates";

/** Rendering state for one day/month/year cell — what a template needs to pick its classes and attributes. */
interface CalendarCellState {
  disabled: boolean;
  selected: boolean;
  classes: string;
}

/**
 * Closest MUI counterpart is MUI X's `DateCalendar`
 * (https://mui.com/x/api/date-pickers/date-calendar/): `min`/`max`/`weekStart`/
 * `locale`/`previousMonthLabel`/`nextMonthLabel`/`color` all match
 * `@okkly/react`'s `<Calendar>` name-for-name, and the header drills through
 * the same year → month → day hierarchy MUI exposes via
 * `views={["year","month","day"]}`. `mode="range"` covers what MUI splits
 * into a separate `DateRangeCalendar`.
 *
 * Deliberate gaps: no discriminated `mode`/`value`/`onSelect` union — react's
 * `CalendarSingleProps`/`CalendarRangeProps` split exists so a TSX caller gets
 * `onSelect` narrowed to `(date: Date)` vs `(range: [Date, Date])`, which an
 * Angular template gets no benefit from (no static narrowing on a bound
 * expression), so `value` is one `model<CalendarValue | null>()` for both
 * modes. No separate `onSelect`/`(select)` either — unlike `OkklySelect`,
 * every `value` change here means exactly one thing ("a date/range was
 * picked"), so the two-way `[(value)]` alone carries what react's `onSelect`
 * did; a reason-carrying output would have nothing to say. `month` is a
 * `model<Date | undefined>()` the same way — bind it for a controlled visible
 * month, or leave it unbound and the calendar tracks its own (starting at
 * today). No `className`/`style` forwarding, matching `OkklySelect`;
 * `--okkly-calendar-tone` is set via `color`, or override it directly with a
 * `style="--okkly-calendar-tone: …"` attribute on the element itself.
 */
@Component({
  selector: "okkly-calendar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyIcon],
  host: {
    class: "okkly-component okkly-calendar",
    "[style.--okkly-calendar-tone]": "toneVar()",
  },
  templateUrl: "./Calendar.html",
})
export class OkklyCalendar {
  /**
   * `"single"` commits on every click. `"range"` takes two clicks — the first
   * arms a start, the second commits the ordered pair.
   *
   * @default "single"
   */
  readonly mode = input<CalendarMode>("single");
  /**
   * Selected date (`mode="single"`) or `[start, end]` pair (`mode="range"`).
   * Two-way bindable as `[(value)]`.
   *
   * @default null
   */
  readonly value = model<CalendarValue | null>(null);
  /**
   * Any date within the visible month. Two-way bindable as `[(month)]`; leave
   * it unbound for an internally-tracked visible month starting at today.
   *
   * @default undefined
   */
  readonly month = model<Date | undefined>(undefined);
  /**
   * Earliest selectable date (inclusive). Also disables unreachable
   * years/months in those views.
   *
   * @default undefined
   */
  readonly min = input<Date>();
  /**
   * Latest selectable date (inclusive). Also disables unreachable
   * years/months in those views.
   *
   * @default undefined
   */
  readonly max = input<Date>();
  /**
   * First day of the week.
   *
   * @default "mon"
   */
  readonly weekStart = input<CalendarWeekStart>("mon");
  /**
   * Locale for the month title, weekday labels, and month-grid labels.
   *
   * @default "en-US"
   */
  readonly locale = input<string>("en-US");
  /**
   * Accessible name for the "previous" nav button.
   *
   * @default "Previous month"
   */
  readonly previousMonthLabel = input("Previous month");
  /**
   * Accessible name for the "next" nav button.
   *
   * @default "Next month"
   */
  readonly nextMonthLabel = input("Next month");
  /**
   * Accent tone — the same named palette Button/Chip use.
   *
   * @default "primary"
   */
  readonly color = input<CalendarTone>("primary");

  protected readonly iconChevronLeft = iconChevronLeft;
  protected readonly iconChevronRight = iconChevronRight;
  protected readonly iconChevronDown = iconChevronDown;

  protected readonly toneVar = computed(() => calendarToneVar(this.color()));

  // Read once, the same way React's `useState(() => startOfMonth(month ?? new
  // Date()))` seeds its fallback only at mount — `visibleMonth` below prefers
  // the `month` model whenever it's bound, so this is only ever the
  // uncontrolled starting point.
  private readonly internalMonth = signal<Date>(startOfMonth(new Date()));
  protected readonly visibleMonth = computed(() => {
    const month = this.month();
    return month ? startOfMonth(month) : this.internalMonth();
  });
  private readonly today = startOfDay(new Date());

  protected readonly weeks = computed(() => getMonthGrid(this.visibleMonth(), this.weekStart()));
  protected readonly weekdayLabels = computed(() =>
    getWeekdayLabels(this.weekStart(), this.locale()),
  );
  protected readonly monthLabels = computed(() => getMonthLabels(this.locale()));
  protected readonly title = computed(() =>
    this.visibleMonth().toLocaleDateString(this.locale(), { month: "long", year: "numeric" }),
  );

  // `view` walks up the hierarchy on a header click (day → year, month →
  // year) and back down once a year/month is actually picked. `viewYear` is
  // the year being browsed in the month/year grids — kept separate from
  // `visibleMonth` so paging through years while picking a month has no side
  // effects (no `month` update) until a month is actually chosen.
  protected readonly view = signal<CalendarView>("day");
  protected readonly viewYear = signal<number>(this.visibleMonth().getFullYear());
  protected readonly yearPageStart = computed(
    () => Math.floor(this.viewYear() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE,
  );
  protected readonly yearRange = computed(() =>
    Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => this.yearPageStart() + i),
  );

  // Range mode is two clicks, and the half-finished state between them
  // belongs to the calendar, not the caller: `value` only changes once there
  // is a real pair to hand over.
  private readonly pendingStart = signal<Date | null>(null);

  private readonly singleValue = computed(() => {
    const value = this.value();
    return this.mode() === "single" && value instanceof Date ? value : null;
  });
  private readonly committedRange = computed(() => {
    const value = this.value();
    return this.mode() === "range" && Array.isArray(value) ? value : null;
  });
  // While a start is armed the committed pair is ignored — the user is
  // drawing a new range, and showing the old one underneath would read as two
  // selections.
  private readonly rangeStart = computed(
    () => this.pendingStart() ?? this.committedRange()?.[0] ?? null,
  );
  private readonly rangeEnd = computed(() =>
    this.pendingStart() ? null : (this.committedRange()?.[1] ?? null),
  );

  protected readonly prevLabel = computed(() => {
    const view = this.view();
    if (view === "day") return this.previousMonthLabel();
    return view === "month" ? "Previous year" : "Previous years";
  });
  protected readonly nextLabel = computed(() => {
    const view = this.view();
    if (view === "day") return this.nextMonthLabel();
    return view === "month" ? "Next year" : "Next years";
  });
  protected readonly headerLabel = computed(() => {
    const view = this.view();
    if (view === "year") {
      const start = this.yearPageStart();
      return `${start}–${start + YEAR_PAGE_SIZE - 1}`;
    }
    return view === "month" ? String(this.viewYear()) : this.title();
  });
  // Mirrors MUI's "switch view" button naming so screen readers announce what
  // clicking the header will do, not just the visible label text.
  protected readonly headerAriaLabel = computed(() => {
    const view = this.view();
    if (view === "day") return `Choose year, currently ${this.title()}`;
    return view === "month" ? `Choose year, currently ${this.viewYear()}` : null;
  });

  private goToMonth(next: Date): void {
    this.internalMonth.set(next);
    this.month.set(next);
  }

  protected openYearView(): void {
    this.viewYear.set(this.visibleMonth().getFullYear());
    this.view.set("year");
  }

  protected selectYear(year: number): void {
    this.viewYear.set(year);
    this.view.set("month");
  }

  protected selectMonth(monthIndex: number): void {
    this.view.set("day");
    this.goToMonth(new Date(this.viewYear(), monthIndex, 1));
  }

  protected onDayClick(date: Date): void {
    const day = startOfDay(date);
    if (this.mode() === "single") {
      this.value.set(day);
      return;
    }
    const pending = this.pendingStart();
    if (!pending) {
      this.pendingStart.set(day);
      return;
    }
    // Clicking backwards is a legitimate way to draw a range, so order the
    // pair here rather than making every caller re-sort it.
    const pair: [Date, Date] = day < pending ? [day, pending] : [pending, day];
    this.pendingStart.set(null);
    this.value.set(pair);
  }

  protected handlePrev(): void {
    const view = this.view();
    if (view === "day") this.goToMonth(addMonths(this.visibleMonth(), -1));
    else if (view === "month") this.viewYear.update((y) => y - 1);
    else this.viewYear.update((y) => y - YEAR_PAGE_SIZE);
  }

  protected handleNext(): void {
    const view = this.view();
    if (view === "day") this.goToMonth(addMonths(this.visibleMonth(), 1));
    else if (view === "month") this.viewYear.update((y) => y + 1);
    else this.viewYear.update((y) => y + YEAR_PAGE_SIZE);
  }

  private isDayDisabled(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    return Boolean((min && date < startOfDay(min)) || (max && date > startOfDay(max)));
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, this.today);
  }

  /** Every edge is decided by comparing dates, never by a cell's position in
   * the grid — the leading and trailing days of the adjacent months are real
   * dates in the range and have to paint like it, without ever being
   * mistaken for its ends. */
  protected dayState(day: CalendarDay): CalendarCellState {
    const { date, outside } = day;
    const disabled = this.isDayDisabled(date);
    const isToday = this.isToday(date);
    const rangeStart = this.rangeStart();
    const rangeEnd = this.rangeEnd();
    const isRangeStart = !!rangeStart && isSameDay(date, rangeStart);
    const isRangeEnd = !!rangeEnd && isSameDay(date, rangeEnd);
    const inRange =
      !!rangeStart &&
      !!rangeEnd &&
      !isRangeStart &&
      !isRangeEnd &&
      isBetween(date, rangeStart, rangeEnd);
    const mode = this.mode();
    const singleValue = this.singleValue();
    const selected =
      mode === "single"
        ? !!singleValue && isSameDay(date, singleValue)
        : isRangeStart || isRangeEnd;

    const classes = [
      "okkly-calendar__day",
      outside && "okkly-calendar__day--outside",
      isToday && "okkly-calendar__day--today",
      inRange && "okkly-calendar__day--in-range",
      isRangeStart && "okkly-calendar__day--range-start",
      isRangeEnd && "okkly-calendar__day--range-end",
      mode === "single" && selected && "okkly-calendar__day--selected",
      disabled && "okkly-calendar__day--disabled",
    ]
      .filter(Boolean)
      .join(" ");

    return { disabled, selected, classes };
  }

  protected monthCellState(monthIndex: number): CalendarCellState {
    const viewYear = this.viewYear();
    const disabled = isMonthDisabled(viewYear, monthIndex, this.min(), this.max());
    const visibleMonth = this.visibleMonth();
    const selected =
      viewYear === visibleMonth.getFullYear() && monthIndex === visibleMonth.getMonth();
    return { disabled, selected, classes: this.periodClasses(selected, disabled) };
  }

  protected yearCellState(year: number): CalendarCellState {
    const disabled = isYearDisabled(year, this.min(), this.max());
    const selected = year === this.visibleMonth().getFullYear();
    return { disabled, selected, classes: this.periodClasses(selected, disabled) };
  }

  private periodClasses(selected: boolean, disabled: boolean): string {
    return [
      "okkly-calendar__period-cell",
      selected && "okkly-calendar__period-cell--selected",
      disabled && "okkly-calendar__period-cell--disabled",
    ]
      .filter(Boolean)
      .join(" ");
  }
}
