<script setup lang="ts">
import { computed, normalizeClass, useAttrs, useId } from "vue";
import "@okkly/design-system/components/Checkbox/Checkbox.scss";
import type { CheckboxProps } from "./Checkbox.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CheckboxProps>(), {
  indeterminate: false,
  size: "medium",
  color: "primary",
  disabled: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Text beside the box. */
  label?: () => unknown;
}>();

const model = defineModel<boolean>();

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-checkbox",
    props.color !== "primary" && `okkly-checkbox--color-${props.color}`,
    props.size !== "medium" && `okkly-checkbox--${props.size}`,
    attrs.class,
  ]),
);
</script>

<template>
  <label :for="inputId" :class="classes">
    <span class="okkly-checkbox__control">
      <input
        :id="inputId"
        v-model="model"
        type="checkbox"
        class="okkly-checkbox__input"
        :indeterminate="indeterminate"
        :disabled="disabled"
        v-bind="inputAttrs"
      />
      <span class="okkly-checkbox__box" aria-hidden="true">
        <svg
          class="okkly-checkbox__check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <svg
          class="okkly-checkbox__minus"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
        </svg>
      </span>
    </span>
    <span v-if="slots.label" class="okkly-checkbox__label"><slot name="label" /></span>
  </label>
</template>
