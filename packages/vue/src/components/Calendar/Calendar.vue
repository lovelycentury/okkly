<script lang="ts">
import type { CalendarDay, CalendarTone, CalendarWeekStart } from "./Calendar.types";

/** `style` for a calendar tinted with `tone`, or `undefined` for the default. */
export function calendarToneStyle(tone: CalendarTone): Record<string, string> | undefined {
  if (tone === "primary") return undefined;
  // The palette calls indigo "secondary"; every other tone is its own token.
  const token = tone === "indigo" ? "secondary" : tone;
  return { "--okkly-calendar-tone": `var(--okkly-accent-${token})` };
}

const YEAR_PAGE_SIZE = 12;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/** A year is unreachable once its last day is before `min`, or its first day is after `max`. */
function isYearDisabled(year: number, min?: Date, max?: Date): boolean {
  if (min && year < min.getFullYear()) return true;
  if (max && year > max.getFullYear()) return true;
  return false;
}

/** A month is unreachable once its last day is before `min`, or its first day is after `max`. */
function isMonthDisabled(year: number, monthIndex: number, min?: Date, max?: Date): boolean {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  if (min && end < startOfDay(min)) return true;
  if (max && start > startOfDay(max)) return true;
  return false;
}

/** Short month labels ("Jan", "Feb", ...) for the given locale, Jan → Dec. */
function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2023, i, 1).toLocaleDateString(locale, { month: "short" }),
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const day = startOfDay(date).getTime();
  const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
  return day >= startOfDay(from).getTime() && day <= startOfDay(to).getTime();
}

