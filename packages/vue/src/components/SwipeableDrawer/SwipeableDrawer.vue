<script lang="ts">
import type { DrawerAnchor } from "../Drawer/Drawer.types";
import type { DragAxis, SwipeableDrawerHandlePosition } from "./SwipeableDrawer.types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Below this many pixels of travel, a press is a tap/click rather than a
// swipe — the gesture is dropped and the open state is left untouched, or a
// button under the user's thumb would "open"/"close" the drawer on every tap.
const MIN_DRAG_DISTANCE = 10;

// Discovery: the peek starts hidden, overshoots to this multiple of
// `peekSize` after a short delay, holds, then settles back to `peekSize`.
const DISCOVERY_DELAY_MS = 350;
const DISCOVERY_HOLD_MS = 400;
const DISCOVERY_OVERSHOOT = 1.6;

// Gap between the handle and the paper edge it sits on, and between the
// handle and the ends of that edge for `handlePosition` start/end.
const HANDLE_EDGE_INSET = 8;
const HANDLE_END_INSET = 16;

const axisFor = (anchor: DrawerAnchor): DragAxis =>
  anchor === "left" || anchor === "right" ? "x" : "y";

/** +1 when dragging toward increasing screen coordinates opens the drawer. */
const openSignFor = (anchor: DrawerAnchor): 1 | -1 =>
  anchor === "left" || anchor === "top" ? 1 : -1;

function coordFromEvent(event: MouseEvent | TouchEvent, axis: DragAxis): number {
  const point = "changedTouches" in event ? (event.touches[0] ?? event.changedTouches[0]) : event;
  if (!point) return 0;
  return axis === "x" ? point.clientX : point.clientY;
}

/**
 * The handle sits on the paper edge *facing into* the screen — the one still
 * showing while the drawer peeks — so a bottom sheet's handle is at its top,
 * a left drawer's at its right. It runs along that edge.
 */
function handleStyle(
  anchor: DrawerAnchor,
  position: SwipeableDrawerHandlePosition,
  length: number,
  thickness: number,
  color: string | undefined,
): Record<string, string> {
  const style: Record<string, string> = color ? { background: color } : {};
  if (anchor === "top" || anchor === "bottom") {
    style.width = `${length}px`;
    style.height = `${thickness}px`;
    if (anchor === "bottom") style.top = `${HANDLE_EDGE_INSET}px`;
    else style.bottom = `${HANDLE_EDGE_INSET}px`;
    if (position === "start") style.left = `${HANDLE_END_INSET}px`;
    else if (position === "end") style.right = `${HANDLE_END_INSET}px`;
    else {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    }
  } else {
    style.width = `${thickness}px`;
    style.height = `${length}px`;
    if (anchor === "right") style.left = `${HANDLE_EDGE_INSET}px`;
    else style.right = `${HANDLE_EDGE_INSET}px`;
    if (position === "start") style.top = `${HANDLE_END_INSET}px`;
    else if (position === "end") style.bottom = `${HANDLE_END_INSET}px`;
    else {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    }
  }
  return style;
}
</script>

<script setup lang="ts">
import { computed, onUnmounted, ref, useAttrs, useTemplateRef, watch } from "vue";
import "@okkly/design-system/components/SwipeableDrawer/SwipeableDrawer.scss";
import Drawer from "../Drawer/Drawer.vue";
import type { SwipeableDrawerProps } from "./SwipeableDrawer.types";

// See Drawer.vue: a template with a sibling edge-strip element beside
// `Drawer` has no single root either, so `class`/`style`/attrs fallthrough
// is off and merged onto `Drawer` (the visible surface) by hand instead.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SwipeableDrawerProps>(), {
  anchor: "right",
  disableSwipeToOpen: false,
  swipeAreaWidth: 20,
  hysteresis: 0.5,
  minFlingVelocity: 0.6,
  peekSize: 0,
  disableDiscovery: false,
  showHandle: false,
  handleDragOnly: false,
  handleLength: 32,
  handleThickness: 4,
  handlePosition: "center",
  handleColor: undefined,
  container: undefined,
  disablePortal: false,
  disableEscapeKeyDown: false,
  disableAutoFocus: false,
  disableEnforceFocus: false,
  disableRestoreFocus: false,
  disableScrollLock: false,
  hideBackdrop: false,
  backdropClass: undefined,
  mini: false,
});

