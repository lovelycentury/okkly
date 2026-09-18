<script setup lang="ts">
import Button from "../../components/Button/Button.vue";
import Tooltip from "../../components/Tooltip/Tooltip.vue";
</script>

<template>
  <div style="padding: 120px">
    <Tooltip title="Anchored" :enter-delay="0" open>
      <Button>Hover</Button>
    </Tooltip>
  </div>
</template>
