<script setup lang="ts">
import {
  computed,
  normalizeClass,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";
import "@okkly/design-system/components/Slide/Slide.scss";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  EASING_EASE_OUT,
  EASING_SHARP,
  reflow,
  resolveTransitionDuration,
  resolveTransitionEasing,
} from "../../helpers/transitions";
import type { SlideDirection, SlideProps } from "./Slide.types";

const props = withDefaults(defineProps<SlideProps>(), {
  in: false,
  appear: true,
  // `withDefaults` factories are hoisted to module scope, so this can only
  // reference imported bindings (`EASING_EASE_OUT`/`EASING_SHARP`) — not a
  // `const` declared in this same script block.
  easing: () => ({ enter: EASING_EASE_OUT, exit: EASING_SHARP }),
  keepMounted: false,
  timeout: () => DEFAULT_TIMEOUT,
  direction: "down",
  container: undefined,
});

const emit = defineEmits<{
  enter: [node: HTMLElement];
  entered: [node: HTMLElement];
  exit: [node: HTMLElement];
  exited: [node: HTMLElement];
}>();

defineSlots<{
  /** Content Slide moves in and out along `direction`. */
  default?: () => unknown;
}>();

// See Fade.vue for why this owns a wrapper element and keeps the `v-if`/
// `v-show` branches separate.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const root = useTemplateRef<HTMLDivElement>("root");

const classes = computed(() =>
  normalizeClass(["okkly-slide", `okkly-slide--${props.direction}`, attrs.class]),
);

function resolveContainer(): HTMLElement | null | undefined {
  return typeof props.container === "function" ? props.container() : props.container;
}

function getTranslateValue(direction: SlideDirection, node: HTMLElement): string {
  const resolvedContainer = resolveContainer();
  const rect = node.getBoundingClientRect();
  const containerRect = resolvedContainer?.getBoundingClientRect();
  const containerWindow = node.ownerDocument.defaultView ?? window;

  const computedStyle = containerWindow.getComputedStyle(node);
  const transform =
    computedStyle.getPropertyValue("-webkit-transform") ||
    computedStyle.getPropertyValue("transform");

  let offsetX = 0;
  let offsetY = 0;
  if (transform && transform !== "none") {
    const transformValues = transform.split("(")[1]?.split(")")[0]?.split(",");
    if (transformValues && transformValues.length >= 6) {
      offsetX = Number.parseInt(transformValues[4]!, 10);
      offsetY = Number.parseInt(transformValues[5]!, 10);
    }
  }

  if (direction === "left") {
    if (containerRect) return `translateX(${containerRect.right + offsetX - rect.left}px)`;
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }
  if (direction === "right") {
    if (containerRect) return `translateX(-${rect.right - containerRect.left - offsetX}px)`;
    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }
  if (direction === "up") {
    if (containerRect) return `translateY(${containerRect.bottom + offsetY - rect.top}px)`;
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }
  // direction === "down"
  if (containerRect)
    return `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`;
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}

function updatePosition() {
  const node = root.value;
  if (node) node.style.transform = getTranslateValue(props.direction, node);
}

function onBeforeEnter(el: Element) {
  const node = el as HTMLElement;
  node.style.transform = getTranslateValue(props.direction, node);
  reflow(node);
}

function onEnter(el: Element, done: () => void) {
  const node = el as HTMLElement;
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
  node.style.transform = getTranslateValue(props.direction, node);
  emit("exit", node);
  window.setTimeout(() => {
    node.style.transition = "";
    emit("exited", node);
    done();
  }, duration);
}

// The offscreen offset for "up"/"left" depends on the viewport, so a closed
// panel needs to re-measure when the window resizes — "down"/"right" only
// ever depend on the panel's own box, which a resize does not change.
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!props.in) updatePosition();
  }, 166);
}

let containerWindow: (Window & typeof globalThis) | null = null;

onMounted(() => {
  if (!props.in) updatePosition();
  if (props.direction === "down" || props.direction === "right") return;
  containerWindow = root.value?.ownerDocument.defaultView ?? window;
  containerWindow.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer);
  containerWindow?.removeEventListener("resize", handleResize);
});

watch(
  () => props.in,
  (isIn) => {
    if (!isIn) updatePosition();
  },
);
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
