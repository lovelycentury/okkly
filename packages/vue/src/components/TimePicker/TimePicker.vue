<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/TimePicker/TimePicker.scss";
import WheelColumn from "./WheelColumn.vue";
import type { TimePickerProps, TimePickerValue } from "./TimePicker.types";

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MERIDIEM_VALUES = [0, 1];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function minuteValues(step: number): number[] {
  const s = Math.min(59, Math.max(1, Math.round(step)));
  const values: number[] = [];
  for (let m = 0; m < 60; m += s) values.push(m);
  return values;
}

function nearestValue(target: number, values: number[]): number {
  return values.reduce(
    (best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best),
    values[0],
  );
}

function hour12From(h: number): number {
  const twelveHour = h % 12;
  return twelveHour === 0 ? 12 : twelveHour;
}

function meridiemFrom(h: number): number {
  return h < 12 ? 0 : 1;
}

function combineHour12(hour12: number, meridiem: number): number {
  const base = hour12 === 12 ? 0 : hour12;
  return meridiem === 1 ? base + 12 : base;
}

function formatMeridiem(v: number): string {
  return v === 0 ? "AM" : "PM";
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  defaultValue: () => ({ h: 0, m: 0 }),
  step: 1,
  format: "24h",
  color: "primary",
  hoursAriaLabel: "Hours",
  minutesAriaLabel: "Minutes",
  meridiemAriaLabel: "AM/PM",
});

const model = defineModel<TimePickerValue>();

const minuteVals = computed(() => minuteValues(props.step));

function clamp(v: TimePickerValue): TimePickerValue {
  return {
    h: ((v.h % 24) + 24) % 24,
    m: nearestValue(((v.m % 60) + 60) % 60, minuteVals.value),
  };
}

const currentValue = computed(() => clamp(model.value ?? props.defaultValue));

function commit(next: TimePickerValue) {
  model.value = next;
}

const isTwelveHour = computed(() => props.format === "12h");
const hourValues = computed(() => (isTwelveHour.value ? HOURS_12 : HOURS_24));
const hourValue = computed(() =>
  isTwelveHour.value ? hour12From(currentValue.value.h) : currentValue.value.h,
);
const meridiemValue = computed(() => meridiemFrom(currentValue.value.h));

function handleHourChange(h: number) {
  commit({
    h: isTwelveHour.value ? combineHour12(h, meridiemFrom(currentValue.value.h)) : h,
    m: currentValue.value.m,
  });
}

function handleMinuteChange(m: number) {
  commit({ h: currentValue.value.h, m });
}

function handleMeridiemChange(meridiem: number) {
  commit({ h: combineHour12(hour12From(currentValue.value.h), meridiem), m: currentValue.value.m });
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-time-picker",
    props.color !== "primary" && `okkly-time-picker--color-${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes">
    <WheelColumn
      :values="hourValues"
      :value="hourValue"
      :format-value="pad2"
      :label="hoursAriaLabel"
      @value-change="handleHourChange"
    />
    <WheelColumn
      :values="minuteVals"
      :value="currentValue.m"
      :format-value="pad2"
      :label="minutesAriaLabel"
      @value-change="handleMinuteChange"
    />
    <WheelColumn
      v-if="isTwelveHour"
      :values="MERIDIEM_VALUES"
      :value="meridiemValue"
      :format-value="formatMeridiem"
      :label="meridiemAriaLabel"
      @value-change="handleMeridiemChange"
    />
  </div>
</template>
