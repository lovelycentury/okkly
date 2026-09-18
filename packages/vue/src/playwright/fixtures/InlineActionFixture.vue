<!--
  Test fixture for InlineAction: forwards the `action` emit out under a
  differently-named `trigger` emit. Needed only for tests that listen to
  `action` via Playwright's `on:` mount option — Playwright's Vue CT harness
  (`registerSource.mjs`) spreads `on:` listeners directly onto the mounted
  vnode's props object *by their bare event name*, not as `onEventName`, so
  `on: { action: fn }` silently clobbers InlineAction's own `action` prop
  (the button label) with the raw listener function instead of registering
  it as an emit. A genuine `@action="…"` binding in a real template — as
  used here — has no such collision, since Vue's own compiler always emits
  `onAction`, never a bare `action` key.
-->
<script setup lang="ts">
import InlineAction from "../../components/InlineAction/InlineAction.vue";
import type { InlineActionProps } from "../../components/InlineAction/InlineAction.types";

defineProps<InlineActionProps & { modelValue?: string }>();

const emit = defineEmits<{
  trigger: [];
}>();
</script>

<template>
  <InlineAction v-bind="$props" @action="emit('trigger')" />
</template>
