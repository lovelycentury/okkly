<script setup lang="ts">
import { computed } from "vue";
import { iconCheck } from "@okkly/icons";
import { optionElement, useOptionBlock } from "./optionBlock";
import type { OptionCheckProps } from "./Option.types";

const props = withDefaults(defineProps<OptionCheckProps>(), {
  checked: true,
});

const block = useOptionBlock();
const classes = computed(() => optionElement(block, "option-check"));
</script>

<template>
  <span v-if="checked" :class="classes" aria-hidden="true" v-html="iconCheck" />
</template>
