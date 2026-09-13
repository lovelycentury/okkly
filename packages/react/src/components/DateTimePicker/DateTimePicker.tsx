"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { iconArrowRight, iconGlobe } from "@okkly/icons";
import "@okkly/design-system/components/DateTimePicker/DateTimePicker.scss";
import { Calendar, calendarToneStyle } from "../Calendar/Calendar";
import { TimePicker } from "../TimePicker/TimePicker";
import type { TimePickerFormat, TimePickerValue } from "../TimePicker/TimePicker.types";
import { Chip } from "../Chip/Chip";
import { Button } from "../Button/Button";
import type { DateTimePickerProps } from "./DateTimePicker.types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

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

const globeIcon = <span dangerouslySetInnerHTML={{ __html: iconGlobe }} />;
const arrowRightIcon = <span dangerouslySetInnerHTML={{ __html: iconArrowRight }} />;

export function DateTimePicker({
  value,
  defaultValue = null,
  min,
  max,
  timeStep = 1,
  format = "24h",
  weekStart = "mon",
  color = "primary",
  locale = "en-US",
  timezoneLabel,
  summaryLabel = "Selected time",
  emptyLabel = "No date selected",
  confirmLabel = "Confirm",
  onChange,
  onConfirm,
  previousMonthLabel,
  nextMonthLabel,
  className,
}: DateTimePickerProps) {
  const [internalValue, setInternalValue] = useState<Date | null>(
    value !== undefined ? value : defaultValue,
  );
  const currentValue = value !== undefined ? value : internalValue;

  // The time wheels stay interactive even before a day is picked — this remembers
  // the dialed-in hour/minute so it carries over once a day finally lands, instead
  // of the wheels resetting to 0:00 or silently committing a bogus "today" value.
  const [draftTime, setDraftTime] = useState<TimePickerValue>(() =>
    currentValue ? timeOf(currentValue) : { h: 0, m: 0 },
  );
  const [month, setMonth] = useState<Date>(() => currentValue ?? new Date());

  const day = currentValue ? startOfDay(currentValue) : null;
  const time = currentValue ? timeOf(currentValue) : draftTime;

  // Measure the calendar *panel* rather than its root: the root is a plain
  // wrapper, and the bordered card inside it is what the time wheels line up to.
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = calendarRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const panel = root.querySelector<HTMLElement>(".okkly-calendar__panel") ?? root;
    // `offsetHeight`, not `getBoundingClientRect()`: inside a field's popover
    // this mounts during a Grow transition, and a rect measured mid-`scale()`
    // reports a fraction of the real height — which then stuck, because
    // ResizeObserver never fires for a transform.
    const update = () => setCalendarHeight(panel.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const timePickerStyle: CSSProperties | undefined =
    calendarHeight != null
      ? ({
          "--okkly-time-picker-viewport-height": `calc(${calendarHeight}px - 1.125rem)`,
        } as CSSProperties)
      : undefined;

  const commit = (next: Date) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const handleSelectDay = (date: Date) => commit(combine(date, time));

  const handleTimeChange = (next: TimePickerValue) => {
    setDraftTime(next);
    if (day) commit(combine(day, next));
  };

  const handleConfirm = () => {
    if (currentValue) onConfirm?.(currentValue);
  };

  const classes = ["okkly-component", "okkly-date-time-picker", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="okkly-date-time-picker__panels">
        <Calendar
          ref={calendarRef}
          style={calendarToneStyle(color)}
          month={month}
          onMonthChange={setMonth}
          value={day}
          onSelect={handleSelectDay}
          min={min}
          max={max}
          weekStart={weekStart}
          locale={locale}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
        />
        <TimePicker
          value={time}
          onChange={handleTimeChange}
          step={timeStep}
          format={format}
          color={color}
          style={timePickerStyle}
        />
      </div>
      <div className="okkly-date-time-picker__footer">
        <div className="okkly-date-time-picker__summary">
          <p className="okkly-date-time-picker__summary-label">{summaryLabel}</p>
          <div className="okkly-date-time-picker__summary-value">
            <span
              className={[
                "okkly-date-time-picker__summary-text",
                !currentValue && "okkly-date-time-picker__summary-text--empty",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {currentValue ? formatSummary(currentValue, locale, format) : emptyLabel}
            </span>
            {timezoneLabel && <Chip size="small" icon={globeIcon} label={timezoneLabel} />}
          </div>
        </div>
        <Button
          variant="gradient"
          shape="rounded"
          color={color}
          disabled={!currentValue}
          endIcon={arrowRightIcon}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
