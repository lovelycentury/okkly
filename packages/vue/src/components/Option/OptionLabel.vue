<script setup lang="ts">
import { computed } from "vue";
import { optionElement, useOptionBlock } from "./optionBlock";

defineSlots<{
  default?: () => unknown;
}>();

const block = useOptionBlock();
const classes = computed(() => optionElement(block, "option-label"));
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
