<script setup lang="ts">
import { computed, normalizeClass, useAttrs, useId } from "vue";
import "@okkly/design-system/components/Switch/Switch.scss";
import type { SwitchProps } from "./Switch.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SwitchProps>(), {
  size: "medium",
  color: "primary",
  disabled: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Text beside the control. */
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
    "okkly-switch",
    props.color !== "primary" && `okkly-switch--color-${props.color}`,
    props.size !== "medium" && `okkly-switch--${props.size}`,
    attrs.class,
  ]),
);
</script>

<template>
  <label :for="inputId" :class="classes">
    <span class="okkly-switch__control">
      <input
        :id="inputId"
        v-model="model"
        type="checkbox"
        role="switch"
        class="okkly-switch__input"
        :disabled="disabled"
        v-bind="inputAttrs"
      />
      <span class="okkly-switch__track" aria-hidden="true">
        <span class="okkly-switch__thumb" />
      </span>
    </span>
    <span v-if="slots.label" class="okkly-switch__label"><slot name="label" /></span>
  </label>
</template>
