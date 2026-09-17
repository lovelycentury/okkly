<!--
  Test fixture for Select's `#trigger` slot, which rebuilds the whole trigger
  — mirrors the React fixture of the same name (there, `renderInput`).
-->
<script setup lang="ts">
import Select from "../../components/Select/Select.vue";
import type { SelectOption } from "../../components/Select/Select.types";

withDefaults(
  defineProps<{
    options: SelectOption[];
    defaultValue?: string | string[] | null;
    /**
     * `"badge"` builds the whole trigger by hand; `"wrapper"` keeps the
     * default trigger content and only relocates the adornments.
     */
    variant?: "badge" | "wrapper";
  }>(),
  { defaultValue: undefined, variant: "badge" },
);
</script>

<template>
  <Select :options="options" :default-value="defaultValue">
    <template #label>Team</template>
    <template
      v-if="variant === 'badge'"
      #trigger="{ triggerAttrs, triggerEvents, triggerRef, selected, endAdornment }"
    >
      <div :ref="triggerRef" v-bind="triggerAttrs" v-on="triggerEvents">
        <span data-testid="badge">{{ selected[0]?.label.charAt(0) }}</span>
        <span>{{ selected[0]?.label ?? "Pick a team" }}</span>
        <component :is="endAdornment" />
      </div>
    </template>
    <template v-else #trigger="{ triggerAttrs, triggerEvents, triggerRef, value, endAdornment }">
      <div data-testid="trigger-wrapper">
        <div :ref="triggerRef" v-bind="triggerAttrs" v-on="triggerEvents">
          <component :is="value" />
        </div>
        <component :is="endAdornment" />
      </div>
    </template>
  </Select>
</template>
