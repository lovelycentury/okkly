import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
  type ElementRef,
} from "@angular/core";
import { iconArrowRight, iconGlobe } from "@okkly/icons";
import { OkklyButton, OkklyButtonEndIcon } from "../Button/Button";
import { OkklyCalendar } from "../Calendar/Calendar";
import {
  startOfDay,
  type CalendarTone,
  type CalendarValue,
  type CalendarWeekStart,
} from "../Calendar/dates";
import { OkklyChip, OkklyChipIcon } from "../Chip/Chip";
import { OkklyIcon } from "../Icon/Icon";
import {
  OkklyTimePicker,
  type TimePickerFormat,
  type TimePickerValue,
} from "../TimePicker/TimePicker";

export type DateTimePickerColor = CalendarTone;
export type { TimePickerFormat };

function timeOf(date: Date): TimePickerValue {
  return { h: date.getHours(), m: date.getMinutes() };
}

function combine(day: Date, time: TimePickerValue): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.h, time.m);
}

function formatSummary(date: Date, locale: string, format: TimePickerFormat): string {
  const datePart = date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });
  return `${datePart} · ${timePart}`;
}

/**
 * No MUI equivalent as a fixed inline card — MUI X's `DateTimePicker` is a
 * masked text input with a popover (that's `OkklyDateTimeField`, which
 * embeds this). Composed from `OkklyCalendar` + `OkklyTimePicker`.
 * Deliberate gaps: only a date → use `OkklyCalendar`; only a time → use
 * `OkklyTimePicker`; no shortcut-preset sidebar (one line of caller code
 * against `value` covers it). `value` is a two-way `model()`
 * (`[(value)]`) standing in for react's `value`/`defaultValue`+`onChange`.
 * `summaryLabel`/`emptyLabel`/`confirmLabel`/`timezoneLabel` are plain
 * `string`s, not `ReactNode` — Angular has no such equivalent.
 */
@Component({
  selector: "okkly-date-time-picker",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: { class: "okkly-component okkly-date-time-picker" },
  imports: [
    OkklyButton,
    OkklyButtonEndIcon,
    OkklyCalendar,
    OkklyChip,
    OkklyChipIcon,
    OkklyIcon,
    OkklyTimePicker,
  ],
  templateUrl: "./DateTimePicker.html",
})
export class OkklyDateTimePicker {
  /**
   * Selected date & time. Two-way bindable as `[(value)]`.
   *
   * @default null
   */
  readonly value = model<Date | null>(null);
  /**
   * Earliest selectable date (inclusive).
   *
   * @default undefined
   */
  readonly min = input<Date>();
  /**
   * Latest selectable date (inclusive).
   *
   * @default undefined
   */
  readonly max = input<Date>();
  /**
   * Minute wheel step.
   *
   * @default 1
   */
  readonly timeStep = input(1);
  /**
   * Hour wheel label format — the underlying value stays 24-hour either way.
   *
   * @default "24h"
   */
  readonly format = input<TimePickerFormat>("24h");
  /**
   * First day of the week.
   *
   * @default "mon"
   */
  readonly weekStart = input<CalendarWeekStart>("mon");
  /**
   * Accent tone shared by the calendar, the time wheels, and the Confirm button's glow.
   *
   * @default "primary"
   */
  readonly color = input<DateTimePickerColor>("primary");
  /**
   * Locale for the month title, weekday labels, and the summary text.
   *
   * @default "en-US"
   */
  readonly locale = input("en-US");
  /**
   * Trailing chip next to the summary text (e.g. a timezone, "GMT+2"). Omitted when unset.
   *
   * @default undefined
   */
  readonly timezoneLabel = input<string>();
  /**
   * Label shown above the summary text.
   *
   * @default "Selected time"
   */
  readonly summaryLabel = input("Selected time");
  /**
   * Summary text shown before any date has been picked.
   *
   * @default "No date selected"
   */
  readonly emptyLabel = input("No date selected");
  /**
   * Confirm button label.
   *
   * @default "Confirm"
   */
  readonly confirmLabel = input("Confirm");
  /**
   * Accessible name for the calendar's "previous month" button.
   *
   * @default undefined
   */
  readonly previousMonthLabel = input<string>();
  /**
   * Accessible name for the calendar's "next month" button.
   *
   * @default undefined
   */
  readonly nextMonthLabel = input<string>();

  /** Fires when the Confirm button is clicked. */
  readonly confirm = output<Date>();

  protected readonly iconArrowRight = iconArrowRight;
  protected readonly iconGlobe = iconGlobe;

  // The time wheels stay interactive even before a day is picked — this
  // remembers the dialed-in hour/minute so it carries over once a day
  // finally lands, instead of the wheels resetting to 0:00 or silently
  // committing a bogus "today" value the instant a wheel moves.
  private readonly draftTime = signal<TimePickerValue>(
    this.value() ? timeOf(this.value()!) : { h: 0, m: 0 },
  );
  // Separate from `value` so browsing months while nothing is picked yet has
  // no effect on the committed value — mirrors `OkklyCalendar`'s own
  // `month`/`(monthChange)` controlled pair, just owned here instead.
  protected readonly month = signal<Date | undefined>(this.value() ?? undefined);

  protected readonly day = computed<Date | null>(() => {
    const value = this.value();
    return value ? startOfDay(value) : null;
  });
  protected readonly time = computed<TimePickerValue>(() => {
    const value = this.value();
    return value ? timeOf(value) : this.draftTime();
  });

  protected readonly summaryText = computed(() => {
    const value = this.value();
    return value ? formatSummary(value, this.locale(), this.format()) : this.emptyLabel();
  });

  // Measures the calendar's own bordered panel (not its root, a plain
  // wrapper) so the time-picker card beside it can match its height exactly.
  // `offsetHeight`, not `getBoundingClientRect()`: this often mounts inside a
  // Grow transition, whose `transform: scale()` would otherwise be measured
  // as a smaller panel. `OkklyCalendar` exposes no native-element handle of
  // its own, so `#calendarHost` wraps it — `display: contents` in the
  // template keeps that wrapper invisible to the `&__panels` flex row.
  private readonly calendarHost = viewChild<ElementRef<HTMLElement>>("calendarHost");
  private readonly panelHeight = signal<number | null>(null);
  protected readonly timePickerViewportHeight = computed(() => {
    const height = this.panelHeight();
    return height != null ? `calc(${height}px - 1.125rem)` : null;
  });

  constructor() {
    afterRenderEffect((onCleanup) => {
      const host = this.calendarHost()?.nativeElement;
      if (!host || typeof ResizeObserver === "undefined") return;
      const panel = host.querySelector<HTMLElement>(".okkly-calendar__panel") ?? host;
      const update = () => this.panelHeight.set(panel.offsetHeight);
      update();
      const observer = new ResizeObserver(update);
      observer.observe(panel);
      onCleanup(() => observer.disconnect());
    });
  }

  protected handleSelectDay(next: CalendarValue | null): void {
    if (!next || Array.isArray(next)) return;
    this.value.set(combine(next, this.time()));
  }

  protected handleTimeChange(next: TimePickerValue): void {
    this.draftTime.set(next);
    const day = this.day();
    if (day) this.value.set(combine(day, next));
  }

  protected onConfirmClick(): void {
    const value = this.value();
    if (value) this.confirm.emit(value);
  }
}
