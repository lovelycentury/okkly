<script lang="ts">
export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

/**
 * Props mirror `@okkly/react`'s `<Button>` name-for-name, which in turn follows
 * MUI's Button API. Deliberate differences, both because Vue has no `ReactNode`:
 * `startIcon`/`endIcon` arrive as the `start-icon`/`end-icon` slots, and the
 * label as the default slot. Everything the element itself understands —
 * `class`, `type`, `@click`, `aria-*` — falls through to the rendered
 * `<button>`/`<a>` rather than being redeclared here.
 */
export interface ButtonProps {
  /**
   * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
   *
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   */
  color?: ButtonColor;
  /**
   * Shape of the button. Can be `pill` or `rounded`.
   *
   * @default "pill"
   */
  shape?: ButtonShape;
  /**
   * Size of the button. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  size?: ButtonSize;
  /**
   * Whether the button takes the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   */
  disableRipple?: boolean;
  /**
   * Whether the loading indicator is visible and the button is disabled.
   *
   * @default false
   */
  loading?: boolean;
  /**
   * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
   *
   * @default "center"
   */
  loadingPosition?: ButtonLoadingPosition;
  /**
   * Whether the button is disabled. Implied by `loading`.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Renders an `<a>` instead of a `<button>`. A disabled link drops its href.
   *
   * @default undefined
   */
  href?: string;
}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import "@okkly/design-system/components/Button/Button.scss";
import { useRipple } from "../../composables/useRipple";
import Ripple from "../Ripple/Ripple.vue";
import Spinner from "./Spinner.vue";

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
