<!--
  Test fixture for TimePicker: binds `:model-value`/`@update:model-value`
  together on the same tag in a real template, the way a genuine consumer
  would. Playwright's root `mount()` wires props/listeners onto the component
  under test differently from a real Vue template — `defineModel`'s
  controlled-detection (both the prop key and its `onUpdate:x` listener have
  to be present on the very same vnode) doesn't reliably see that pairing
  when TimePicker is mounted directly, so a "controlled but never fed back"
  case (a fixed prop plus a listener that only records what it's told, same
  as `@okkly/react`'s own test for this) needs TimePicker mounted one level
  down from Playwright's own root instead — same class of harness limitation
  as CalendarFixture.
-->
<script setup lang="ts">
import type {
  TimePickerProps,
  TimePickerValue,
} from "../../components/TimePicker/TimePicker.types";
import TimePicker from "../../components/TimePicker/TimePicker.vue";

const props = withDefaults(defineProps<TimePickerProps & { modelValue?: TimePickerValue }>(), {
  defaultValue: () => ({ h: 0, m: 0 }),
  step: 1,
  format: "24h",
  color: "primary",
  hoursAriaLabel: "Hours",
  minutesAriaLabel: "Minutes",
  meridiemAriaLabel: "AM/PM",
  modelValue: undefined,
});

const emit = defineEmits<{
  change: [value: TimePickerValue];
}>();
</script>

<template>
  <TimePicker
    :model-value="modelValue"
    :default-value="defaultValue"
    :step="step"
    :format="format"
    :color="color"
    :hours-aria-label="hoursAriaLabel"
    :minutes-aria-label="minutesAriaLabel"
    :meridiem-aria-label="meridiemAriaLabel"
    @update:model-value="emit('change', $event!)"
  />
</template>
