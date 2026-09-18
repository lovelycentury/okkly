<script setup lang="ts">
import { computed, provide, reactive, useId } from "vue";
import "@okkly/design-system/components/CheckboxGroup/CheckboxGroup.scss";
import { CheckboxGroupContextKey } from "./CheckboxGroupContext";
import type { CheckboxGroupProps } from "./CheckboxGroup.types";

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  name: undefined,
  defaultValue: undefined,
  disabled: false,
  size: "medium",
  color: "primary",
});

const slots = defineSlots<{
  /** Nested `<Checkbox value="..." />` elements. */
  default?: () => unknown;
  /** Optional group label, rendered above the options. */
  label?: () => unknown;
}>();

const model = defineModel<string[]>();
// `defaultValue` is only ever read here, never written into `model` — an
// eager write would emit `update:modelValue` on mount (assigning to `model`
// always emits, controlled or not), which React's lazy `useState` initializer
// never does since nothing calls `onChange` before the user acts. See
// Slider.vue for the same fix applied there.
const currentValue = computed(() => model.value ?? props.defaultValue ?? []);

const generatedName = useId();

function handleToggle(option: string, checked: boolean) {
  const current = currentValue.value;
  const next = checked
    ? current.includes(option)
      ? current
      : [...current, option]
    : current.filter((item) => item !== option);
  model.value = next;
}

provide(
  CheckboxGroupContextKey,
  reactive({
    name: computed(() => props.name ?? generatedName),
    value: currentValue,
    onToggle: handleToggle,
    disabled: computed(() => props.disabled),
    size: computed(() => props.size),
    color: computed(() => props.color),
  }),
);
</script>

<template>
  <div class="okkly-component okkly-checkbox-group" role="group">
    <span v-if="slots.label" class="okkly-checkbox-group__label"><slot name="label" /></span>
    <slot />
  </div>
</template>
