<script setup lang="ts">
import { MOCK_PLAYWRIGHT_ICON } from "../screenshots";
import IconButton from "../../components/IconButton/IconButton.vue";
import Tooltip from "../../components/Tooltip/Tooltip.vue";

withDefaults(
  defineProps<{
    title: string;
    describeChild?: boolean;
    ariaLabel?: string;
  }>(),
  { describeChild: false, ariaLabel: undefined },
);
</script>

<template>
  <Tooltip :title="title" :describe-child="describeChild">
    <IconButton :aria-label="ariaLabel"><span v-html="MOCK_PLAYWRIGHT_ICON" /></IconButton>
  </Tooltip>
</template>
