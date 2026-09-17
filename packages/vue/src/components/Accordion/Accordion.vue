<script setup lang="ts">
import { computed, provide, reactive } from "vue";
import "@okkly/design-system/components/Accordion/Accordion.scss";
import { AccordionContextKey } from "./AccordionContext";
import type { AccordionProps } from "./Accordion.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<AccordionProps>(), {
  defaultExpanded: false,
  disabled: false,
});

defineSlots<{
  /** `AccordionSummary` and `AccordionDetails`. */
  default?: () => unknown;
}>();

// An explicit `default: undefined` is required here: a bare
// `defineModel<boolean>()` compiles to a `Boolean`-typed prop, and Vue
// resolves an absent `Boolean` prop with no declared default to `false`
// rather than `undefined` — which would make the `!== undefined` check below
// never see the unbound case and always ignore `defaultExpanded`.
const model = defineModel<boolean | undefined>({ default: undefined });
// `defaultExpanded` is read here rather than written into the model on
// mount — see Slider.vue.
const isExpanded = computed<boolean>(() =>
  model.value !== undefined ? model.value : props.defaultExpanded,
);

function toggle() {
  if (props.disabled) return;
  model.value = !isExpanded.value;
}

provide(
  AccordionContextKey,
  reactive({
    expanded: computed(() => isExpanded.value),
    disabled: computed(() => props.disabled),
    toggle,
  }),
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-accordion",
    isExpanded.value && "okkly-accordion--expanded",
    props.disabled && "okkly-accordion--disabled",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes" v-bind="$attrs">
    <slot />
  </div>
</template>
