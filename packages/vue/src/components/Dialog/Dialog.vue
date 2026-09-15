<script setup lang="ts">
import { computed, normalizeClass, ref, useAttrs } from "vue";
import "@okkly/design-system/components/Dialog/Dialog.scss";
import Modal from "../Modal/Modal.vue";
import Grow from "../Grow/Grow.vue";
import type { OverlayCloseReason } from "../../types";
import type { DialogProps } from "./Dialog.types";

const props = withDefaults(defineProps<DialogProps>(), {
  container: undefined,
  disablePortal: false,
  disableEscapeKeyDown: false,
  disableAutoFocus: false,
  disableEnforceFocus: false,
  disableRestoreFocus: false,
  disableScrollLock: false,
  hideBackdrop: false,
  keepMounted: false,
  backdropClass: undefined,
  fullWidth: false,
  maxWidth: "sm",
  fullScreen: false,
  transitionDuration: "auto",
});

const emit = defineEmits<{
  close: [event: Event, reason: OverlayCloseReason];
}>();

defineSlots<{
  /** The dialog's content — `DialogTitle`/`DialogContent`/`DialogActions`/`DialogClose`. */
  default?: () => unknown;
}>();

// Vue's automatic `$attrs` fallthrough does not reliably reach content that
// sits behind a conditional `<Teleport>` root (Modal's), so `class`/`style`
// and every other passthrough attribute are merged onto Modal by hand.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

// Whether the paper's exit Grow has finished. Starts `true` unless the
// dialog opens on first render, so a Dialog that never opens renders nothing
// rather than a hidden one.
const exited = ref(!props.open);

const classes = computed(() =>
  normalizeClass([
    "okkly-dialog",
    !exited.value && "okkly-dialog--visible",
    props.fullWidth && "okkly-dialog--full-width",
    props.fullScreen && "okkly-dialog--full-screen",
    props.maxWidth !== false && `okkly-dialog--max-width-${props.maxWidth}`,
    attrs.class,
  ]),
);

// The container stretches across the viewport *above* Modal's backdrop, so
// it — not the backdrop — is what a click beside the paper actually lands
// on. MUI resolves this the same way, by dismissing from the container.
function handleContainerClick(event: MouseEvent) {
  if (event.target !== event.currentTarget) return;
  emit("close", event, "backdropClick");
}

function handleModalClose(event: Event, reason: OverlayCloseReason) {
  emit("close", event, reason);
}

function handleGrowEnter() {
  exited.value = false;
}

function handleGrowExited() {
  exited.value = true;
}

// Modal has no built-in transition and unmounts the instant `open` goes
// false, which would cut the paper's shrink short. So Modal is always told
// to stay mounted here, and this only lets go once the Grow has actually
// finished — the caller's own `keepMounted` still decides what happens after.
const shouldRender = computed(() => !(exited.value && !props.open && !props.keepMounted));
</script>

<template>
  <Modal
    v-if="shouldRender"
    :open="open"
    :container="container"
    :disable-portal="disablePortal"
    :disable-escape-key-down="disableEscapeKeyDown"
    :disable-auto-focus="disableAutoFocus"
    :disable-enforce-focus="disableEnforceFocus"
    :disable-restore-focus="disableRestoreFocus"
    :disable-scroll-lock="disableScrollLock"
    :hide-backdrop="hideBackdrop"
    keep-mounted
    :backdrop-class="backdropClass"
    v-bind="restAttrs"
    :class="classes"
    :style="attrs.style"
    @close="handleModalClose"
  >
    <div class="okkly-dialog__container" @click="handleContainerClick">
      <!--
        Vue's transition family defaults to unmounting on exit (`v-if`),
        unlike React's, which stays mounted throughout unless told otherwise.
        Forwarding Dialog's own `keepMounted` here is what makes the caller's
        knob mean the same thing in both: the paper — not just Modal's own
        subtree — survives while closed.
      -->
      <Grow
        :in="open"
        appear
        :timeout="transitionDuration"
        :keep-mounted="keepMounted"
        @enter="handleGrowEnter"
        @exited="handleGrowExited"
      >
        <div class="okkly-dialog__paper" role="dialog" aria-modal="true">
          <slot />
        </div>
      </Grow>
    </div>
  </Modal>
</template>
