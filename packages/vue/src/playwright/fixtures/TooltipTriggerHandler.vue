<script setup lang="ts">
import { ref } from "vue";
import Tooltip from "../../components/Tooltip/Tooltip.vue";

const enters = ref(0);
</script>

<template>
  <div>
    <Tooltip title="Wrapped" :enter-delay="0">
      <button type="button" @mouseenter="enters += 1">Hover</button>
    </Tooltip>
    <span data-testid="enter-count">{{ enters }}</span>
  </div>
</template>
