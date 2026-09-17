<script lang="ts">
import type { OnlyBreakpoint } from "./Only.types";

// Mirrors $breakpoints in packages/design-system/src/styles/breakpoints.scss —
// keep the two in sync when a breakpoint value changes.
const BREAKPOINT_PX: Record<OnlyBreakpoint, number> = {
  "2xs": 320,
  xs: 577,
  sm: 769,
  md: 993,
  lg: 1441,
  xl: 1921,
};

function buildQuery(from: OnlyBreakpoint | undefined, to: OnlyBreakpoint | undefined): string {
  const conditions: string[] = [];
  if (from) conditions.push(`(min-width: ${BREAKPOINT_PX[from]}px)`);
  if (to) conditions.push(`(max-width: ${BREAKPOINT_PX[to] - 1}px)`);
  return conditions.length > 0 ? conditions.join(" and ") : "all";
}
</script>

<script setup lang="ts">
import { useMediaQuery } from "@okkly/vue-composables";
import type { OnlyProps } from "./Only.types";

const props = defineProps<OnlyProps>();

defineSlots<{
  /** Rendered only while the viewport is within `[from, to)`. */
  default?: () => unknown;
}>();

const matches = useMediaQuery(() => buildQuery(props.from, props.to));
</script>

<template>
  <slot v-if="matches" />
</template>
