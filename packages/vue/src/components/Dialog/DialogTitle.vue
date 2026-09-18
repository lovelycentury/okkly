<script setup lang="ts">
defineSlots<{
  /** Title text. */
  default?: () => unknown;
}>();
</script>

<template>
  <h2 class="okkly-dialog__title"><slot /></h2>
</template>
