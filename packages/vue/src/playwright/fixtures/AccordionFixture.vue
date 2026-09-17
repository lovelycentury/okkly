<!--
  Test fixture composing Accordion with real AccordionSummary/
  AccordionDetails instances — a `.ct.ts` slot string is raw markup compiled
  by Playwright's Vue mount, so it cannot hand over actual child components
  the way React's JSX children can. Mirrors the shape of DialogFixture.vue.

  Two different bindings on purpose: Vue's own `useModel()` only treats a
  child as controlled when its raw vnode props carry BOTH a `modelValue` key
  and an `onUpdate:modelValue` key. Playwright's `mount({ on: {...} })`
  spreads a listener under its bare event name (`"update:modelValue"`), not
  the `onUpdate:modelValue` Vue's compiler emits for a real `v-model` — so a
  `modelValue` prop sent straight from `mount()` is missing that second key
  and Accordion treats itself as uncontrolled regardless. Forwarding through
  `v-model="model"` (used whenever `forceExpanded` is left unset) sidesteps
  that for the plain uncontrolled/defaultExpanded cases; the controlled,
  parent-never-updates case needs the explicit one-way `:model-value` +
  `@update:model-value` pair below instead, which always compiles both keys.
-->
<script setup lang="ts">
import Accordion from "../../components/Accordion/Accordion.vue";
import AccordionSummary from "../../components/Accordion/AccordionSummary.vue";
import AccordionDetails from "../../components/Accordion/AccordionDetails.vue";

withDefaults(
  defineProps<{
    defaultExpanded?: boolean;
    disabled?: boolean;
    /** Swaps in a "+" as the expand icon via the `#expand-icon` slot. */
    customIcon?: boolean;
    /** Drives Accordion as controlled, fixed at this value — the emit is never fed back. */
    forceExpanded?: boolean;
  }>(),
  { defaultExpanded: false, disabled: false, customIcon: false, forceExpanded: undefined },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const model = defineModel<boolean | undefined>({ default: undefined });
</script>

<template>
  <Accordion
    v-if="forceExpanded === undefined"
    v-model="model"
    :default-expanded="defaultExpanded"
    :disabled="disabled"
  >
    <AccordionSummary>
      <slot name="summary">Section title</slot>
      <template v-if="customIcon" #expand-icon><slot name="expand-icon">+</slot></template>
    </AccordionSummary>
    <AccordionDetails><slot name="details">Body</slot></AccordionDetails>
  </Accordion>
  <Accordion
    v-else
    :model-value="forceExpanded"
    :disabled="disabled"
    @update:model-value="(value) => emit('update:modelValue', value ?? false)"
  >
    <AccordionSummary>
      <slot name="summary">Section title</slot>
      <template v-if="customIcon" #expand-icon><slot name="expand-icon">+</slot></template>
    </AccordionSummary>
    <AccordionDetails><slot name="details">Body</slot></AccordionDetails>
  </Accordion>
</template>
