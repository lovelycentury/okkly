<script setup lang="ts">
import { computed } from "vue";
import { useDrawerState } from "../../components/Drawer/DrawerContext";

const state = useDrawerState();
const summary = computed(
  () =>
    `${state.open ? "open" : "closed"} ${state.mini ? "mini" : "full"} ${state.variant} ${state.anchor}`,
);
</script>

<template>
  <span data-testid="drawer-state">{{ summary }}</span>
</template>
