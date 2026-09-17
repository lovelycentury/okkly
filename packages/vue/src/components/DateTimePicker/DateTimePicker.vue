<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { iconArrowRight, iconGlobe } from "@okkly/icons";
import "@okkly/design-system/components/DateTimePicker/DateTimePicker.scss";
import Calendar, { calendarToneStyle } from "../Calendar/Calendar.vue";
import type { CalendarValue } from "../Calendar/Calendar.types";
import TimePicker from "../TimePicker/TimePicker.vue";
import type { TimePickerFormat, TimePickerValue } from "../TimePicker/TimePicker.types";
import Chip from "../Chip/Chip.vue";
import Button from "../Button/Button.vue";
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

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  min: undefined,
  max: undefined,
  defaultValue: null,
  timeStep: 1,
  format: "24h",
  weekStart: "mon",
  color: "primary",
  locale: "en-US",
  previousMonthLabel: undefined,
  nextMonthLabel: undefined,
});

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** Trailing chip next to the summary text (e.g. a timezone, "GMT+2"). Omitted when not filled. */
  "timezone-label"?: () => unknown;
  /** Label shown above the summary text. */
  "summary-label"?: () => unknown;
  /** Summary text shown before any date has been picked. */
  "empty-label"?: () => unknown;
  /** Confirm button label. */
  "confirm-label"?: () => unknown;
}>();

const emit = defineEmits<{
  confirm: [value: Date];
}>();

// Unlike React's manual `value !== undefined ? value : internalValue` split,
// `model.value` already resolves controlled vs. uncontrolled — `undefined`
// means genuinely unbound, so it's the only case that falls back to
// `defaultValue`. Comparing against it with `!==`, not `??`, matters because
// a controlled `null` (deliberately "no date") must not be mistaken for "unset".
const model = defineModel<Date | null>();
const currentValue = computed<Date | null>(() =>
  model.value !== undefined ? model.value : (props.defaultValue ?? null),
);

// The time wheels stay interactive even before a day is picked — this remembers
// the dialed-in hour/minute so it carries over once a day finally lands, instead
// of the wheels resetting to 0:00 or silently committing a bogus "today" value.
const draftTime = ref<TimePickerValue>(
  currentValue.value ? timeOf(currentValue.value) : { h: 0, m: 0 },
);
const month = ref<Date>(currentValue.value ?? new Date());

const day = computed(() => (currentValue.value ? startOfDay(currentValue.value) : null));
const time = computed(() => (currentValue.value ? timeOf(currentValue.value) : draftTime.value));

// Measures the calendar *panel* rather than its root: the root is a plain
// wrapper, and the bordered card inside it is what the time wheels line up to.
const calendarRef = useTemplateRef<InstanceType<typeof Calendar>>("calendarRef");
const calendarHeight = ref<number | null>(null);

onMounted(() => {
  const root = calendarRef.value?.$el as HTMLElement | undefined;
  if (!root || typeof ResizeObserver === "undefined") return;
  const panel = root.querySelector<HTMLElement>(".okkly-calendar__panel") ?? root;
  // `offsetHeight`, not `getBoundingClientRect()`: inside a field's popover
  // this mounts during a Grow transition, and a rect measured mid-`scale()`
  // reports a fraction of the real height — which then stuck, because
  // ResizeObserver never fires for a transform.
  const update = () => {
    calendarHeight.value = panel.offsetHeight;
  };
  update();
  const observer = new ResizeObserver(update);
  observer.observe(panel);
  onUnmounted(() => observer.disconnect());
});

const timePickerStyle = computed(() =>
  calendarHeight.value != null
    ? { "--okkly-time-picker-viewport-height": `calc(${calendarHeight.value}px - 1.125rem)` }
    : undefined,
);

function commit(next: Date) {
  model.value = next;
}

function handleSelectDay(date: Date) {
  commit(combine(date, time.value));
}

// `mode="single"` is never overridden, so `value` is always `Date | null`.
function handleCalendarChange(value: CalendarValue | null) {
  if (value instanceof Date) handleSelectDay(value);
}

function handleTimeChange(next: TimePickerValue | undefined) {
  if (!next) return;
  draftTime.value = next;
  if (day.value) commit(combine(day.value, next));
}

function handleConfirm() {
  if (currentValue.value) emit("confirm", currentValue.value);
}

const classes = "okkly-component okkly-date-time-picker";
const toneStyle = computed(() => calendarToneStyle(props.color));

const formattedSummary = computed(() =>
  currentValue.value ? formatSummary(currentValue.value, props.locale, props.format) : "",
);
const summaryTextClasses = computed(() =>
  [
    "okkly-date-time-picker__summary-text",
    !currentValue.value && "okkly-date-time-picker__summary-text--empty",
  ]
    .filter(Boolean)
    .join(" "),
);
const showTimezoneChip = computed(() => !!slots["timezone-label"]);
</script>

<template>
  <div :class="classes">
    <div class="okkly-date-time-picker__panels">
      <Calendar
        ref="calendarRef"
        :style="toneStyle"
        v-model:month="month"
        :model-value="day"
        :min="min"
        :max="max"
        :week-start="weekStart"
        :locale="locale"
        :previous-month-label="previousMonthLabel"
        :next-month-label="nextMonthLabel"
        @update:model-value="handleCalendarChange"
      />
      <TimePicker
        :model-value="time"
        :step="timeStep"
        :format="format"
        :color="color"
        :style="timePickerStyle"
        @update:model-value="handleTimeChange"
      />
    </div>
    <div class="okkly-date-time-picker__footer">
      <div class="okkly-date-time-picker__summary">
        <p class="okkly-date-time-picker__summary-label">
          <slot name="summary-label">Selected time</slot>
        </p>
        <div class="okkly-date-time-picker__summary-value">
          <span :class="summaryTextClasses">
            <template v-if="currentValue">{{ formattedSummary }}</template>
            <slot v-else name="empty-label">No date selected</slot>
          </span>
          <Chip v-if="showTimezoneChip" size="small">
            <template #icon>
              <span aria-hidden="true" v-html="iconGlobe" />
            </template>
            <slot name="timezone-label" />
          </Chip>
        </div>
      </div>
      <Button
        variant="gradient"
        shape="rounded"
        :color="color"
        :disabled="!currentValue"
        @click="handleConfirm"
      >
        <template #end-icon>
          <span aria-hidden="true" v-html="iconArrowRight" />
        </template>
        <slot name="confirm-label">Confirm</slot>
      </Button>
    </div>
  </div>
</template>
