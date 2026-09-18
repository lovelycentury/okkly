<script lang="ts">
/** Ids `Field` derives from the control id, so callers can wire aria attributes to them. */
export function getFieldIds(id: string, hasLabel: boolean, hasHelperText: boolean) {
  return {
    labelId: hasLabel ? `${id}-label` : undefined,
    helperId: hasHelperText ? `${id}-helper` : undefined,
  };
}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import type { FieldProps } from "./Field.types";

const props = withDefaults(defineProps<FieldProps>(), {
  hideLabel: false,
  required: false,
  size: "medium",
  color: "primary",
  error: false,
  disabled: false,
  fullWidth: false,
  htmlFor: undefined,
});

const emit = defineEmits<{
  /** A click landed inside the control box — Select/Autocomplete use it to focus their input and open the popup. */
  "control-click": [event: MouseEvent];
}>();

const slots = defineSlots<{
  /** Content of the field — the control itself. */
  default?: () => unknown;
  /** Label. */
  label?: () => unknown;
  /** Helper text below the field. */
  "helper-text"?: () => unknown;
  /** Content rendered inside the border, before the control. */
  "start-adornment"?: () => unknown;
  /** Content rendered inside the border, after the control. */
  "end-adornment"?: () => unknown;
}>();

const hasLabel = computed(() => !!slots.label);
const hasHelperText = computed(() => !!slots["helper-text"]);
const ids = computed(() => getFieldIds(props.id, hasLabel.value, hasHelperText.value));

const labelFor = computed(() =>
  props.htmlFor === false ? undefined : (props.htmlFor ?? props.id),
);

const classes = computed(() =>
  [
    "okkly-component",
    props.block,
    props.color !== "primary" && `${props.block}--color-${props.color}`,
    props.size !== "medium" && `${props.block}--${props.size}`,
    props.error && `${props.block}--error`,
    props.disabled && `${props.block}--disabled`,
    props.fullWidth && `${props.block}--full-width`,
  ]
    .filter(Boolean)
    .join(" "),
);

const labelClasses = computed(() =>
  [`${props.block}__label`, props.hideLabel && `${props.block}__label--hidden`]
    .filter(Boolean)
    .join(" "),
);

const controlRef = useTemplateRef<HTMLDivElement>("control");

defineExpose({ controlRef });
</script>

<template>
  <div :class="classes">
    <label v-if="hasLabel" :id="ids.labelId" :for="labelFor" :class="labelClasses">
      <slot name="label" />
      <span v-if="required" :class="`${block}__required`" aria-hidden="true">*</span>
    </label>

    <div ref="control" :class="`${block}__control`" @click="emit('control-click', $event)">
      <span v-if="slots['start-adornment']" :class="`${block}__adornment`">
        <slot name="start-adornment" />
      </span>
      <slot />
      <span v-if="slots['end-adornment']" :class="`${block}__adornment`">
        <slot name="end-adornment" />
      </span>
    </div>

    <span v-if="hasHelperText" :id="ids.helperId" :class="`${block}__helper`">
      <slot name="helper-text" />
    </span>
  </div>
</template>
