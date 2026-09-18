<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import "@okkly/design-system/components/IconButton/IconButton.scss";
import { useRipple } from "@okkly/vue-composables";
import Ripple from "../Ripple/Ripple.vue";
import type { IconButtonProps } from "./IconButton.types";

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: "ghost",
  color: "primary",
  size: "medium",
  disableRipple: false,
  disabled: false,
  href: undefined,
});

defineSlots<{
  /** Glyph — an icon, typically. */
  default?: () => unknown;
}>();

const root = useTemplateRef<HTMLElement>("root");
const { ripples, events, hideRipple } = useRipple(root);

const showRipple = computed(() => !props.disableRipple && !props.disabled);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-icon-button",
    props.variant !== "ghost" && `okkly-icon-button--${props.variant}`,
    props.color !== "primary" && `okkly-icon-button--color-${props.color}`,
    props.size !== "medium" && `okkly-icon-button--${props.size}`,
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
    :href="href && !disabled ? href : undefined"
    :disabled="href ? undefined : disabled"
    :aria-disabled="href && disabled ? true : undefined"
    v-on="showRipple ? events : {}"
  >
    <Ripple v-if="showRipple" :ripples="ripples" :on-ripple-end="hideRipple" />
    <span class="okkly-icon-button__icon" aria-hidden="true"><slot /></span>
  </component>
</template>
