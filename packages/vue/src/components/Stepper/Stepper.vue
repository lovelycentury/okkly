<script lang="ts">
import type { StepState } from "./Stepper.types";

function getStepState(index: number, activeStep: number): StepState {
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Stepper/Stepper.scss";
import StepperDot from "./StepperDot.vue";
import StepperLabel from "./StepperLabel.vue";
import type { StepperProps } from "./Stepper.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<StepperProps>(), {
  orientation: "horizontal",
  alternativeLabel: true,
  color: "primary",
});

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-stepper",
    `okkly-stepper--${props.orientation}`,
    props.alternativeLabel &&
      props.orientation === "horizontal" &&
      "okkly-stepper--alternative-label",
    props.color !== "primary" && `okkly-stepper--color-${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes" role="list" v-bind="$attrs">
    <div
      v-for="(step, index) in steps"
      :key="index"
      :class="[
        'okkly-stepper__step',
        getStepState(index, activeStep) === 'done' && 'okkly-stepper__step--done',
        getStepState(index, activeStep) === 'active' && 'okkly-stepper__step--active',
      ]"
      role="listitem"
      :aria-current="getStepState(index, activeStep) === 'active' ? 'step' : undefined"
    >
      <div class="okkly-stepper__step-inner">
        <template v-if="orientation === 'vertical' || alternativeLabel">
          <div class="okkly-stepper__track">
            <StepperDot :state="getStepState(index, activeStep)" :index="index" />
            <span
              v-if="index !== steps.length - 1"
              :class="[
                'okkly-stepper__connector',
                index < activeStep && 'okkly-stepper__connector--active',
              ]"
              aria-hidden="true"
            />
          </div>
          <div class="okkly-stepper__content">
            <StepperLabel :step="step" />
          </div>
        </template>
        <div v-else class="okkly-stepper__inline-row">
          <StepperDot :state="getStepState(index, activeStep)" :index="index" />
          <div class="okkly-stepper__content okkly-stepper__content--inline">
            <StepperLabel :step="step" />
          </div>
          <span
            v-if="index !== steps.length - 1"
            :class="[
              'okkly-stepper__connector',
              index < activeStep && 'okkly-stepper__connector--active',
            ]"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
