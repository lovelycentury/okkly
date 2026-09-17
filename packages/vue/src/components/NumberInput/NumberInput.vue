<script lang="ts">
function formatDisplayValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function parseInputValue(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function clampValue(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

function stepBase(current: number | null, min?: number): number {
  if (current !== null) return current;
  return min ?? 0;
}

function applyStep(
  current: number | null,
  direction: 1 | -1,
  step: number,
  min?: number,
  max?: number,
): number {
  const next = stepBase(current, min) + direction * step;
  return clampValue(next, min, max);
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef } from "vue";
import { iconChevronDown, iconChevronUp, iconMinus, iconPlus } from "@okkly/icons";
import "@okkly/design-system/components/NumberInput/NumberInput.scss";
import type { NumberInputProps } from "./NumberInput.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<NumberInputProps>(), {
  defaultValue: null,
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  disabled: false,
  controls: "stepper",
  min: undefined,
  max: undefined,
  step: 1,
  required: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below field. */
  "helper-text"?: () => unknown;
}>();

const model = defineModel<number | null>();

// Unlike React's manual `valueProp !== undefined ? valueProp : uncontrolledValue`
// split, `model.value` already resolves controlled vs. uncontrolled —
// `undefined` means genuinely unbound, so it's the only case that falls back
// to `defaultValue`.
const resolvedValue = computed<number | null>(() =>
  model.value !== undefined ? model.value : props.defaultValue,
);

const draftText = ref<string | null>(null);
const displayValue = computed(() => draftText.value ?? formatDisplayValue(resolvedValue.value));
const base = computed(() => stepBase(resolvedValue.value, props.min));
const canIncrement = computed(() => props.max === undefined || base.value < props.max);
const canDecrement = computed(() => props.min === undefined || base.value > props.min);

function setValue(next: number | null, options?: { clearDraft?: boolean }) {
  model.value = next === null ? null : clampValue(next, props.min, props.max);
  if (options?.clearDraft !== false) draftText.value = null;
}

// Reads `resolvedValue` fresh at call time — unlike React, no controlled/
// uncontrolled branching or stale-closure workaround is needed here, since
// Vue's reactive `props`/`defineModel` are never stale the way a React
// closure captured at render time can be.
function handleStep(direction: 1 | -1) {
  setValue(applyStep(resolvedValue.value, direction, props.step, props.min, props.max));
}

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, "aria-describedby": _describedBy, ...rest } = attrs;
  return rest;
});

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const helperId = computed(() => (slots["helper-text"] ? `${inputId.value}-helper` : undefined));
const describedBy = computed(
  () =>
    [helperId.value, attrs["aria-describedby"] as string | undefined].filter(Boolean).join(" ") ||
    undefined,
);

function handleInputChange(event: Event) {
  const text = (event.target as HTMLInputElement).value;
  draftText.value = text;
  setValue(parseInputValue(text), { clearDraft: false });
}

function handleBlur() {
  if (resolvedValue.value !== null) setValue(clampValue(resolvedValue.value, props.min, props.max));
  else draftText.value = null;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!props.disabled && canIncrement.value) handleStep(1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!props.disabled && canDecrement.value) handleStep(-1);
  }
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-number-input",
    props.color !== "primary" && `okkly-number-input--color-${props.color}`,
    props.size !== "medium" && `okkly-number-input--${props.size}`,
    props.error && "okkly-number-input--error",
    props.fullWidth && "okkly-number-input--full-width",
  ]
    .filter(Boolean)
    .join(" "),
);

const controlsClasses = computed(() =>
  [
    "okkly-number-input__controls",
    props.controls !== "stepper" && "okkly-number-input__controls--chevrons",
  ]
    .filter(Boolean)
    .join(" "),
);

const incrementIcon = computed(() => (props.controls === "stepper" ? iconPlus : iconChevronUp));
const decrementIcon = computed(() => (props.controls === "stepper" ? iconMinus : iconChevronDown));

const inputRef = useTemplateRef<HTMLInputElement>("input");
defineExpose({ inputRef });
</script>

<template>
  <div :class="[classes, attrs.class]">
    <label
      v-if="slots.label"
      :for="inputId"
      :class="['okkly-number-input__label', hideLabel && 'okkly-number-input__label--hidden']"
    >
      <slot name="label" />
      <span v-if="required" class="okkly-number-input__required" aria-hidden="true">*</span>
    </label>
    <div class="okkly-number-input__control">
      <input
        ref="input"
        :id="inputId"
        v-bind="inputAttrs"
        type="text"
        inputmode="decimal"
        class="okkly-number-input__input"
        :value="displayValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error || undefined"
        :aria-describedby="describedBy"
        @input="handleInputChange"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />
      <div :class="controlsClasses">
        <button
          type="button"
          class="okkly-number-input__step okkly-number-input__step--increment"
          aria-label="Increase value"
          :disabled="disabled || !canIncrement"
          tabindex="-1"
          @click="handleStep(1)"
        >
          <span aria-hidden="true" v-html="incrementIcon" />
        </button>
        <button
          type="button"
          class="okkly-number-input__step okkly-number-input__step--decrement"
          aria-label="Decrease value"
          :disabled="disabled || !canDecrement"
          tabindex="-1"
          @click="handleStep(-1)"
        >
          <span aria-hidden="true" v-html="decrementIcon" />
        </button>
      </div>
    </div>
    <span v-if="slots['helper-text']" :id="helperId" class="okkly-number-input__helper">
      <slot name="helper-text" />
    </span>
  </div>
</template>
