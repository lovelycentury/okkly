<script setup lang="ts">
defineSlots<{
  default?: () => unknown;
}>();
</script>

<template>
  <li>
    <slot />
  </li>
</template>
