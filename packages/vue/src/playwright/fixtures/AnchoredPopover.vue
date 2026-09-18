<!--
  Test fixture for Popover: a button that toggles a Popover anchored to
  itself, reporting every close reason so a test can assert on it. See
  AnchoredPopper.vue for why the anchor is owned by the fixture rather than
  passed in as a prop.
-->
<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Popover from "../../components/Popover/Popover.vue";
import type { PopperPlacement } from "../../components/Popper/Popper.types";
import type { OverlayCloseReason } from "../../types";

const props = withDefaults(
  defineProps<{
    triggerLabel?: string;
    defaultOpen?: boolean;
    placement?: PopperPlacement;
    hideBackdrop?: boolean;
  }>(),
  {
    triggerLabel: "Toggle",
    defaultOpen: false,
    placement: "bottom",
    hideBackdrop: true,
  },
);

const emit = defineEmits<{
  closeReason: [reason: OverlayCloseReason];
}>();

const open = ref(props.defaultOpen);
const anchor = useTemplateRef<HTMLButtonElement>("anchor");

function handleClose(_event: Event, reason: OverlayCloseReason) {
  emit("closeReason", reason);
  open.value = false;
}
</script>

<template>
  <div class="fixture-root">
    <button ref="anchor" type="button" @click="open = !open">
      <span>{{ triggerLabel }}</span>
    </button>
    <Popover
      :open="open"
      :anchor-el="anchor"
      :placement="placement"
      :hide-backdrop="hideBackdrop"
      @close="handleClose"
    >
      <slot>Panel content</slot>
    </Popover>
  </div>
</template>
