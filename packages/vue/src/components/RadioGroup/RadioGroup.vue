<script setup lang="ts">
import { computed, provide, reactive, useId } from "vue";
import "@okkly/design-system/components/RadioGroup/RadioGroup.scss";
import { RadioGroupContextKey } from "./RadioGroupContext";
import type { RadioGroupProps } from "./RadioGroup.types";

const props = withDefaults(defineProps<RadioGroupProps>(), {
  name: undefined,
  defaultValue: undefined,
  disabled: false,
  size: "medium",
  color: "primary",
});

const slots = defineSlots<{
  /** Nested `<Radio value="..." />` elements. */
  default?: () => unknown;
  /** Optional group label, rendered above the options. */
  label?: () => unknown;
}>();

const model = defineModel<string>();
// Seeds the uncontrolled case once on mount, same as React's `defaultValue`.
// A parent that binds `v-model` already has `model.value` set by then, so
// this is a no-op for the controlled case.
if (model.value === undefined && props.defaultValue !== undefined) {
  model.value = props.defaultValue;
}

const generatedName = useId();

function handleSelect(next: string) {
  model.value = next;
}

provide(
  RadioGroupContextKey,
  reactive({
    name: computed(() => props.name ?? generatedName),
    value: computed(() => model.value),
    onSelect: handleSelect,
    disabled: computed(() => props.disabled),
    size: computed(() => props.size),
    color: computed(() => props.color),
  }),
);
</script>

<template>
  <div class="okkly-component okkly-radio-group" role="radiogroup">
    <span v-if="slots.label" class="okkly-radio-group__label"><slot name="label" /></span>
    <slot />
  </div>
</template>
