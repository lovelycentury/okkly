<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import { iconClock } from "@okkly/icons";
import {
  maskitoParseTime,
  maskitoStringifyTime,
  maskitoTime,
  type MaskitoTimeParams,
} from "@maskito/kit";
import { maskito } from "@maskito/vue";
import "@okkly/design-system/components/TimeField/TimeField.scss";
import Field, { getFieldIds } from "../Field/Field.vue";
import Popover from "../Popover/Popover.vue";
import TimePicker from "../TimePicker/TimePicker.vue";
import type { TimePickerValue } from "../TimePicker/TimePicker.types";
import type { TimeFieldProps } from "./TimeField.types";

// Local `vXxx` bindings are auto-registered as `v-xxx` directives by Vue's
// script-setup compiler — no manual directive registration needed.
const vMaskito = maskito;

const TIME_PARAMS: MaskitoTimeParams = { mode: "HH:MM" };

function dateToMs(date: Date): number {
  return (
    ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 +
    date.getMilliseconds()
  );
}

function msToDate(ms: number): Date {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milliseconds = ms % 1000;
  const date = new Date();
  date.setHours(hours, minutes, seconds, milliseconds);
  return date;
}

function dateToTimeValue(date: Date): TimePickerValue {
  return { h: date.getHours(), m: date.getMinutes() };
}

function timeValueToDate(time: TimePickerValue): Date {
  const date = new Date();
  date.setHours(time.h, time.m, 0, 0);
  return date;
}

function stringifyTime(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyTime(dateToMs(value), TIME_PARAMS);
}

function isCompleteTime(text: string): boolean {
  return /^\d{2}:\d{2}$/.test(text);
}

const props = withDefaults(defineProps<TimeFieldProps>(), {
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  disabled: false,
  defaultValue: null,
  min: undefined,
  max: undefined,
  placeholder: "HH:mm",
  id: undefined,
  required: false,
});

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below field. */
  "helper-text"?: () => unknown;
}>();

// Unlike React's manual `valueProp !== undefined ? valueProp : uncontrolledValue`
// split, `model.value` already resolves controlled vs. uncontrolled —
// `undefined` means genuinely unbound, so it's the only case that falls back
// to `defaultValue`.
const model = defineModel<Date | null>();
const openModel = defineModel<boolean>("open", { default: false });

const resolvedValue = computed<Date | null>(() =>
  model.value !== undefined ? model.value : props.defaultValue,
);

const text = ref(stringifyTime(resolvedValue.value));
// Tracks the value the input itself last committed, so the sync watcher
// below can tell a genuinely external `v-model` change (reformat the text)
// apart from an update it just caused (already reflected in `text` at the
// call site) — same self-inflicted-vs-external distinction WheelColumn's
// scroll watcher makes.
let lastCommitted = model.value;

function commit(next: Date | null) {
  lastCommitted = next;
  model.value = next;
}

watch(
  () => model.value,
  (next) => {
    if (next === lastCommitted) return;
    lastCommitted = next;
    text.value = stringifyTime(next);
  },
);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const describedBy = computed(
  () => getFieldIds(inputId.value, false, !!slots["helper-text"]).helperId,
);

const maskOptions = computed(() => maskitoTime(TIME_PARAMS));

function handleInput(event: Event) {
  const next = (event.target as HTMLInputElement).value;
  text.value = next;
  if (next === "") {
    commit(null);
    return;
  }
  if (!isCompleteTime(next)) return;
  const ms = maskitoParseTime(next, TIME_PARAMS);
  if (Number.isFinite(ms)) commit(msToDate(ms));
}

function handlePickerChange(time: TimePickerValue | undefined) {
  if (!time) return;
  const next = timeValueToDate(time);
  text.value = stringifyTime(next);
  commit(next);
}

const fieldRef = useTemplateRef<InstanceType<typeof Field>>("field");
const inputRef = useTemplateRef<HTMLInputElement>("input");
const controlNode = computed(() => fieldRef.value?.controlRef ?? null);

defineExpose({ inputRef });

const pickerValue = computed(() =>
  resolvedValue.value ? dateToTimeValue(resolvedValue.value) : undefined,
);
</script>

<template>
  <Field
    ref="field"
    block="okkly-time-field"
    :id="inputId"
    :hide-label="hideLabel"
    :size="size"
    :color="color"
    :error="error"
    :disabled="disabled"
    :required="required"
    :full-width="fullWidth"
  >
    <template v-if="slots.label" #label><slot name="label" /></template>
    <template v-if="slots['helper-text']" #helper-text><slot name="helper-text" /></template>
    <template #end-adornment>
      <!-- A plain button, not `IconButton`: the field's control box already
      supplies the padding, so a button with its own hit box inflated the
      field's height. -->
      <button
        type="button"
        class="okkly-time-field__trigger"
        :disabled="disabled"
        aria-label="Open time picker"
        :aria-expanded="openModel"
        @mousedown.stop
        @click="openModel = !openModel"
        v-html="iconClock"
      />
    </template>

    <input
      ref="input"
      :id="inputId"
      v-maskito="maskOptions"
      type="text"
      inputmode="numeric"
      class="okkly-time-field__input"
      :value="text"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="error || undefined"
      :aria-describedby="describedBy"
      @input="handleInput"
    />

    <Popover
      :open="openModel"
      :anchor-el="controlNode"
      placement="bottom-end"
      class="okkly-time-field-popover"
      @close="openModel = false"
    >
      <TimePicker
        :model-value="pickerValue"
        :color="color"
        @update:model-value="handlePickerChange"
      />
    </Popover>
  </Field>
</template>
