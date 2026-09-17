<!--
  Test fixture for SegmentedToggle: binds `:model-value`/`@update:model-value`
  together on the same tag in a real template, the way a genuine consumer
  would. Playwright's root `mount()` wires props/listeners onto the component
  under test differently from a real Vue template — `defineModel`'s
  controlled-detection (both the prop key and its `onUpdate:x` listener have
  to be present on the very same vnode) doesn't reliably see that pairing
  when SegmentedToggle is mounted directly, so a "controlled but never fed
  back" case (a fixed prop plus a listener that only records what it's told,
  same as `@okkly/react`'s own test for this) needs SegmentedToggle mounted
  one level down from Playwright's own root instead — same class of harness
  limitation as CalendarFixture/TimePickerFixture.
-->
<script setup lang="ts">
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle.vue";
import type { SegmentedToggleProps } from "../../components/SegmentedToggle/SegmentedToggle.types";

withDefaults(defineProps<SegmentedToggleProps & { modelValue?: string | string[] }>(), {
  defaultValue: undefined,
  exclusive: true,
  color: "primary",
  disabled: false,
  modelValue: undefined,
});

const emit = defineEmits<{
  change: [value: string | string[]];
}>();
</script>

<template>
  <SegmentedToggle
    :model-value="modelValue"
    :items="items"
    :default-value="defaultValue"
    :exclusive="exclusive"
    :color="color"
    :disabled="disabled"
    @update:model-value="emit('change', $event!)"
  />
</template>
