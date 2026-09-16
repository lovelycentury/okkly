<script setup lang="ts">
import { provideOptionBlock } from "./optionBlock";
import type { OptionScopeProps } from "./Option.types";

const props = defineProps<OptionScopeProps>();

defineSlots<{
  default?: () => unknown;
}>();

provideOptionBlock(props.block);
</script>

<template><slot /></template>
