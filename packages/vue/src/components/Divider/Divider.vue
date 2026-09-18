<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Divider/Divider.scss";
import type { DividerProps } from "./Divider.types";

const props = withDefaults(defineProps<DividerProps>(), {
  orientation: "horizontal",
  flexItem: false,
  textAlign: "center",
  variant: "fullWidth",
});

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** Optional centered label (e.g. "OR"). */
  default?: () => unknown;
}>();

const hasLabel = computed(() => !!slots.default && props.orientation === "horizontal");

const tag = computed(() => (hasLabel.value ? "div" : "hr"));

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-divider",
    props.orientation === "vertical" ? "okkly-divider--vertical" : "okkly-divider--horizontal",
    props.variant === "inset" && "okkly-divider--inset",
    props.variant === "middle" && "okkly-divider--middle",
    hasLabel.value && "okkly-divider--with-label",
    props.flexItem && "okkly-divider--flex-item",
    props.textAlign !== "center" && `okkly-divider--align-${props.textAlign}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <component :is="tag" :class="classes" :role="hasLabel ? 'separator' : undefined">
    <span v-if="hasLabel" class="okkly-divider__label"><slot /></span>
  </component>
</template>
