<!--
  Test fixture for DateTimePicker: binds `:model-value`/`@update:model-value`
  together on the same tag in a real template, the way a genuine consumer
  would. Playwright's root `mount()` wires props/listeners onto the component
  under test differently from a real Vue template — `defineModel`'s
  controlled-detection (both the prop key and its `onUpdate:x` listener have
  to be present on the very same vnode) doesn't reliably see that pairing
  when DateTimePicker is mounted directly, so a "controlled but never fed
  back" case (a fixed prop plus a listener that only records what it's told,
  same as `@okkly/react`'s own test for this) needs DateTimePicker mounted
  one level down from Playwright's own root instead — same class of harness
  limitation as CalendarFixture/TimePickerFixture.
-->
<script setup lang="ts">
import type { DateTimePickerProps } from "../../components/DateTimePicker/DateTimePicker.types";
import DateTimePicker from "../../components/DateTimePicker/DateTimePicker.vue";

const props = withDefaults(defineProps<DateTimePickerProps & { modelValue?: Date | null }>(), {
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
  modelValue: undefined,
});

const emit = defineEmits<{
  change: [value: Date];
}>();
</script>

<template>
  <DateTimePicker
    :model-value="modelValue"
    :min="min"
    :max="max"
    :default-value="defaultValue"
    :time-step="timeStep"
    :format="format"
    :week-start="weekStart"
    :color="color"
    :locale="locale"
    :previous-month-label="previousMonthLabel"
    :next-month-label="nextMonthLabel"
    @update:model-value="emit('change', $event!)"
  />
</template>
