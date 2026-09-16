<!--
  Test fixture for Calendar: binds `:month`/`@update:month` and
  `:model-value`/`@update:model-value` together on the same tag in a real
  template, the way a genuine consumer would. Playwright's root `mount()`
  wires props/listeners onto the component under test differently from a
  real Vue template — `defineModel`'s controlled-detection (both the prop key
  and its `onUpdate:x` listener have to be present on the very same vnode)
  doesn't reliably see that pairing when Calendar is mounted directly, so a
  "controlled but never fed back" case (a fixed prop plus a listener that
  only records what it's told, same as `@okkly/react`'s own test for this)
  needs Calendar mounted one level down from Playwright's own root instead.
-->
<script setup lang="ts">
import type { CalendarProps, CalendarValue } from "../../components/Calendar/Calendar.types";
import Calendar from "../../components/Calendar/Calendar.vue";

withDefaults(
  defineProps<
    CalendarProps & {
      month?: Date;
      modelValue?: CalendarValue | null;
    }
  >(),
  {
    mode: "single",
    month: undefined,
    modelValue: null,
    min: undefined,
    max: undefined,
    weekStart: "mon",
    locale: "en-US",
    previousMonthLabel: "Previous month",
    nextMonthLabel: "Next month",
    color: "primary",
  },
);

const emit = defineEmits<{
  "month-change": [value: Date | undefined];
  select: [value: CalendarValue | null];
}>();
</script>

<template>
  <Calendar
    :mode="mode"
    :model-value="modelValue"
    :month="month"
    :min="min"
    :max="max"
    :week-start="weekStart"
    :locale="locale"
    :previous-month-label="previousMonthLabel"
    :next-month-label="nextMonthLabel"
    :color="color"
    @update:month="emit('month-change', $event)"
    @update:model-value="emit('select', $event)"
  />
</template>
