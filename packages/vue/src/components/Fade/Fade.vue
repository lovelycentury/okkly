<script setup lang="ts">
import { computed, normalizeClass, onMounted, useAttrs, useTemplateRef } from "vue";
import "@okkly/design-system/components/Fade/Fade.scss";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  reflow,
  resolveTransitionDuration,
  resolveTransitionEasing,
} from "../../helpers/transitions";
import type { FadeProps } from "./Fade.types";

const props = withDefaults(defineProps<FadeProps>(), {
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
  /** Content Fade fades in and out. */
  default?: () => unknown;
}>();

// Vue has no `cloneElement`, so unlike React's Fade — which writes its class,
// style and opacity straight onto the caller's own child — this owns one
// wrapper element to reach reliably through `<Transition>`'s hooks and to
// hold `v-show` for `keepMounted` (a bare `<slot>` cannot carry a directive
// at all, `v-show` included).
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const classes = computed(() => normalizeClass(["okkly-fade", attrs.class]));
const root = useTemplateRef<HTMLDivElement>("root");

// `keepMounted` can render the child already closed, with no enter/leave ever
// having run to put the closed opacity in place — `onBeforeEnter` only fires
// for an actual transition. This is the one-time equivalent for a resting
// closed state reached with no animation to speak of.
onMounted(() => {
  if (!props.in) root.value?.style.setProperty("opacity", "0");
});

function onBeforeEnter(el: Element) {
  (el as HTMLElement).style.opacity = "0";
}

function onEnter(el: Element, done: () => void) {
  const node = el as HTMLElement;
  reflow(node);
  const duration = resolveTransitionDuration(props.timeout, "enter");
  const easing = resolveTransitionEasing(props.easing, "enter");
  node.style.transition = createCssTransition("opacity", { duration, easing });
  node.style.opacity = "1";
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
  node.style.transition = createCssTransition("opacity", { duration, easing });
  node.style.opacity = "0";
  emit("exit", node);
  window.setTimeout(() => {
    emit("exited", node);
    done();
  }, duration);
}
</script>

<template>
  <!-- `v-if` and `v-show` are kept on separate branches rather than the same
       element: combined, Vue treats the initial mount as two overlapping
       triggers (the `v-if` appear and `v-show`'s own initial state) and fires
       every hook twice. -->
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
