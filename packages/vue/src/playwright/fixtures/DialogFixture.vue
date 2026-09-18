<!--
  Test fixture for Dialog: composes it with its real subcomponents (rather
  than raw markup in a `.ct.ts` slot string, which cannot reference other
  components) so tests can exercise DialogClose/DialogActions wired to real
  open/close state, mirroring AnchoredPopover.vue for Popover.
-->
<script setup lang="ts">
import { ref } from "vue";
import Dialog from "../../components/Dialog/Dialog.vue";
import DialogTitle from "../../components/Dialog/DialogTitle.vue";
import DialogContent from "../../components/Dialog/DialogContent.vue";
import DialogActions from "../../components/Dialog/DialogActions.vue";
import DialogClose from "../../components/Dialog/DialogClose.vue";
import type { DialogMaxWidth } from "../../components/Dialog/Dialog.types";
import type { OverlayCloseReason } from "../../types";

const props = withDefaults(
  defineProps<{
    defaultOpen?: boolean;
    maxWidth?: DialogMaxWidth;
    fullScreen?: boolean;
    showClose?: boolean;
    showActions?: boolean;
  }>(),
  {
    defaultOpen: false,
    maxWidth: "sm",
    fullScreen: false,
    showClose: false,
    showActions: false,
  },
);

const emit = defineEmits<{
  closeReason: [reason: OverlayCloseReason];
}>();

const open = ref(props.defaultOpen);

function handleClose(_event: Event, reason: OverlayCloseReason) {
  emit("closeReason", reason);
  open.value = false;
}
</script>

<template>
  <div class="fixture-root">
    <button type="button" @click="open = !open">Toggle</button>
    <Dialog :open="open" :max-width="maxWidth" :full-screen="fullScreen" @close="handleClose">
      <DialogClose v-if="showClose" @click="open = false" />
      <DialogTitle>Delete this project?</DialogTitle>
      <DialogContent>This cannot be undone.</DialogContent>
      <DialogActions v-if="showActions">
        <button type="button" @click="open = false">Cancel</button>
        <button type="button" @click="open = false">Delete</button>
      </DialogActions>
    </Dialog>
  </div>
</template>
