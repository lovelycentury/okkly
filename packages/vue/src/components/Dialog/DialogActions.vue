<script setup lang="ts">
defineSlots<{
  /** The action buttons. */
  default?: () => unknown;
}>();
</script>

<template>
  <div class="okkly-dialog__actions"><slot /></div>
</template>
