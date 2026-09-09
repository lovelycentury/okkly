<script lang="ts">
import type { UseRippleReturn } from "../../composables/useRipple";

export interface RippleProps {
  /** Ripples currently painted, keyed by id. */
  ripples: UseRippleReturn["ripples"]["value"];
  /** Called with a ripple's id once its animation finishes. */
  onRippleEnd: UseRippleReturn["hideRipple"];
}
</script>

<script setup lang="ts">
import "@okkly/design-system/components/Ripple/Ripple.scss";

defineProps<RippleProps>();
</script>

<!-- Presentational overlay for `useRipple` — the trigger element owns `position: relative; overflow: hidden`. -->
<template>
  <span class="okkly-component okkly-ripple" aria-hidden="true">
    <span
      v-for="[id, ripple] in ripples"
      :key="id"
      class="okkly-ripple__element"
      :data-rippleid="id"
      :style="{ '--okkly-ripple-left': ripple.left, '--okkly-ripple-top': ripple.top }"
      @animationend="onRippleEnd(($event.currentTarget as HTMLElement).dataset.rippleid)"
    />
  </span>
</template>
