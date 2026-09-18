<!--
  Test fixture for Divider's screenshot matrices: wraps it in a fixed-width
  box (matching the visual context the React screenshot cells use) and offers
  a `vertical` shorthand for the toolbar-style cell.
-->
<script setup lang="ts">
import Divider from "../../components/Divider/Divider.vue";
import type { DividerTextAlign, DividerVariant } from "../../components/Divider/Divider.types";

withDefaults(
  defineProps<{
    variant?: DividerVariant;
    textAlign?: DividerTextAlign;
    label?: string;
    vertical?: boolean;
  }>(),
  {
    variant: "fullWidth",
    textAlign: "center",
    label: undefined,
    vertical: false,
  },
);
</script>

<template>
  <div v-if="vertical" style="display: flex; align-items: center; gap: 0.75rem; height: 3rem">
    <span>12 open</span>
    <Divider orientation="vertical" flex-item />
    <span>4 merged</span>
  </div>
  <div v-else style="width: 16rem">
    <!-- Two branches, not one slot with `v-if` inside: a slot function is
         compiled whenever the tag has any children syntactically, even ones
         that render nothing, and Divider checks whether the slot exists at
         all (matching a plain `<Divider />` having no default slot) rather
         than whether calling it returns content. -->
    <Divider v-if="label" :variant="variant" :text-align="textAlign">{{ label }}</Divider>
    <Divider v-else :variant="variant" :text-align="textAlign" />
  </div>
</template>
