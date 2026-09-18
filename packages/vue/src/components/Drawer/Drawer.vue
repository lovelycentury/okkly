<script lang="ts">
import type { DrawerAnchor } from "./Drawer.types";

/**
 * The paper's transform at a given point in an open/close drag, 0 (closed) →
 * 1 (open). "Closed" is the peeking position when `peekSize` is set, so a
 * drag starts from — and springs back to — what is actually on screen.
 */
function dragTransform(anchor: DrawerAnchor, progress: number, peekSize: number): string {
  const closedFraction = 1 - Math.min(1, Math.max(0, progress));
  const percent = 100 * closedFraction;
  const pixels = peekSize * closedFraction;
  switch (anchor) {
    case "left":
      return `translateX(calc(${-percent}% + ${pixels}px))`;
    case "right":
      return `translateX(calc(${percent}% - ${pixels}px))`;
    case "top":
      return `translateY(calc(${-percent}% + ${pixels}px))`;
    case "bottom":
      return `translateY(calc(${percent}% - ${pixels}px))`;
  }
}
</script>

<script setup lang="ts">
import { computed, normalizeClass, provide, reactive, ref, useAttrs, watch } from "vue";
import "@okkly/design-system/components/Drawer/Drawer.scss";
import Modal from "../Modal/Modal.vue";
import { DrawerStateKey } from "./DrawerContext";
import type { OverlayCloseReason } from "../../types";
import type { DrawerProps } from "./Drawer.types";

// A template that branches between a plain element and a wrapped `<Modal>`
// across `v-if`/`v-else-if`/`v-else` has no single static root Vue can
// prove ahead of time, so automatic `class`/`style`/attrs fallthrough is
// disabled entirely — the same reason `Dialog`/`Modal`/`Popper` merge these
// onto their root by hand instead of relying on it.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerProps>(), {
  open: false,
  anchor: "right",
  variant: "temporary",
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
  dragProgress: undefined,
  peekSize: 0,
  mini: false,
});

const emit = defineEmits<{
  close: [event: Event, reason: OverlayCloseReason];
}>();

defineSlots<{
  default?: () => unknown;
}>();

const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isPermanent = computed(() => props.variant === "permanent");
const isTemporary = computed(() => props.variant === "temporary");
const isDragging = computed(() => props.dragProgress !== undefined);

// Only `temporary` needs mount choreography: `persistent`/`permanent` stay in
// the flow (and in the DOM) the whole time, so a plain class toggle is enough
// for their width/height transition to animate correctly. `temporary`
// instead unmounts after closing, so opening it fresh has to commit the
// off-screen position to a paint *before* the on-screen class lands, or the
// transition has no starting point to animate from — the paper just snaps.
const mounted = ref(props.open);
const visible = ref(props.open);

watch(
  () => props.open,
  (open, _oldOpen, onCleanup) => {
    if (!isTemporary.value || isDragging.value) return;
    if (open) {
      mounted.value = true;
      let innerFrame = 0;
      const outerFrame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(() => {
          visible.value = true;
        });
      });
      onCleanup(() => {
        cancelAnimationFrame(outerFrame);
        cancelAnimationFrame(innerFrame);
      });
      return;
    }
    visible.value = false;
  },
  { immediate: true },
);

function handleTemporaryTransitionEnd(event: TransitionEvent) {
  if (event.target !== event.currentTarget) return;
  if (!props.open) mounted.value = false;
}

function handleModalClose(event: Event, reason: OverlayCloseReason) {
  emit("close", event, reason);
}

const isOpenClass = computed(
  () => isPermanent.value || (isTemporary.value ? visible.value : props.open),
);
const isMini = computed(() => props.variant === "persistent" && props.open && props.mini);

provide(
  DrawerStateKey,
  reactive({
    open: computed(() => isPermanent.value || props.open),
    mini: computed(() => isMini.value),
    variant: computed(() => props.variant),
    anchor: computed(() => props.anchor),
  }),
);

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-drawer",
    isOpenClass.value && "okkly-drawer--open",
    isMini.value && "okkly-drawer--mini",
    `okkly-drawer--anchor-${props.anchor}`,
    `okkly-drawer--variant-${props.variant}`,
    attrs.class,
  ]),
);

const paperStyle = computed(() =>
  isDragging.value
    ? {
        transform: dragTransform(props.anchor, props.dragProgress!, props.peekSize),
        transition: "none",
      }
    : undefined,
);

// Read by the closed-state transform in Drawer.scss; unset keeps it at 0.
// Merged with the caller's own `style` by hand, same reason as `classes`.
const rootStyle = computed(() => [
  props.peekSize ? { "--okkly-drawer-peek": `${props.peekSize}px` } : undefined,
  attrs.style,
]);
</script>

<template>
  <div v-if="isPermanent" :class="classes" :style="attrs.style" v-bind="restAttrs">
    <div class="okkly-drawer__paper"><slot /></div>
  </div>

  <template v-else-if="isTemporary">
    <Modal
      v-if="mounted || keepMounted"
      :open="open || isDragging"
      :container="container"
      :disable-portal="disablePortal"
      :disable-escape-key-down="disableEscapeKeyDown"
      :disable-auto-focus="disableAutoFocus"
      :disable-enforce-focus="disableEnforceFocus"
      :disable-restore-focus="disableRestoreFocus"
      :disable-scroll-lock="disableScrollLock"
      :hide-backdrop="hideBackdrop"
      :backdrop-class="backdropClass"
      keep-mounted
      :class="classes"
      :style="rootStyle"
      v-bind="restAttrs"
      @close="handleModalClose"
    >
      <div
        class="okkly-drawer__paper"
        role="dialog"
        aria-modal="true"
        :style="paperStyle"
        @transitionend="handleTemporaryTransitionEnd"
      >
        <slot />
      </div>
    </Modal>
  </template>

  <!-- persistent — always mounted; its own width/height carries the animation. -->
  <div v-else :class="classes" :style="attrs.style" v-bind="restAttrs">
    <div class="okkly-drawer__paper"><slot /></div>
  </div>
</template>
