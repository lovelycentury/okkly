<script lang="ts">
export type FieldSize = "small" | "medium" | "large";
export type FieldColor = "primary" | "dante";
/**
 * Every accent tint a `Field`-shell control can take. Broader than
 * `FieldColor`, which is what Select/Autocomplete/DateField/TimeField/etc.
 * still expose publicly — TextField is the one consumer that opts into the
 * full accent set.
 */
export type FieldAccentColor = FieldColor | "secondary" | "violet" | "ember" | "ice" | "contrast";

/**
 * Props mirror `@okkly/react`'s internal `<Field>` name-for-name. Deliberate
 * differences, because Vue has no `ReactNode`: `label`, `helperText`,
 * `startAdornment` and `endAdornment` arrive as the `label`, `helper-text`,
 * `start-adornment` and `end-adornment` slots, and `children` is the default
 * slot. `controlProps` and `className` are dropped — nothing yet needs to
 * reach the inner control box, and Vue merges a consumer's `class` onto the
 * root on its own.
 *
 * Internal on purpose — not exported from the package. It is the shared shell
 * TextField (and, later, Select/Autocomplete) render inside; its styling
 * counterpart is the `field.shell` SCSS mixin, included by each consumer's own
 * stylesheet under its own BEM block.
 */
export interface FieldProps {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okkly-text-field"`. Each consumer keeps its own block so its public class names stay exactly what they were.
   *
   * @default undefined
   */
  block: string;
  /**
   * Id of the control this field wraps; the label's `for` and the helper id derive from it.
   *
   * @default undefined
   */
  id: string;
  /**
   * Hide Label.
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: FieldSize;
  /**
   * Tints the focus ring/glow. `dante` is a rare, deliberate accent moment;
   * the rest are for matching a field to surrounding brand/section color.
   *
   * @default "primary"
   */
  color?: FieldAccentColor;
  /**
   * Error.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Full Width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * `<label for>` only works for real form controls, so a wrapper whose control is a `div[role="combobox"]` passes `false` and points at `${id}-label` with `aria-labelledby` instead.
   *
   * @default undefined
   */
  htmlFor?: string | false;
}

/** Ids `Field` derives from the control id, so callers can wire aria attributes to them. */
export function getFieldIds(id: string, hasLabel: boolean, hasHelperText: boolean) {
  return {
    labelId: hasLabel ? `${id}-label` : undefined,
    helperId: hasHelperText ? `${id}-helper` : undefined,
  };
}
</script>

<script setup lang="ts">
import { computed } from "vue";

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
</script>

<template>
  <div :class="classes">
    <label v-if="hasLabel" :id="ids.labelId" :for="labelFor" :class="labelClasses">
      <slot name="label" />
      <span v-if="required" :class="`${block}__required`" aria-hidden="true">*</span>
    </label>

    <div :class="`${block}__control`">
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
