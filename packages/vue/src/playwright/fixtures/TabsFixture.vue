<!--
  Test fixture for Tabs' sequential keyboard-navigation tests. Playwright's
  root `mount()` `on:` listeners don't satisfy Vue's "prop+listener on the
  same vnode" controlled check, so a `modelValue` prop passed straight to
  `mount()` never updates between two key presses in the same test — this
  binds a genuine `v-model` in a real template instead, forwarding the new
  value out via a differently-named `change` emit.
-->
<script setup lang="ts">
import { ref } from "vue";
import Tabs from "../../components/Tabs/Tabs.vue";
import type { TabItem, TabsOrientation } from "../../components/Tabs/Tabs.types";

const props = defineProps<{
  items: TabItem[];
  initialValue: string;
  orientation?: TabsOrientation;
}>();

const emit = defineEmits<{ change: [value: string] }>();

const value = ref(props.initialValue);
function handleUpdate(next: string | undefined) {
  if (next === undefined) return;
  value.value = next;
  emit("change", next);
}
</script>

<template>
  <Tabs
    :items="items"
    :model-value="value"
    :orientation="orientation"
    @update:model-value="handleUpdate"
  />
</template>
