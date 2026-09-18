<script setup lang="ts">
defineSlots<{
  /** Body content. */
  default?: () => unknown;
}>();
</script>

<template>
  <div class="okkly-dialog__content"><slot /></div>
</template>
