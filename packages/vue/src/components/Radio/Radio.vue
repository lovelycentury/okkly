<script setup lang="ts">
import { computed, inject, normalizeClass, useAttrs, useId } from "vue";
import "@okkly/design-system/components/Radio/Radio.scss";
import { RadioGroupContextKey } from "../RadioGroup/RadioGroupContext";
import type { RadioProps } from "./Radio.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<RadioProps>(), {
  checked: undefined,
  value: undefined,
  name: undefined,
  size: undefined,
  color: undefined,
  disabled: false,
  id: undefined,
});

const emit = defineEmits<{
  change: [event: Event, checked: boolean];
}>();

const slots = defineSlots<{
  /** Optional label rendered beside the circle. */
  label?: () => unknown;
}>();

const group = inject(RadioGroupContextKey, null);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

const isGrouped = computed(() => group !== null);
const finalName = computed(() => props.name ?? group?.name);
const finalChecked = computed(() =>
  isGrouped.value ? group!.value === props.value : props.checked,
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
    "okkly-radio",
    finalColor.value !== "primary" && `okkly-radio--color-${finalColor.value}`,
    finalSize.value !== "medium" && `okkly-radio--${finalSize.value}`,
    attrs.class,
  ]),
);

function handleChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  if (isGrouped.value && props.value !== undefined) group!.onSelect(props.value);
  emit("change", event, checked);
}
</script>

<template>
  <label :for="inputId" :class="classes">
    <span class="okkly-radio__control">
      <input
        :id="inputId"
        type="radio"
        class="okkly-radio__input"
        :name="finalName"
        :value="value"
        :checked="finalChecked"
        :disabled="finalDisabled"
        v-bind="inputAttrs"
        @change="handleChange"
      />
      <span class="okkly-radio__circle" aria-hidden="true" />
    </span>
    <span v-if="slots.label" class="okkly-radio__label"><slot name="label" /></span>
  </label>
</template>
