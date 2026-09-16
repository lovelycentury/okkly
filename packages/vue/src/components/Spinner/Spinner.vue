<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Spinner/Spinner.scss";
import type { SpinnerProps } from "./Spinner.types";

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: "medium",
  color: "primary",
  thickness: undefined,
});

const SIZE_RADIUS: Record<string, number> = { small: 10, medium: 14, large: 20 };

const radius = computed(() => SIZE_RADIUS[props.size]);
const stroke = computed(
  () => props.thickness ?? (props.size === "small" ? 2.5 : props.size === "large" ? 4 : 3),
);
const normalizedRadius = computed(() => radius.value - stroke.value / 2);
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI);
const dashOffset = computed(() => circumference.value * 0.75);
const viewBox = computed(() => `0 0 ${radius.value * 2} ${radius.value * 2}`);
const dashArray = computed(() => `${circumference.value * 0.25} ${circumference.value}`);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-spinner",
    props.size !== "medium" && `okkly-spinner--${props.size}`,
    props.color !== "primary" && `okkly-spinner--${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <span role="status" aria-label="Loading" :class="classes">
    <svg class="okkly-spinner__svg" :viewBox="viewBox">
      <circle
        class="okkly-spinner__track"
        :cx="radius"
        :cy="radius"
        :r="normalizedRadius"
        fill="none"
        :stroke-width="stroke"
      />
      <circle
        class="okkly-spinner__arc"
        :cx="radius"
        :cy="radius"
        :r="normalizedRadius"
        fill="none"
        :stroke-width="stroke"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
  </span>
</template>
