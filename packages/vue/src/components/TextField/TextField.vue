<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import "@okkly/design-system/components/TextField/TextField.scss";
import Field, { getFieldIds } from "../Field/Field.vue";
import type { TextFieldProps } from "./TextField.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TextFieldProps>(), {
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  required: false,
  disabled: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below field. */
  "helper-text"?: () => unknown;
  /** Content rendered inside the border, before the input. */
  "start-adornment"?: () => unknown;
  /** Content rendered inside the border, after the input. */
  "end-adornment"?: () => unknown;
}>();

const model = defineModel<string>();

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const describedBy = computed(() => {
  const { helperId } = getFieldIds(inputId.value, false, !!slots["helper-text"]);
  return (
    [helperId, attrs["aria-describedby"] as string | undefined].filter(Boolean).join(" ") ||
    undefined
  );
});
</script>

<template>
  <Field
    block="okkly-text-field"
    :id="inputId"
    :class="attrs.class"
    :hide-label="hideLabel"
    :required="required"
    :size="size"
    :color="color"
    :error="error"
    :disabled="disabled"
    :full-width="fullWidth"
  >
    <template v-if="slots.label" #label><slot name="label" /></template>
    <template v-if="slots['helper-text']" #helper-text><slot name="helper-text" /></template>
    <template v-if="slots['start-adornment']" #start-adornment
      ><slot name="start-adornment"
    /></template>
    <template v-if="slots['end-adornment']" #end-adornment><slot name="end-adornment" /></template>

    <input
      :id="inputId"
      v-model="model"
      v-bind="inputAttrs"
      class="okkly-text-field__input"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error || undefined"
      :aria-describedby="describedBy"
    />
  </Field>
</template>
