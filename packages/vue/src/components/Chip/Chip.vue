<script setup lang="ts">
import { computed, normalizeClass, useAttrs } from "vue";
import "@okkly/design-system/components/Chip/Chip.scss";
import type { ChipProps } from "./Chip.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ChipProps>(), {
  variant: "glass",
  size: "medium",
  selected: false,
  dot: false,
  removable: false,
  disabled: false,
  removeLabel: "Remove",
});

const emit = defineEmits<{
  remove: [event: MouseEvent];
}>();

const slots = defineSlots<{
  /** Chip text. */
  default?: () => unknown;
  /** Leading icon — overrides `dot`. */
  icon?: () => unknown;
}>();

const attrs = useAttrs();
// `onClick` is read and invoked by hand rather than left to fall through, so
// it can drive `isInteractive`/`role`/keyboard activation and be gated when
// `disabled` — see the reasoning in Chip.types.ts.
const restAttrs = computed(() => {
  const { class: _class, onClick: _onClick, ...rest } = attrs;
  return rest;
});
const clickListener = computed(
  () => attrs.onClick as ((event: MouseEvent | KeyboardEvent) => void) | undefined,
);
const isInteractive = computed(() => !!clickListener.value && !props.disabled);

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-chip",
    props.variant !== "glass" && `okkly-chip--${props.variant}`,
    props.size !== "medium" && `okkly-chip--${props.size}`,
    props.selected && "okkly-chip--selected",
    isInteractive.value && "okkly-chip--interactive",
    props.disabled && "okkly-chip--disabled",
    attrs.class,
  ]),
);

function invokeClick(event: MouseEvent | KeyboardEvent) {
  if (props.disabled) return;
  clickListener.value?.(event);
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isInteractive.value) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    invokeClick(event);
  }
}

function handleRemove(event: MouseEvent) {
  event.stopPropagation();
  if (props.disabled) return;
  emit("remove", event);
}
</script>

<template>
  <div
    :class="classes"
    v-bind="restAttrs"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    :aria-pressed="isInteractive ? selected : undefined"
    :aria-disabled="disabled || undefined"
    @click="invokeClick"
    @keydown="handleKeyDown"
  >
    <span v-if="!slots.icon && dot" class="okkly-chip__dot" aria-hidden="true" />
    <span v-if="slots.icon" class="okkly-chip__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="okkly-chip__label okkly-truncation-ellipsis"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="okkly-chip__remove"
      :disabled="disabled"
      :aria-label="removeLabel"
      @click="handleRemove"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
