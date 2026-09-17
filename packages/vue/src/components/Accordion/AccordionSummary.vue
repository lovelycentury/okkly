<script setup lang="ts">
import { iconChevronDown } from "@okkly/icons";
import { useAccordionContext } from "./AccordionContext";

defineSlots<{
  /** Summary title/content. */
  default?: () => unknown;
  /** Custom expand icon; leave empty for the default chevron. */
  "expand-icon"?: () => unknown;
}>();

// Kept as a single object, not destructured: `reactive()` on the provider
// side auto-unwraps its computed refs on property access, but destructuring
// here would copy out today's plain values with no live binding thereafter.
const accordion = useAccordionContext("AccordionSummary");
</script>

<template>
  <button
    type="button"
    class="okkly-accordion__summary"
    :aria-expanded="accordion.expanded"
    :disabled="accordion.disabled"
    @click="accordion.toggle"
  >
    <span class="okkly-accordion__title"><slot /></span>
    <span
      :class="[
        'okkly-accordion__chevron',
        accordion.expanded && 'okkly-accordion__chevron--expanded',
      ]"
      aria-hidden="true"
    >
      <slot name="expand-icon"><span v-html="iconChevronDown" /></slot>
    </span>
  </button>
</template>
