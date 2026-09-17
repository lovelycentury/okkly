<!--
  Test fixture for Select's `#value` slot, which replaces the trigger's text
  content only — mirrors the React fixture of the same name (there, `renderValue`).
-->
<script setup lang="ts">
import Select from "../../components/Select/Select.vue";
import type { SelectOption } from "../../components/Select/Select.types";

withDefaults(
  defineProps<{
    options: SelectOption[];
    multiple?: boolean;
    defaultValue?: string | string[] | null;
  }>(),
  { multiple: false, defaultValue: undefined },
);
</script>

<template>
  <Select :options="options" :multiple="multiple" :default-value="defaultValue">
    <template #label>Team</template>
    <template #value="{ selected }">
      <b>{{ selected.map((option) => option.label).join(" / ") }}</b>
    </template>
  </Select>
</template>