const emit = defineEmits<{
  open: [];
  close: [];
}>();

defineSlots<{
  default?: () => unknown;
}>();

const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

// Only the `Drawer`-shaped props get forwarded — spreading every prop
// (including this component's own swipe/handle knobs) would leak them onto
// `Drawer`'s root as unrecognised attributes.
const drawerProps = computed(() => ({
  anchor: props.anchor,
  container: props.container,
  disablePortal: props.disablePortal,
  disableEscapeKeyDown: props.disableEscapeKeyDown,
  disableAutoFocus: props.disableAutoFocus,
  disableEnforceFocus: props.disableEnforceFocus,
  disableRestoreFocus: props.disableRestoreFocus,
  disableScrollLock: props.disableScrollLock,
  hideBackdrop: props.hideBackdrop,
  backdropClass: props.backdropClass,
}));

const axis = computed(() => axisFor(props.anchor));
const openSign = computed(() => openSignFor(props.anchor));

const drawerRef = useTemplateRef<InstanceType<typeof Drawer>>("drawerRef");
const dragProgress = ref<number | undefined>(undefined);

// Discovery plays once, on mount, and only for a drawer that starts closed
// and peeking. It is cut short by opening or by the user's own drag.
const discovering = ref(props.peekSize > 0 && !props.disableDiscovery && !props.open);
const overshooting = ref(false);

watch(
  [discovering, () => props.open],
  ([isDiscovering, isOpen], _old, onCleanup) => {
    if (!isDiscovering) return;
    if (isOpen) {
      discovering.value = false;
      return;
    }
    const start = window.setTimeout(() => {
      overshooting.value = true;
    }, DISCOVERY_DELAY_MS);
    const settle = window.setTimeout(() => {
      overshooting.value = false;
      discovering.value = false;
    }, DISCOVERY_DELAY_MS + DISCOVERY_HOLD_MS);
    onCleanup(() => {
      clearTimeout(start);
      clearTimeout(settle);
    });
  },
  { immediate: true },
);

const shownPeek = computed(() =>
  discovering.value
    ? overshooting.value
      ? props.peekSize * DISCOVERY_OVERSHOOT
      : 0
    : props.peekSize,
);

// Whether the in-flight gesture opens (started closed) or closes (started
// open) the drawer; the distance it travels and the point it started from;
// and the touch identifier so a second finger landing mid-drag is ignored.
// Plain variables, not refs — nothing here is read reactively, only from
// inside the gesture handlers below.
let opening = false;
let travel = 0;
let startCoord = 0;
let touchId: number | null = null;
// A fling is measured over the *last* leg of the drag, not the whole
// gesture from its start — the average over the full distance would call a
// slow drag that happened to begin with one quick flick a fling, and would
// call a fling made after a slow drag a slow release. Updated on every move.
let lastMoveCoord = 0;
let lastMoveTime = 0;

// `Drawer` renders the paper directly, so its rendered size is read off the
// DOM — through the `paper` it exposes — rather than threaded through as a
// prop. A peeking drawer travels only what is not already showing, so the
// finger and the paper stay in step.
function measureTravel(): number {
  const paper = drawerRef.value?.paper;
  if (!paper) return 1;
  const size = axis.value === "x" ? paper.offsetWidth : paper.offsetHeight;
  return Math.max(1, size - props.peekSize);
}

function progressFromCoord(coord: number): number {
  const delta = ((coord - startCoord) * openSign.value) / travel;
  const base = opening ? 0 : 1;
  return clamp(base + delta, 0, 1);
}

function stopListening() {
  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseup", handleEnd);
  document.removeEventListener("touchmove", handleMove);
  document.removeEventListener("touchend", handleEnd);
  document.removeEventListener("touchcancel", handleEnd);
}

function handleMove(event: MouseEvent | TouchEvent) {
  if ("touches" in event) {
    const stillTracking = Array.from(event.touches).some((touch) => touch.identifier === touchId);
    if (!stillTracking) return;
  }
  const coord = coordFromEvent(event, axis.value);
  dragProgress.value = progressFromCoord(coord);
  lastMoveCoord = coord;
  lastMoveTime = performance.now();
}

