<script setup lang="ts">
import Drawer from "../../components/Drawer/Drawer.vue";
import DrawerStateProbe from "./DrawerStateProbe.vue";
import type { DrawerProps } from "../../components/Drawer/Drawer.types";

defineProps<DrawerProps>();
</script>

<template>
  <Drawer v-bind="$props" @close="() => {}">
    <DrawerStateProbe />
  </Drawer>
</template>
