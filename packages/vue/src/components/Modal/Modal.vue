<script setup lang="ts">
import { computed, normalizeClass, useAttrs, useTemplateRef, watch } from "vue";
import "@okkly/design-system/components/Modal/Modal.scss";
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from "@okkly/vue-composables";
import type { OverlayCloseReason } from "../../types";
import type { ModalProps } from "./Modal.types";

const props = withDefaults(defineProps<ModalProps>(), {
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
});

const emit = defineEmits<{
  close: [event: Event, reason: OverlayCloseReason];
}>();

defineSlots<{
  /** The modal's content — it draws no surface of its own. */
  default?: () => unknown;
}>();

// Vue's automatic `$attrs` fallthrough does not reliably reach content that
// sits behind a conditional `<Teleport>` root, so `class`/`style` and every
// other passthrough attribute are merged onto the modal root by hand.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const root = useTemplateRef<HTMLDivElement>("root");

const target = computed<Element>(() => props.container ?? document.body);

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-modal",
    !props.open && "okkly-modal--hidden",
    attrs.class,
  ]),
);

// Captured on the way in rather than read on the way out: by the time the
// modal closes, focus lives inside the subtree that is about to disappear.
// Runs pre-flush (the default), so it reads `document.activeElement` before
// the DOM patches — and therefore before the post-flush focus trap below
// moves focus into the modal.
watch(
  () => props.open,
  (open, _oldOpen, onCleanup) => {
    if (!open) return;
    const restoreFocusTarget = document.activeElement as HTMLElement | null;
    onCleanup(() => {
      if (props.disableRestoreFocus) return;
      restoreFocusTarget?.focus?.();
    });
  },
  { immediate: true },
);

useEscapeKey(
  (event) => emit("close", event, "escapeKeyDown"),
  () => props.open && !props.disableEscapeKeyDown,
);
useFocusTrap(root, () => props.open && !props.disableEnforceFocus, {
  autoFocus: !props.disableAutoFocus,
});
useBodyScrollLock(() => props.open && !props.disableScrollLock);

function handleBackdropClick(event: MouseEvent) {
  // A press that began inside the surface and merely *ended* on the backdrop
  // (drag-selecting text, releasing a slider) is not a dismissal gesture.
  if (event.target !== event.currentTarget) return;
  emit("close", event, "backdropClick");
}
</script>

<template>
  <Teleport :to="target" :disabled="disablePortal">
    <div
      v-if="open || keepMounted"
      ref="root"
      v-bind="restAttrs"
      :class="classes"
      :style="attrs.style"
      role="presentation"
      :aria-hidden="!open || undefined"
    >
      <div
        v-if="!hideBackdrop"
        :class="['okkly-modal__backdrop', backdropClass].filter(Boolean).join(' ')"
        aria-hidden="true"
        @click="handleBackdropClick"
      />
      <slot />
    </div>
  </Teleport>
</template>
