<script lang="ts">
function normalizeDefault(exclusive: boolean, defaultValue?: string | string[]): string | string[] {
  if (defaultValue !== undefined) return defaultValue;
  return exclusive ? "" : [];
}

function isSegmentActive(
  current: string | string[],
  segmentValue: string,
  exclusive: boolean,
): boolean {
  if (exclusive) return current === segmentValue;
  return Array.isArray(current) && current.includes(segmentValue);
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/SegmentedToggle/SegmentedToggle.scss";
import type { SegmentedToggleProps } from "./SegmentedToggle.types";

const props = withDefaults(defineProps<SegmentedToggleProps>(), {
  defaultValue: undefined,
  exclusive: true,
  color: "primary",
  disabled: false,
});

// Unlike React's manual `value !== undefined ? value : internalValue` split,
// `model.value` already resolves controlled vs. uncontrolled — `undefined`
// means genuinely unbound, so it's the only case that falls back to
// `defaultValue` (or its own `exclusive`-shaped empty default).
const model = defineModel<string | string[]>();
const resolvedValue = computed<string | string[]>(() =>
  model.value !== undefined ? model.value : normalizeDefault(props.exclusive, props.defaultValue),
);

function handleSegmentClick(segmentValue: string) {
  if (props.exclusive) {
    model.value = segmentValue;
    return;
  }

  const current = resolvedValue.value;
  const selected = Array.isArray(current) ? [...current] : [];
  const index = selected.indexOf(segmentValue);
  if (index >= 0) selected.splice(index, 1);
  else selected.push(segmentValue);
  model.value = selected;
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-segmented-toggle",
    props.color !== "primary" && `okkly-segmented-toggle--color-${props.color}`,
    props.disabled && "okkly-segmented-toggle--disabled",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes" role="group">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :class="[
        'okkly-segmented-toggle__segment',
        isSegmentActive(resolvedValue, item.value, exclusive) &&
          'okkly-segmented-toggle__segment--active',
      ]"
      :disabled="disabled || item.disabled"
      :aria-pressed="isSegmentActive(resolvedValue, item.value, exclusive)"
      @click="handleSegmentClick(item.value)"
    >
      <span
        v-if="item.icon"
        class="okkly-segmented-toggle__icon"
        aria-hidden="true"
        v-html="item.icon"
      />
      {{ item.label }}
    </button>
  </div>
</template>
