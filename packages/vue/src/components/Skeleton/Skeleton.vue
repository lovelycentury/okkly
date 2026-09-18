<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Skeleton/Skeleton.scss";
import type { SkeletonProps } from "./Skeleton.types";

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: "text",
  animation: "pulse",
});

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value / 16}rem` : value;
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-skeleton",
    props.variant !== "text" && `okkly-skeleton--${props.variant}`,
    props.animation === "pulse" && "okkly-skeleton--pulse",
    props.animation === "wave" && "okkly-skeleton--wave",
  ]
    .filter(Boolean)
    .join(" "),
);

const cssVars = computed(() => ({
  ...(props.width !== undefined && { "--okkly-skeleton-width": toCssLength(props.width) }),
  ...(props.height !== undefined && { "--okkly-skeleton-height": toCssLength(props.height) }),
}));
</script>

<template>
  <span aria-hidden="true" :class="classes" :style="cssVars" />
</template>
