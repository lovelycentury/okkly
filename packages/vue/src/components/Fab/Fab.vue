<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import "@okkly/design-system/components/FAB/FAB.scss";
import { useRipple } from "@okkly/vue-composables";
import Ripple from "../Ripple/Ripple.vue";
import type { FabProps } from "./Fab.types";

const props = withDefaults(defineProps<FabProps>(), {
  variant: "standard",
  color: "primary",
  size: "medium",
  disableRipple: false,
  disabled: false,
  href: undefined,
});

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** Glyph slot — always present. */
  default?: () => unknown;
  /** Label slot. Filling it grows the FAB into an extended pill (icon + text) instead of a plain circle. */
  label?: () => unknown;
}>();

const root = useTemplateRef<HTMLElement>("root");
const { ripples, events, hideRipple } = useRipple(root);

const showRipple = computed(() => !props.disableRipple && !props.disabled);
const hasLabel = computed(() => !!slots.label);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-fab",
    props.variant !== "standard" && `okkly-fab--${props.variant}`,
    props.color !== "primary" && `okkly-fab--color-${props.color}`,
    hasLabel.value && "okkly-fab--extended",
    props.size !== "medium" && `okkly-fab--${props.size}`,
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
    <span class="okkly-fab__icon" aria-hidden="true"><slot /></span>
    <span v-if="hasLabel" class="okkly-fab__label okkly-truncation-ellipsis"
      ><slot name="label"
    /></span>
  </component>
</template>
