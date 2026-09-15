<script setup lang="ts">
import { iconX } from "@okkly/icons";
</script>

<template>
  <button type="button" class="okkly-dialog__close" aria-label="Close">
    <span v-html="iconX" />
  </button>
</template>
