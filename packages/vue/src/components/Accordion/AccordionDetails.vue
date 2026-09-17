<script setup lang="ts">
import Collapse from "../Collapse/Collapse.vue";
import { useAccordionContext } from "./AccordionContext";

defineSlots<{
  default?: () => unknown;
}>();

const accordion = useAccordionContext("AccordionDetails");
</script>

<template>
  <!-- `Collapse` animates both directions and unmounts the panel while
       closed, so collapsed content stays unreachable for search and
       assistive tech. `:appear="false"` keeps an already-expanded panel
       static on first paint. -->
  <Collapse :in="accordion.expanded" timeout="auto" :appear="false" unmount-on-exit>
    <div class="okkly-accordion__details" role="region">
      <slot />
    </div>
  </Collapse>
</template>
