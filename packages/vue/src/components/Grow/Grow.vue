<script setup lang="ts">
import { computed, normalizeClass, onMounted, useAttrs, useTemplateRef } from "vue";
import "@okkly/design-system/components/Grow/Grow.scss";
import { createCssTransition, reflow, resolveTransitionDuration } from "../../helpers/transitions";
import type { GrowProps } from "./Grow.types";

const props = withDefaults(defineProps<GrowProps>(), {
  in: false,
  appear: true,
  easing: undefined,
  keepMounted: false,
  timeout: "auto",
});

const emit = defineEmits<{
  enter: [node: HTMLElement];
  entered: [node: HTMLElement];
  exit: [node: HTMLElement];
  exited: [node: HTMLElement];
}>();

defineSlots<{
  /** Content Grow scales and fades in and out. */
  default?: () => unknown;
}>();

// See Fade.vue for why this owns a wrapper element and keeps the `v-if`/
// `v-show` branches separate.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const classes = computed(() => normalizeClass(["okkly-grow", attrs.class]));
const root = useTemplateRef<HTMLDivElement>("root");

function scale(value: number): string {
  return `scale(${value}, ${value ** 2})`;
}

// `keepMounted` can render the child already closed, with no enter/leave ever
// having run to put the closed scale/opacity in place — `onBeforeEnter` only
// fires for an actual transition. This is the one-time equivalent for a
// resting closed state reached with no animation to speak of.
onMounted(() => {
  if (props.in) return;
  const node = root.value;
  if (!node) return;
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
});

function onBeforeEnter(el: Element) {
  const node = el as HTMLElement;
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
}

function onEnter(el: Element, done: () => void) {
  const node = el as HTMLElement;
  reflow(node);
  const duration = resolveTransitionDuration(props.timeout, "enter", node.clientHeight);
  node.style.transition = [
    createCssTransition("opacity", { duration }),
    createCssTransition("transform", { duration: Math.round(duration * 0.666) }),
  ].join(",");
  node.style.opacity = "1";
  node.style.transform = "none";
  emit("enter", node);
  window.setTimeout(() => {
    emit("entered", node);
    done();
  }, duration);
}

function onLeave(el: Element, done: () => void) {
  const node = el as HTMLElement;
  const duration = resolveTransitionDuration(props.timeout, "exit", node.clientHeight);
  node.style.transition = [
    createCssTransition("opacity", { duration }),
    createCssTransition("transform", {
      duration: Math.round(duration * 0.666),
      delay: Math.round(duration * 0.333),
    }),
  ].join(",");
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
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
