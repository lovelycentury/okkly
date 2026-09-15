<!--
  Test fixture for Box: renders one of @okkly/shared's test layouts — a Box, an
  optional Box inside it, and color swatches at the innermost level. A slot's
  raw markup cannot name a component, so layouts that nest Boxes are mounted
  through this instead.
-->
<script setup lang="ts">
import { boxSwatch, type BoxTree } from "@okkly/shared/testing";
import Box from "../../components/Box/Box.vue";

defineProps<BoxTree>();
</script>

<template>
  <Box v-bind="outer">
    <Box v-if="inner" v-bind="inner">
      <Box v-for="(swatch, index) in swatches" :key="index" v-bind="boxSwatch(swatch)" />
    </Box>
    <template v-else>
      <Box v-for="(swatch, index) in swatches" :key="index" v-bind="boxSwatch(swatch)" />
    </template>
  </Box>
</template>
