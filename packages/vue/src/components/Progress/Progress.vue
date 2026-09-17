<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Progress/Progress.scss";
import type { ProgressProps } from "./Progress.types";

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  variant: "determinate",
  type: "linear",
  color: "primary",
  size: "medium",
  showLabel: false,
});

const isIndeterminate = computed(() => props.variant === "indeterminate");
const clamped = computed(() => Math.min(100, Math.max(0, props.value)));

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-progress",
    `okkly-progress--${props.type}`,
    isIndeterminate.value && "okkly-progress--indeterminate",
    props.size !== "medium" && `okkly-progress--${props.size}`,
    props.color !== "primary" && `okkly-progress--${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);

const diameter = computed(() => (props.size === "small" ? 40 : props.size === "large" ? 72 : 56));
const stroke = computed(() => (props.size === "small" ? 4 : props.size === "large" ? 6 : 5));
const radius = computed(() => diameter.value / 2 - stroke.value / 2);
const circumference = computed(() => radius.value * 2 * Math.PI);
const offset = computed(() =>
  isIndeterminate.value
    ? circumference.value * 0.75
    : circumference.value - (clamped.value / 100) * circumference.value,
);
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="isIndeterminate ? undefined : clamped"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :class="classes"
  >
    <div v-if="type === 'circular'" class="okkly-progress__circular">
      <svg class="okkly-progress__svg" :viewBox="`0 0 ${diameter} ${diameter}`">
        <circle
          class="okkly-progress__circle-track"
          :cx="diameter / 2"
          :cy="diameter / 2"
          :r="radius"
          fill="none"
          :stroke-width="stroke"
        />
        <circle
          class="okkly-progress__circle-bar"
          :cx="diameter / 2"
          :cy="diameter / 2"
          :r="radius"
          fill="none"
          :stroke-width="stroke"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
        />
      </svg>
      <span v-if="showLabel && !isIndeterminate" class="okkly-progress__label"
        >{{ Math.round(clamped) }}%</span
      >
    </div>
    <div v-else class="okkly-progress__track">
      <div v-if="!isIndeterminate" class="okkly-progress__bar" :style="{ width: `${clamped}%` }" />
      <div v-else class="okkly-progress__bar" />
    </div>
  </div>
</template>
