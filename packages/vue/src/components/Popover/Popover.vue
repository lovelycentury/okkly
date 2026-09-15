<script setup lang="ts">
import { computed, normalizeClass, useAttrs, useTemplateRef } from "vue";
import type { VirtualElement } from "@popperjs/core";
import "@okkly/design-system/components/Popover/Popover.scss";
import { useClickOutside, useEscapeKey } from "@okkly/vue-composables";
import Popper from "../Popper/Popper.vue";
import type { PopperAnchorEl } from "../Popper/Popper.types";
import type { OverlayCloseReason } from "../../types";
import type { PopoverAnchorPosition, PopoverProps } from "./Popover.types";
import { growEnter, growExit, growExitedStyle } from "./growTransition";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverProps>(), {
  anchorEl: undefined,
  anchorPosition: undefined,
  placement: "bottom",
  transitionDuration: "auto",
  disablePortal: false,
  hideBackdrop: true,
  matchAnchorWidth: false,
  minWidth: undefined,
  paperClassName: undefined,
});

const emit = defineEmits<{
  close: [event: Event, reason: OverlayCloseReason];
}>();

defineSlots<{
  /** The popover's content. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// `class` is merged in by hand onto the popper (see `classes` below), since a
// component with more than one root node gets no automatic fallthrough.
const passthroughAttrs = computed(() => {
  const { class: _extraClass, ...rest } = attrs;
  return rest;
});

const paperRef = useTemplateRef<HTMLDivElement>("paper");

function createVirtualAnchor(position: PopoverAnchorPosition): VirtualElement {
  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: position.top,
      left: position.left,
      bottom: position.top,
      right: position.left,
      x: position.left,
      y: position.top,
      toJSON: () => ({}),
    }),
  };
}

const resolvedAnchor = computed<PopperAnchorEl | undefined>(() => {
  if (props.anchorEl) return props.anchorEl;
  if (props.anchorPosition) return createVirtualAnchor(props.anchorPosition);
  return undefined;
});

const classes = computed(() =>
  ["okkly-popover", props.open && "okkly-popover--open", normalizeClass(attrs.class)]
    .filter(Boolean)
    .join(" "),
);

const OFFSET_MODIFIER = { name: "offset" as const, options: { offset: [0, 8] } };

useEscapeKey(
  (event) => emit("close", event, "escapeKeyDown"),
  () => props.open,
);

useClickOutside(
  paperRef,
  (event) => {
    // The anchor is not "outside". Click-outside listens on mousedown, which
    // fires before the anchor's own click, so without this a click on an open
    // popover's trigger closes it and the trigger's own click handler
    // immediately toggles it back open — the popover appears frozen open.
    // Letting the anchor own its click makes the trigger a plain toggle again.
    if (props.anchorEl?.contains(event.target as Node)) return;
    emit("close", event, "backdropClick");
  },
  () => props.open && props.hideBackdrop,
);

function handleBackdropClick(event: MouseEvent) {
  emit("close", event, "backdropClick");
}

function handleEnter(node: Element, done: () => void) {
  growEnter(node as HTMLElement, props.transitionDuration, done);
}

function handleLeave(node: Element, done: () => void) {
  growExit(node as HTMLElement, props.transitionDuration, done);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="!hideBackdrop && open"
      class="okkly-popover__backdrop"
      role="presentation"
      @click="handleBackdropClick"
    />
  </Teleport>
  <Popper
    :open="open"
    :anchor-el="resolvedAnchor"
    :placement="placement"
    transition
    :disable-portal="disablePortal"
    :match-anchor-width="matchAnchorWidth"
    :min-width="minWidth"
    :modifiers="[OFFSET_MODIFIER]"
    :class="classes"
    v-bind="passthroughAttrs"
    role="presentation"
  >
    <template #default="{ transitionProps }">
      <Transition
        appear
        :css="false"
        @before-enter="transitionProps!.onEnter"
        @enter="handleEnter"
        @leave="handleLeave"
        @after-leave="transitionProps!.onExited"
      >
        <div
          v-if="transitionProps!.in"
          ref="paper"
          :class="['okkly-popover__paper', paperClassName].filter(Boolean).join(' ')"
          :style="growExitedStyle"
        >
          <slot />
        </div>
      </Transition>
    </template>
  </Popper>
</template>
