<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import { iconCalendar, iconClock } from "@okkly/icons";
import {
  maskitoDateTime,
  maskitoParseDateTime,
  maskitoStringifyDateTime,
  type MaskitoDateTimeParams,
} from "@maskito/kit";
import { maskito } from "@maskito/vue";
import "@okkly/design-system/components/DateTimeField/DateTimeField.scss";
import DateTimePicker from "../DateTimePicker/DateTimePicker.vue";
import Field, { getFieldIds } from "../Field/Field.vue";
import Popover from "../Popover/Popover.vue";
import type { DateTimeFieldProps } from "./DateTimeField.types";

// Local `vXxx` bindings are auto-registered as `v-xxx` directives by Vue's
// script-setup compiler — no manual directive registration needed.
const vMaskito = maskito;

const DATE_TIME_PARAMS: MaskitoDateTimeParams = {
  dateMode: "dd/mm/yyyy",
  timeMode: "HH:MM",
  dateTimeSeparator: ", ",
  dateSeparator: ".",
};

function stringifyDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyDateTime(value, DATE_TIME_PARAMS);
}

const props = withDefaults(defineProps<DateTimeFieldProps>(), {
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  disabled: false,
  defaultValue: null,
  min: undefined,
  max: undefined,
  placeholder: "dd.mm.yyyy, HH:mm",
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

const text = ref(stringifyDateTime(resolvedValue.value));
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
    text.value = stringifyDateTime(next);
  },
);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const describedBy = computed(
  () => getFieldIds(inputId.value, false, !!slots["helper-text"]).helperId,
);

const dateTimeParams = computed<MaskitoDateTimeParams>(() => ({
  ...DATE_TIME_PARAMS,
  min: props.min,
  max: props.max,
}));
const maskOptions = computed(() => maskitoDateTime(dateTimeParams.value));

function handleInput(event: Event) {
  const next = (event.target as HTMLInputElement).value;
  text.value = next;
  if (next === "") {
    commit(null);
    return;
  }
  const parsed = maskitoParseDateTime(next, dateTimeParams.value);
  if (parsed) commit(parsed);
}

function handlePickerChange(date: Date | null | undefined) {
  if (!date) return;
  text.value = stringifyDateTime(date);
  commit(date);
}

function handleConfirm(date: Date) {
  text.value = stringifyDateTime(date);
  commit(date);
  openModel.value = false;
}

const fieldRef = useTemplateRef<InstanceType<typeof Field>>("field");
const inputRef = useTemplateRef<HTMLInputElement>("input");
const controlNode = computed(() => fieldRef.value?.controlRef ?? null);

defineExpose({ inputRef });
</script>

<template>
  <Field
    ref="field"
    block="okkly-date-time-field"
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
        class="okkly-date-time-field__trigger"
        :disabled="disabled"
        aria-label="Open date time picker"
        :aria-expanded="openModel"
        @mousedown.stop
        @click="openModel = !openModel"
      >
        <span aria-hidden="true" v-html="iconCalendar" />
        <span aria-hidden="true" v-html="iconClock" />
      </button>
    </template>

    <input
      ref="input"
      :id="inputId"
      v-maskito="maskOptions"
      type="text"
      inputmode="numeric"
      class="okkly-date-time-field__input"
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
      placement="bottom-start"
      class="okkly-date-time-field-popover"
      @close="openModel = false"
    >
      <DateTimePicker
        :model-value="resolvedValue"
        :min="min"
        :max="max"
        :color="color"
        @update:model-value="handlePickerChange"
        @confirm="handleConfirm"
      />
    </Popover>
  </Field>
</template>
