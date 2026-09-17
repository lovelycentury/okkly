<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import { iconCalendar } from "@okkly/icons";
import {
  maskitoDate,
  maskitoParseDate,
  maskitoStringifyDate,
  type MaskitoDateParams,
} from "@maskito/kit";
import { maskito } from "@maskito/vue";
import "@okkly/design-system/components/DateField/DateField.scss";
import Calendar, { calendarToneStyle } from "../Calendar/Calendar.vue";
import type { CalendarValue } from "../Calendar/Calendar.types";
import Field, { getFieldIds } from "../Field/Field.vue";
import Popover from "../Popover/Popover.vue";
import type { DateFieldProps } from "./DateField.types";

// Local `vXxx` bindings are auto-registered as `v-xxx` directives by Vue's
// script-setup compiler — no manual directive registration needed.
const vMaskito = maskito;

const DATE_PARAMS: MaskitoDateParams = { mode: "dd/mm/yyyy", separator: "." };

function stringifyDate(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyDate(value, DATE_PARAMS);
}

const props = withDefaults(defineProps<DateFieldProps>(), {
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  disabled: false,
  defaultValue: null,
  min: undefined,
  max: undefined,
  placeholder: "dd.mm.yyyy",
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

const text = ref(stringifyDate(resolvedValue.value));
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
    text.value = stringifyDate(next);
  },
);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const describedBy = computed(
  () => getFieldIds(inputId.value, false, !!slots["helper-text"]).helperId,
);

const dateParams = computed<MaskitoDateParams>(() => ({
  ...DATE_PARAMS,
  min: props.min,
  max: props.max,
}));
const maskOptions = computed(() => maskitoDate(dateParams.value));

function handleInput(event: Event) {
  const next = (event.target as HTMLInputElement).value;
  text.value = next;
  if (next === "") {
    commit(null);
    return;
  }
  const parsed = maskitoParseDate(next, dateParams.value);
  if (parsed) commit(parsed);
}

function handleSelect(date: Date) {
  text.value = stringifyDate(date);
  commit(date);
  openModel.value = false;
}

// `Calendar` defaults to `mode="single"`, never overridden here, so `value`
// is always `Date | null`.
function handleCalendarChange(value: CalendarValue | null) {
  if (value instanceof Date) handleSelect(value);
}

const fieldRef = useTemplateRef<InstanceType<typeof Field>>("field");
const inputRef = useTemplateRef<HTMLInputElement>("input");
const controlNode = computed(() => fieldRef.value?.controlRef ?? null);

defineExpose({ inputRef });

const toneStyle = computed(() => calendarToneStyle(props.color));
</script>

<template>
  <Field
    ref="field"
    block="okkly-date-field"
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
      <!-- A plain button, not `IconButton`: the field's own control box supplies
      the padding, so a button with its own hit box made the field taller than
      every other control in a row. -->
      <button
        type="button"
        class="okkly-date-field__trigger"
        :disabled="disabled"
        aria-label="Open calendar"
        :aria-expanded="openModel"
        @mousedown.stop
        @click="openModel = !openModel"
        v-html="iconCalendar"
      />
    </template>

    <input
      ref="input"
      :id="inputId"
      v-maskito="maskOptions"
      type="text"
      inputmode="numeric"
      class="okkly-date-field__input"
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
      class="okkly-date-field-popover"
      @close="openModel = false"
    >
      <!-- The popover is portaled, so the field's own colour modifier cannot
      reach the calendar by inheritance — the tone is handed over as an inline
      variable instead. -->
      <Calendar
        :model-value="resolvedValue"
        :style="toneStyle"
        :min="min"
        :max="max"
        @update:model-value="handleCalendarChange"
      />
    </Popover>
  </Field>
</template>
