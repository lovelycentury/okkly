<!--
  Test fixture for CheckboxGroup: composes it with real Checkbox children
  (rather than raw markup in a `.ct.ts` slot string, which cannot reference
  other components) so tests can exercise selection, shared name, disabled
  propagation and per-option overrides, mirroring RadioGroupFixture.vue.
-->
<script setup lang="ts">
import CheckboxGroup from "../../components/CheckboxGroup/CheckboxGroup.vue";
import Checkbox from "../../components/Checkbox/Checkbox.vue";
import type { CheckboxColor, CheckboxSize } from "../../components/Checkbox/Checkbox.types";

withDefaults(
  defineProps<{
    defaultValue?: string[];
    label?: string;
    disabled?: boolean;
    size?: CheckboxSize;
    color?: CheckboxColor;
    showPush?: boolean;
    smsSize?: CheckboxSize;
    smsColor?: CheckboxColor;
  }>(),
  {
    defaultValue: undefined,
    label: undefined,
    disabled: false,
    size: "medium",
    color: "primary",
    showPush: false,
    smsSize: undefined,
    smsColor: undefined,
  },
);

// Relaying through its own `defineModel`, rather than a plain prop + manual
// emit, is what keeps "uncontrolled" genuinely uncontrolled: Vue treats an
// explicitly bound `model-value` on `CheckboxGroup` below as controlled the
// instant both the prop key and an `onUpdate:modelValue` listener are
// present — even when the value itself is `undefined` — so a test that
// mounts this fixture without passing `modelValue` needs this component's
// own model to behave as a normal local ref, which only `defineModel`
// (bound the same way at this outer boundary) gives it.
const model = defineModel<string[]>();
</script>

<template>
  <CheckboxGroup
    v-model="model"
    :default-value="defaultValue"
    :disabled="disabled"
    :size="size"
    :color="color"
  >
    <template v-if="label" #label>{{ label }}</template>
    <Checkbox value="email"><template #label>Email</template></Checkbox>
    <Checkbox value="sms" :size="smsSize" :color="smsColor"
      ><template #label>SMS</template></Checkbox
    >
    <Checkbox v-if="showPush" value="push"><template #label>Push</template></Checkbox>
  </CheckboxGroup>
</template>
