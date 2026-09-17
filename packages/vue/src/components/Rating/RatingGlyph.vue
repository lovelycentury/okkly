<!--
  Internal sub-part of Rating — not exported from the package. Renders one
  star/heart glyph for a given fill `kind`, in either the built-in
  star/heart shape or — when the parent's `icon` slot is filled — whatever
  the caller passed through the default slot here. Keeping the path data
  defined once, reused via `:d`, is what avoids repeating it per kind/glyph
  combination.
-->
<script setup lang="ts">
import { computed } from "vue";
import type { RatingIcon } from "./Rating.types";

const STAR_PATH =
  "M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z";
const HEART_PATH =
  "M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z";

const props = defineProps<{
  kind: "full" | "half" | "empty";
  glyph: RatingIcon;
}>();

defineSlots<{
  /** Custom filled glyph, overriding the built-in star/heart shape. */
  default?: () => unknown;
}>();

const pathData = computed(() => (props.glyph === "heart" ? HEART_PATH : STAR_PATH));
</script>

<template>
  <span
    :class="[
      'okkly-rating__icon',
      kind === 'full' && 'okkly-rating__icon--full',
      kind === 'half' && 'okkly-rating__icon--half',
    ]"
    aria-hidden="true"
  >
    <slot v-if="$slots.default" />
    <svg v-else-if="kind === 'full'" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path :d="pathData" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    >
      <path :d="pathData" />
    </svg>

    <span v-if="kind === 'half'" class="okkly-rating__icon-fill">
      <slot v-if="$slots.default" />
      <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path :d="pathData" />
      </svg>
    </span>
  </span>
</template>