/** Weeks of `CalendarDay`s covering the full grid, including the leading/trailing days from adjacent months. */
function getMonthGrid(month: Date, weekStart: CalendarWeekStart): CalendarDay[][] {
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
function getWeekdayLabels(weekStart: CalendarWeekStart, locale: string): string[] {
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
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { iconChevronDown, iconChevronLeft, iconChevronRight } from "@okkly/icons";
import "@okkly/design-system/components/Calendar/Calendar.scss";
import type { CalendarValue, CalendarView, CalendarProps } from "./Calendar.types";

const props = withDefaults(defineProps<CalendarProps>(), {
  mode: "single",
  min: undefined,
  max: undefined,
  weekStart: "mon",
  locale: "en-US",
  previousMonthLabel: "Previous month",
  nextMonthLabel: "Next month",
  color: "primary",
});

const model = defineModel<CalendarValue | null>({ default: null });
const monthModel = defineModel<Date>("month");

const toneStyle = computed(() => calendarToneStyle(props.color));

// Mirrors React's `useState(() => startOfMonth(month ?? new Date()))`: read
// once on mount, never written into `monthModel` eagerly — see
// Calendar.types.ts for why.
const internalMonth = ref<Date>(startOfMonth(monthModel.value ?? new Date()));
const visibleMonth = computed(() =>
  monthModel.value ? startOfMonth(monthModel.value) : internalMonth.value,
);
const today = startOfDay(new Date());
const weeks = computed(() => getMonthGrid(visibleMonth.value, props.weekStart));
const weekdayLabels = computed(() => getWeekdayLabels(props.weekStart, props.locale));
const monthLabels = computed(() => getMonthLabels(props.locale));
const title = computed(() =>
  visibleMonth.value.toLocaleDateString(props.locale, { month: "long", year: "numeric" }),
);

// `view` walks up the hierarchy on a header click (day → year, month → year)
// and back down once a year/month is actually picked. `viewYear` is the year
// being browsed in the month/year grids — kept separate from `visibleMonth`
// so paging through years while picking a month has no side effects (no
// `update:month`) until a month is actually chosen.
const view = ref<CalendarView>("day");
const viewYear = ref<number>(visibleMonth.value.getFullYear());
const yearPageStart = computed(() => Math.floor(viewYear.value / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE);
const yearRange = computed(() =>
  Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => yearPageStart.value + i),
);

// Range mode is two clicks, and the half-finished state between them belongs
// to the calendar, not the caller: the model only changes once there is a
// real pair to hand over. `pendingStart` is that in-between.
const pendingStart = ref<Date | null>(null);

const singleValue = computed(() =>
  props.mode === "single" && model.value instanceof Date ? model.value : null,
);
const committedRange = computed(() =>
  props.mode === "range" && Array.isArray(model.value) ? model.value : null,
);
// While a start is armed the committed pair is ignored — the user is drawing a
// new range, and showing the old one underneath would read as two selections.
const rangeStart = computed(() => pendingStart.value ?? committedRange.value?.[0] ?? null);
const rangeEnd = computed(() => (pendingStart.value ? null : (committedRange.value?.[1] ?? null)));

function goToMonth(next: Date) {
  internalMonth.value = next;
  monthModel.value = next;
}

function openYearView() {
  viewYear.value = visibleMonth.value.getFullYear();
  view.value = "year";
}

function selectYear(year: number) {
  viewYear.value = year;
  view.value = "month";
}

function selectMonth(monthIndex: number) {
  view.value = "day";
  goToMonth(new Date(viewYear.value, monthIndex, 1));
}

function handleDayClick(date: Date) {
  const day = startOfDay(date);
  if (props.mode === "single") {
    model.value = day;
    return;
  }
  if (!pendingStart.value) {
    pendingStart.value = day;
    return;
  }
  // Clicking backwards is a legitimate way to draw a range, so order the pair
  // here rather than making every caller re-sort it.
  const start = pendingStart.value;
  const pair: [Date, Date] = day < start ? [day, start] : [start, day];
  pendingStart.value = null;
  model.value = pair;
}

function handlePrev() {
  if (view.value === "day") goToMonth(addMonths(visibleMonth.value, -1));
  else if (view.value === "month") viewYear.value -= 1;
  else viewYear.value -= YEAR_PAGE_SIZE;
}

function handleNext() {
  if (view.value === "day") goToMonth(addMonths(visibleMonth.value, 1));
  else if (view.value === "month") viewYear.value += 1;
  else viewYear.value += YEAR_PAGE_SIZE;
}

const prevLabel = computed(() =>
  view.value === "day"
    ? props.previousMonthLabel
    : view.value === "month"
      ? "Previous year"
      : "Previous years",
);
const nextLabel = computed(() =>
  view.value === "day" ? props.nextMonthLabel : view.value === "month" ? "Next year" : "Next years",
);
const headerLabel = computed(() =>
  view.value === "year"
    ? `${yearPageStart.value}–${yearPageStart.value + YEAR_PAGE_SIZE - 1}`
    : view.value === "month"
      ? String(viewYear.value)
      : title.value,
);
// Mirrors MUI's "switch view" button naming so screen readers announce what
// clicking the header will do, not just the visible label text.
const headerAriaLabel = computed(() =>
  view.value === "day"
    ? `Choose year, currently ${title.value}`
    : view.value === "month"
      ? `Choose year, currently ${viewYear.value}`
      : undefined,
);

const classes = "okkly-component okkly-calendar";

function isDayDisabled(date: Date): boolean {
  return Boolean(
    (props.min && date < startOfDay(props.min)) || (props.max && date > startOfDay(props.max)),
  );
}

function dayState(day: CalendarDay) {
  const { date, outside } = day;
  const disabled = isDayDisabled(date);
  const isToday = isSameDay(date, today);
  // Every edge is decided by comparing dates, never by a cell's position in
  // the grid — the leading and trailing days of the adjacent months are real
  // dates in the range and have to paint like it, without ever being
  // mistaken for its ends.
  const isRangeStart = !!rangeStart.value && isSameDay(date, rangeStart.value);
  const isRangeEnd = !!rangeEnd.value && isSameDay(date, rangeEnd.value);
  const inRange =
    !!rangeStart.value &&
    !!rangeEnd.value &&
    !isRangeStart &&
    !isRangeEnd &&
    isBetween(date, rangeStart.value, rangeEnd.value);
  const selected =
    props.mode === "single"
      ? !!singleValue.value && isSameDay(date, singleValue.value)
      : isRangeStart || isRangeEnd;

  const classNames = [
    "okkly-calendar__day",
    outside && "okkly-calendar__day--outside",
    isToday && "okkly-calendar__day--today",
    inRange && "okkly-calendar__day--in-range",
    isRangeStart && "okkly-calendar__day--range-start",
    isRangeEnd && "okkly-calendar__day--range-end",
    props.mode === "single" && selected && "okkly-calendar__day--selected",
    disabled && "okkly-calendar__day--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return { disabled, isToday, selected, classes: classNames };
}

function monthCellState(monthIndex: number) {
  const disabled = isMonthDisabled(viewYear.value, monthIndex, props.min, props.max);
  const selected =
    viewYear.value === visibleMonth.value.getFullYear() &&
    monthIndex === visibleMonth.value.getMonth();
  const classNames = [
    "okkly-calendar__period-cell",
    selected && "okkly-calendar__period-cell--selected",
    disabled && "okkly-calendar__period-cell--disabled",
  ]
    .filter(Boolean)
    .join(" ");
  return { disabled, selected, classes: classNames };
}

function yearCellState(year: number) {
  const disabled = isYearDisabled(year, props.min, props.max);
  const selected = year === visibleMonth.value.getFullYear();
  const classNames = [
    "okkly-calendar__period-cell",
    selected && "okkly-calendar__period-cell--selected",
    disabled && "okkly-calendar__period-cell--disabled",
  ]
    .filter(Boolean)
    .join(" ");
  return { disabled, selected, classes: classNames };
}
</script>

<template>
  <div :class="classes" :style="toneStyle">
    <div class="okkly-calendar__panel">
      <div class="okkly-calendar__header">
        <button
          type="button"
          class="okkly-calendar__nav-button"
          :aria-label="prevLabel"
          @click="handlePrev"
        >
          <span aria-hidden="true" v-html="iconChevronLeft" />
        </button>
        <p v-if="view === 'year'" class="okkly-calendar__title">{{ headerLabel }}</p>
        <button
          v-else
          type="button"
          class="okkly-calendar__title okkly-calendar__title--button"
          :aria-label="headerAriaLabel"
          @click="openYearView"
        >
          {{ headerLabel }}
          <span
            :class="[
              'okkly-calendar__title-chevron',
              view === 'month' && 'okkly-calendar__title-chevron--open',
            ]"
            aria-hidden="true"
            v-html="iconChevronDown"
          />
        </button>
        <button
          type="button"
          class="okkly-calendar__nav-button"
          :aria-label="nextLabel"
          @click="handleNext"
        >
          <span aria-hidden="true" v-html="iconChevronRight" />
        </button>
      </div>
      <div v-if="view === 'day'" class="okkly-calendar__grid">
        <div class="okkly-calendar__week">
          <span
            v-for="(label, index) in weekdayLabels"
            :key="index"
            class="okkly-calendar__weekday"
            >{{ label }}</span
          >
        </div>
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="okkly-calendar__week">
          <button
            v-for="day in week"
            :key="day.date.toISOString()"
            type="button"
            :class="dayState(day).classes"
            :disabled="dayState(day).disabled"
            :aria-pressed="dayState(day).selected"
            :aria-current="dayState(day).isToday ? 'date' : undefined"
            @click="handleDayClick(day.date)"
          >
            {{ day.date.getDate() }}
            <span v-if="dayState(day).isToday" class="okkly-calendar__day-dot" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div v-else-if="view === 'month'" class="okkly-calendar__period-grid">
        <button
          v-for="(label, index) in monthLabels"
          :key="index"
          type="button"
          :class="monthCellState(index).classes"
          :disabled="monthCellState(index).disabled"
          :aria-pressed="monthCellState(index).selected"
          @click="selectMonth(index)"
        >
          {{ label }}
        </button>
      </div>
      <div v-else-if="view === 'year'" class="okkly-calendar__period-grid">
        <button
          v-for="year in yearRange"
          :key="year"
          type="button"
          :class="yearCellState(year).classes"
          :disabled="yearCellState(year).disabled"
          :aria-pressed="yearCellState(year).selected"
          @click="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </div>
  </div>
</template>
