<!-- Internal, not exported: the numbered/check dot shared by every layout
     branch in Stepper.vue. -->
<script setup lang="ts">
import { iconCheck } from "@okkly/icons";
import type { StepState } from "./Stepper.types";

defineProps<{
  state: StepState;
  index: number;
}>();
</script>

<template>
  <span
    :class="[
      'okkly-stepper__dot',
      state === 'done' && 'okkly-stepper__dot--done',
      state === 'active' && 'okkly-stepper__dot--active',
      state === 'pending' && 'okkly-stepper__dot--pending',
    ]"
    aria-hidden="true"
  >
    <span v-if="state === 'done'" class="okkly-stepper__check-icon" v-html="iconCheck" />
    <template v-else>{{ index + 1 }}</template>
  </span>
</template>
