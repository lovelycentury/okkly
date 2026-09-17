<!-- Internal, not exported: the label/optional-marker/description block
     shared by every layout branch in Stepper.vue. -->
<script setup lang="ts">
import type { StepperStep } from "./Stepper.types";

defineProps<{
  step: StepperStep;
}>();
</script>

<template>
  <div class="okkly-stepper__label">
    {{ step.label }}
    <span v-if="step.optional" class="okkly-stepper__optional">(optional)</span>
  </div>
  <div v-if="step.description" class="okkly-stepper__description">{{ step.description }}</div>
</template>
