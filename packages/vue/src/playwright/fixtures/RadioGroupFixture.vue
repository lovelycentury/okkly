<!--
  Test fixture for RadioGroup: composes it with real Radio children (rather
  than raw markup in a `.ct.ts` slot string, which cannot reference other
  components) so tests can exercise selection, shared name, disabled
  propagation and per-option overrides, mirroring DialogFixture.vue.
-->
<script setup lang="ts">
import RadioGroup from "../../components/RadioGroup/RadioGroup.vue";
import Radio from "../../components/Radio/Radio.vue";
import type { RadioColor, RadioSize } from "../../components/Radio/Radio.types";

withDefaults(
  defineProps<{
    defaultValue?: string;
    label?: string;
    disabled?: boolean;
    size?: RadioSize;
    color?: RadioColor;
    showPush?: boolean;
    smsSize?: RadioSize;
    smsColor?: RadioColor;
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
// explicitly bound `model-value` on `RadioGroup` below as controlled the
// instant both the prop key and an `onUpdate:modelValue` listener are
// present — even when the value itself is `undefined` — so a test that
// mounts this fixture without passing `modelValue` needs this component's
// own model to behave as a normal local ref, which only `defineModel`
// (bound the same way at this outer boundary) gives it.
const model = defineModel<string>();
</script>

<template>
  <RadioGroup
    v-model="model"
    :default-value="defaultValue"
    :disabled="disabled"
    :size="size"
    :color="color"
  >
    <template v-if="label" #label>{{ label }}</template>
    <Radio value="email"><template #label>Email</template></Radio>
    <Radio value="sms" :size="smsSize" :color="smsColor"><template #label>SMS</template></Radio>
    <Radio v-if="showPush" value="push"><template #label>Push</template></Radio>
  </RadioGroup>
</template>
