<!--
  Test fixture for Tabs' matrix screenshots: the active tab points
  `aria-controls` at a panel the consumer owns, so a tablist mounted on its
  own would reference a missing id and fail the accessibility scan for a
  fault that only the test harness had. Wraps Tabs with the sibling panel
  React's own fixture inlines directly in its matrix `component` function —
  Vue's matrix helper takes a single component reference, so this needs a
  real .vue file instead.
-->
<script setup lang="ts">
import Tabs from "../../components/Tabs/Tabs.vue";
import type {
  TabItem,
  TabsColor,
  TabsOrientation,
  TabsVariant,
} from "../../components/Tabs/Tabs.types";

withDefaults(
  defineProps<{
    items: TabItem[];
    modelValue: string;
    color?: TabsColor;
    variant?: TabsVariant;
    orientation?: TabsOrientation;
  }>(),
  { color: "primary", variant: "standard", orientation: "horizontal" },
);
</script>

<template>
  <div style="width: 20rem">
    <Tabs
      :items="items"
      :model-value="modelValue"
      :color="color"
      :variant="variant"
      :orientation="orientation"
    />
    <div id="okkly-tabpanel-overview" role="tabpanel" aria-labelledby="okkly-tab-overview">
      Overview panel
    </div>
  </div>
</template>
