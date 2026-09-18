<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import "@okkly/design-system/components/Button/Button.scss";
import { useRipple } from "@okkly/vue-composables";
import Ripple from "../Ripple/Ripple.vue";
import Spinner from "./Spinner.vue";
import type { ButtonProps } from "./Button.types";

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  color: "primary",
  shape: "pill",
  size: "medium",
  fullWidth: false,
  disableRipple: false,
  loading: false,
  loadingPosition: "center",
  disabled: false,
  href: undefined,
});

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** Label of the button. */
  default?: () => unknown;
  /** Icon before the label. */
  "start-icon"?: () => unknown;
  /** Icon after the label. */
  "end-icon"?: () => unknown;
}>();

const root = useTemplateRef<HTMLElement>("root");
const { ripples, events, hideRipple } = useRipple(root);

const isDisabled = computed(() => props.disabled || props.loading);
const showRipple = computed(() => !props.disableRipple && !isDisabled.value);

/** Where the spinner renders, or `null` when not loading. */
const spinnerPosition = computed(() => (props.loading ? props.loadingPosition : null));
const showStartIcon = computed(() => !!slots["start-icon"] && spinnerPosition.value !== "start");
const showEndIcon = computed(() => !!slots["end-icon"] && spinnerPosition.value !== "end");

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-button",
    `okkly-button--${props.variant}`,
    props.color !== "primary" && `okkly-button--color-${props.color}`,
    props.shape === "rounded" && "okkly-button--rounded",
    props.size !== "medium" && `okkly-button--${props.size}`,
    props.fullWidth && "okkly-button--full-width",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    ref="root"
    :class="classes"
    :type="href ? undefined : 'button'"
    :href="href && !isDisabled ? href : undefined"
    :disabled="href ? undefined : isDisabled"
    :aria-disabled="href && isDisabled ? true : undefined"
    v-on="showRipple ? events : {}"
  >
    <Ripple v-if="showRipple" :ripples="ripples" :on-ripple-end="hideRipple" />

    <Spinner v-if="spinnerPosition === 'start'" />
    <span v-if="showStartIcon" class="okkly-button__icon"><slot name="start-icon" /></span>
    <span
      class="okkly-button__label okkly-truncation-ellipsis"
      :class="{ 'okkly-button__label--hidden': spinnerPosition === 'center' }"
      ><slot
    /></span>
    <span v-if="showEndIcon" class="okkly-button__icon"><slot name="end-icon" /></span>
    <Spinner v-if="spinnerPosition === 'end'" />
    <span v-if="spinnerPosition === 'center'" class="okkly-button__loader">
      <Spinner />
    </span>
  </component>
</template>

<style>
/*
 * The one rule the design system does not provide, because this wrapper is
 * markup @okkly/vue invents. Unscoped on purpose: every other class here is a
 * global BEM class from @okkly/design-system.
 */
.okkly-button__loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
