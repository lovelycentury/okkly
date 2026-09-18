<script setup lang="ts">
import { computed, normalizeClass, onMounted, useAttrs, useTemplateRef } from "vue";
import "@okkly/design-system/components/Zoom/Zoom.scss";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  reflow,
  resolveTransitionDuration,
  resolveTransitionEasing,
} from "../../helpers/transitions";
import type { ZoomProps } from "./Zoom.types";

const props = withDefaults(defineProps<ZoomProps>(), {
  in: false,
  appear: true,
  easing: undefined,
  keepMounted: false,
  timeout: () => DEFAULT_TIMEOUT,
});

const emit = defineEmits<{
  enter: [node: HTMLElement];
  entered: [node: HTMLElement];
  exit: [node: HTMLElement];
  exited: [node: HTMLElement];
}>();

defineSlots<{
  /** Content Zoom scales in and out from nothing. */
  default?: () => unknown;
}>();

// See Fade.vue for why this owns a wrapper element and keeps the `v-if`/
// `v-show` branches separate.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const classes = computed(() => normalizeClass(["okkly-zoom", attrs.class]));
const root = useTemplateRef<HTMLDivElement>("root");

// `keepMounted` can render the child already closed, with no enter/leave ever
// having run to put the closed transform in place — `onBeforeEnter` only
// fires for an actual transition. This is the one-time equivalent for a
// resting closed state reached with no animation to speak of.
onMounted(() => {
  if (!props.in) root.value?.style.setProperty("transform", "scale(0)");
});

function onBeforeEnter(el: Element) {
  const node = el as HTMLElement;
  node.style.transform = "scale(0)";
}

function onEnter(el: Element, done: () => void) {
  const node = el as HTMLElement;
  reflow(node);
  const duration = resolveTransitionDuration(props.timeout, "enter");
  const easing = resolveTransitionEasing(props.easing, "enter");
  node.style.transition = createCssTransition("transform", { duration, easing });
  node.style.transform = "none";
  emit("enter", node);
  window.setTimeout(() => {
    emit("entered", node);
    done();
  }, duration);
}

function onLeave(el: Element, done: () => void) {
  const node = el as HTMLElement;
  const duration = resolveTransitionDuration(props.timeout, "exit");
  const easing = resolveTransitionEasing(props.easing, "exit");
  node.style.transition = createCssTransition("transform", { duration, easing });
  node.style.transform = "scale(0)";
  emit("exit", node);
  window.setTimeout(() => {
    emit("exited", node);
    done();
  }, duration);
}
</script>

<template>
  <template v-if="keepMounted">
    <Transition
      :css="false"
      :appear="appear"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div ref="root" v-show="props.in" :class="classes" :style="attrs.style">
        <slot />
      </div>
    </Transition>
  </template>
  <template v-else>
    <Transition
      :css="false"
      :appear="appear"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div v-if="props.in" ref="root" :class="classes" :style="attrs.style">
        <slot />
      </div>
    </Transition>
  </template>
</template>