function handleEnd(event: MouseEvent | TouchEvent) {
  stopListening();
  touchId = null;
  dragProgress.value = undefined;

  const coord = coordFromEvent(event, axis.value);
  const traveled = Math.abs(coord - startCoord);
  // A tap, not a swipe — leave the open state exactly as it was.
  if (traveled < MIN_DRAG_DISTANCE) return;

  const progress = progressFromCoord(coord);
  // Velocity of the release itself: from the last recorded move to this
  // release point, not averaged over the whole gesture from its start.
  const elapsedMs = Math.max(1, performance.now() - lastMoveTime);
  const velocity = ((coord - lastMoveCoord) * openSign.value) / elapsedMs;

  const shouldOpen =
    velocity > props.minFlingVelocity
      ? true
      : velocity < -props.minFlingVelocity
        ? false
        : progress > props.hysteresis;

  if (shouldOpen) emit("open");
  else emit("close");
}

onUnmounted(stopListening);

function beginDrag(event: MouseEvent | TouchEvent, isOpening: boolean) {
  if ("button" in event && event.button !== 0) return;
  let coord: number;
  if ("touches" in event) {
    const touch = event.touches[0];
    if (!touch) return;
    touchId = touch.identifier;
    coord = axis.value === "x" ? touch.clientX : touch.clientY;
    document.addEventListener("touchmove", handleMove, { passive: true });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);
  } else {
    coord = axis.value === "x" ? event.clientX : event.clientY;
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  }
  // The user has found the gesture on their own; no need to keep hinting.
  discovering.value = false;
  overshooting.value = false;
  opening = isOpening;
  travel = measureTravel();
  startCoord = coord;
  lastMoveCoord = coord;
  lastMoveTime = performance.now();
  dragProgress.value = isOpening ? 0 : 1;
}

// A mouse-only guard: left unprevented, a press-and-drag over the panel's
// own text starts the browser's native text-selection drag. That selection
// then swallows this gesture's own `mouseup` — even once it is released —
// so a later drag from the same page never sees its release either. Touch
// is unaffected; its default (scrolling) is handled by `touch-action` on
// the edge/handle elements, and preventing it here on the panel would
// block scrolling inside an open drawer's content instead.
function suppressNativeDrag(event: MouseEvent | TouchEvent) {
  if ("button" in event) event.preventDefault();
}

// Three places can start a drag. The handle always can; the edge strip and
// the panel (the peeking sliver while closed, all of it while open) step
// aside when `handleDragOnly` is set.
function startFromEdge(event: MouseEvent | TouchEvent) {
  suppressNativeDrag(event);
  if (props.handleDragOnly) return;
  beginDrag(event, true);
}
function startFromPanel(event: MouseEvent | TouchEvent) {
  suppressNativeDrag(event);
  if (props.handleDragOnly) return;
  if (props.open) beginDrag(event, false);
  else if (!props.disableSwipeToOpen) beginDrag(event, true);
}
function startFromHandle(event: MouseEvent | TouchEvent) {
  suppressNativeDrag(event);
  if (props.open) beginDrag(event, false);
  else if (!props.disableSwipeToOpen) beginDrag(event, true);
}

const classes = computed(() =>
  ["okkly-component", "okkly-swipeable-drawer", attrs.class].filter(Boolean).join(" "),
);
const edgeStyle = computed(() => ({
  "--okkly-swipeable-drawer-edge-size": `${props.swipeAreaWidth}px`,
}));
</script>

<template>
  <div
    v-if="!open && !disableSwipeToOpen && !handleDragOnly"
    :class="`okkly-swipeable-drawer__edge okkly-swipeable-drawer__edge--${anchor}`"
    :style="edgeStyle"
    aria-hidden="true"
    @mousedown="startFromEdge"
    @touchstart="startFromEdge"
  />
  <Drawer
    ref="drawerRef"
    v-bind="{ ...drawerProps, ...restAttrs }"
    variant="temporary"
    :open="open"
    :drag-progress="dragProgress"
    :peek-size="shownPeek"
    keep-mounted
    :class="classes"
    :style="attrs.style"
    @close="emit('close')"
  >
    <div
      v-if="showHandle"
      class="okkly-swipeable-drawer__handle"
      :style="handleStyle(anchor, handlePosition, handleLength, handleThickness, handleColor)"
      aria-hidden="true"
      @mousedown="startFromHandle"
      @touchstart="startFromHandle"
    />
    <div style="height: 100%" @mousedown="startFromPanel" @touchstart="startFromPanel">
      <slot />
    </div>
  </Drawer>
</template>
