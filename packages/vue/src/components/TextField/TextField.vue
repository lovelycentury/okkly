<script lang="ts">
import type { FieldColor, FieldSize } from "../Field/Field.vue";

export type TextFieldSize = FieldSize;
export type TextFieldColor = FieldColor;

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<TextField>`
 * name-for-name. Deliberate differences, because Vue has no `ReactNode`:
 * `label`, `helperText`, `startAdornment` and `endAdornment` arrive as the
 * `label`, `helper-text`, `start-adornment` and `end-adornment` slots. The
 * controlled `value` becomes `defineModel`, so consumers can `v-model` it;
 * every other native input attribute (`type`, `placeholder`, `name`,
 * `maxlength`, `@input`, `@change`…) falls through to the rendered `<input>`
 * on its own — `class` is the one exception, which lands on the outer field
 * wrapper instead, matching React's `className`. `color` also diverges: every
 * `--okkly-accent-*` token is a valid value here, not just `primary`/`dante`.
 * Deliberate gaps: no `variant` (the design has one visual treatment, not
 * filled/outlined/standard), no `multiline`/`rows`/`select` (not in this
 * component's Figma spec — would be new, undesigned surface).
 */
export interface TextFieldProps {
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Field height & text.
   *
   * @default "medium"
   */
  size?: TextFieldSize;
  /**
   * Tints the focus ring/glow. Any `--okkly-accent-*` token — `dante` is a
   * rare, deliberate accent moment; the rest are plain color choices.
   *
   * @default "primary"
   */
  color?: TextFieldColor;
  /**
   * Marks invalid + red border.
   *
   * @default false
   */
  error?: boolean;
  /**
   * If `true`, the field takes the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Disables the input.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Id of the rendered `<input>`; also what the label's `for` and the helper
   * text's id derive from. Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import "@okkly/design-system/components/TextField/TextField.scss";
import Field, { getFieldIds } from "../Field/Field.vue";

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
