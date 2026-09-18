<script setup lang="ts">
import { ref } from "vue";
import SwipeableDrawer from "../../components/SwipeableDrawer/SwipeableDrawer.vue";
import type { SwipeableDrawerProps } from "../../components/SwipeableDrawer/SwipeableDrawer.types";

type ControlledSwipeableDrawerProps = Omit<SwipeableDrawerProps, "open">;

withDefaults(defineProps<ControlledSwipeableDrawerProps>(), {
  anchor: "left",
});

const open = ref(false);
const opens = ref(0);
const closes = ref(0);

function handleOpen() {
  open.value = true;
  opens.value += 1;
}

function handleClose() {
  open.value = false;
  closes.value += 1;
}
</script>

<template>
  <div>
    <span data-testid="opens">{{ opens }}</span>
    <span data-testid="closes">{{ closes }}</span>
    <SwipeableDrawer v-bind="$props" :open="open" @open="handleOpen" @close="handleClose">
      <div style="padding: 16px; height: 100%">Panel content</div>
    </SwipeableDrawer>
  </div>
</template>
