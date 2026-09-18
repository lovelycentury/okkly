<script setup lang="ts">
import { computed } from "vue";
import { optionElement, useOptionBlock } from "./optionBlock";
import type { HighlightMatchProps } from "./Option.types";

const props = withDefaults(defineProps<HighlightMatchProps>(), {
  query: undefined,
});

const block = useOptionBlock();
const markClasses = computed(() => optionElement(block, "option-mark"));

/**
 * Emphasises the first case-insensitive occurrence of `query` inside `text`.
 * Only the first: a second run would compete with the row's own highlight
 * state for the reader's eye.
 */
const parts = computed(() => {
  const needle = props.query?.trim() ?? "";
  const at = needle ? props.text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (at === -1) return { before: props.text, match: "", after: "" };
  return {
    before: props.text.slice(0, at),
    match: props.text.slice(at, at + needle.length),
    after: props.text.slice(at + needle.length),
  };
});
</script>

<template>
  <template v-if="parts.match"
    >{{ parts.before }}<mark :class="markClasses">{{ parts.match }}</mark
    >{{ parts.after }}</template
  >
  <template v-else>{{ parts.before }}</template>
</template>
