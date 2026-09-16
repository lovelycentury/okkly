<script setup lang="ts">
import { computed, inject, normalizeClass, useAttrs, useId } from "vue";
import "@okkly/design-system/components/Checkbox/Checkbox.scss";
import { CheckboxGroupContextKey } from "../CheckboxGroup/CheckboxGroupContext";
import type { CheckboxProps } from "./Checkbox.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CheckboxProps>(), {
  value: undefined,
  name: undefined,
  indeterminate: false,
  size: undefined,
  color: undefined,
  disabled: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Text beside the box. */
  label?: () => unknown;
}>();

const model = defineModel<boolean>();

const group = inject(CheckboxGroupContextKey, null);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

const isGrouped = computed(() => group !== null);
const finalName = computed(() => props.name ?? group?.name);
const finalChecked = computed(() =>
  isGrouped.value ? props.value !== undefined && group!.value.includes(props.value) : model.value,
);
const finalDisabled = computed(() => props.disabled || (group?.disabled ?? false));
const finalSize = computed(() => props.size ?? group?.size ?? "medium");
const finalColor = computed(() => props.color ?? group?.color ?? "primary");

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-checkbox",
    finalColor.value !== "primary" && `okkly-checkbox--color-${finalColor.value}`,
    finalSize.value !== "medium" && `okkly-checkbox--${finalSize.value}`,
    attrs.class,
  ]),
);

function handleChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  if (isGrouped.value && props.value !== undefined) group!.onToggle(props.value, checked);
  else model.value = checked;
}
</script>

<template>
  <label :for="inputId" :class="classes">
    <span class="okkly-checkbox__control">
      <input
        :id="inputId"
        type="checkbox"
        class="okkly-checkbox__input"
        :name="finalName"
        :value="value"
        :checked="finalChecked"
        :indeterminate="indeterminate"
        :disabled="finalDisabled"
        v-bind="inputAttrs"
        @change="handleChange"
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
