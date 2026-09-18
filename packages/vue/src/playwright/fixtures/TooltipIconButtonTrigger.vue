<script setup lang="ts">
import IconButton from "../../components/IconButton/IconButton.vue";
import Tooltip from "../../components/Tooltip/Tooltip.vue";

// Inlined rather than imported from `../screenshots`: a fixture runs in the
// browser bundle, and that module pulls in the Node-side test runner.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`;

withDefaults(
  defineProps<{
    title: string;
    describeChild?: boolean;
    ariaLabel?: string;
  }>(),
  { describeChild: false, ariaLabel: undefined },
);
</script>

<template>
  <Tooltip :title="title" :describe-child="describeChild">
    <IconButton :aria-label="ariaLabel"><span v-html="icon" /></IconButton>
  </Tooltip>
</template>
