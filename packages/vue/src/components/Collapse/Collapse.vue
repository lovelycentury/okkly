<script setup lang="ts">
import {
  computed,
  normalizeClass,
  normalizeStyle,
  onMounted,
  ref,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";
import "@okkly/design-system/components/Collapse/Collapse.scss";
import {
  DURATION_STANDARD,
  reflow,
  resolveTransitionDuration,
  resolveTransitionEasing,
} from "../../helpers/transitions";
import type { CollapseProps } from "./Collapse.types";

const props = withDefaults(defineProps<CollapseProps>(), {
  in: false,
  appear: true,
  easing: undefined,
  timeout: DURATION_STANDARD,
  orientation: "vertical",
  collapsedSize: "0px",
  unmountOnExit: false,
});

const emit = defineEmits<{
  enter: [node: HTMLElement];
  entered: [node: HTMLElement];
  exit: [node: HTMLElement];
  exited: [node: HTMLElement];
}>();

defineSlots<{
  /** The content Collapse reveals and hides. */
  default?: () => unknown;
}>();

// Collapse owns its own wrapper structure — unlike the rest of the family it
// never removes the outer element, so there is no `<slot>`-ownership problem
// to route around: everything below is a plain template ref on this
// component's own markup.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const root = useTemplateRef<HTMLDivElement>("root");
const wrapper = useTemplateRef<HTMLDivElement>("wrapper");

const isHorizontal = computed(() => props.orientation === "horizontal");
const sizeProp = computed<"width" | "height">(() => (isHorizontal.value ? "width" : "height"));
const collapsedSizeCss = computed(() =>
  typeof props.collapsedSize === "number" ? `${props.collapsedSize}px` : props.collapsedSize,
);

/** Mirrors the phase of a react-transition-group `Transition`, minus the mid-states. */
const phase = ref<"entered" | "exited" | "transitioning">(props.in ? "entered" : "exited");
const entered = computed(() => phase.value === "entered");
const hidden = computed(() => phase.value === "exited" && collapsedSizeCss.value === "0px");
const showContent = computed(() => !props.unmountOnExit || phase.value !== "exited");

const classes = computed(() =>
  normalizeClass([
    "okkly-collapse",
    `okkly-collapse--${props.orientation}`,
    entered.value && "okkly-collapse--entered",
    hidden.value && "okkly-collapse--hidden",
    attrs.class,
  ]),
);

// Size is driven by CSS (0 / auto) plus the imperative `node.style` writes
// during enter/exit — `collapsedSizeCss` here is only the resting minimum,
// never the animated dimension itself, or it would fight those writes.
const rootStyle = computed(() => [
  isHorizontal.value ? { minWidth: collapsedSizeCss.value } : { minHeight: collapsedSizeCss.value },
  normalizeStyle(attrs.style),
]);

function getWrapperSize(): number {
  const el = wrapper.value;
  if (!el) return 0;
  return isHorizontal.value ? el.clientWidth : el.clientHeight;
}

function runEnter() {
  const node = root.value;
  if (!node) return;
  phase.value = "transitioning";
  if (wrapper.value && isHorizontal.value) wrapper.value.style.position = "absolute";
  node.style[sizeProp.value] = collapsedSizeCss.value;
  emit("enter", node);

  // Force the collapsed size above to paint before measuring and animating to
  // the real size — otherwise both writes land in the same frame and nothing
  // appears to move.
  reflow(node);

  const wrapperSize = getWrapperSize();
  if (wrapper.value && isHorizontal.value) wrapper.value.style.position = "";
  const duration = resolveTransitionDuration(props.timeout, "enter", wrapperSize);
  const easing = resolveTransitionEasing(props.easing, "enter");
  node.style.transitionDuration = `${duration}ms`;
  node.style.transitionTimingFunction = easing;
  node.style[sizeProp.value] = `${wrapperSize}px`;

  window.setTimeout(() => {
    node.style[sizeProp.value] = "auto";
    phase.value = "entered";
    emit("entered", node);
  }, duration);
}

function runExit() {
  const node = root.value;
  if (!node) return;
  // Lock the current size in px before leaving `height/width: auto`.
  node.style[sizeProp.value] = `${getWrapperSize()}px`;
  emit("exit", node);
  reflow(node);

  phase.value = "transitioning";
  const wrapperSize = getWrapperSize();
  const duration = resolveTransitionDuration(props.timeout, "exit", wrapperSize);
  const easing = resolveTransitionEasing(props.easing, "exit");
  node.style.transitionDuration = `${duration}ms`;
  node.style.transitionTimingFunction = easing;
  node.style[sizeProp.value] = collapsedSizeCss.value;

  window.setTimeout(() => {
    phase.value = "exited";
    emit("exited", node);
  }, duration);
}

onMounted(() => {
  const node = root.value;
  if (!node) return;
  if (props.in) {
    if (props.appear) {
      runEnter();
      return;
    }
    node.style[sizeProp.value] = "auto";
    phase.value = "entered";
    return;
  }
  node.style[sizeProp.value] = collapsedSizeCss.value;
});

watch(
  () => props.in,
  (isIn) => {
    if (isIn) runEnter();
    else runExit();
  },
);
</script>

<template>
  <div ref="root" :class="classes" :style="rootStyle">
    <div ref="wrapper" class="okkly-collapse__wrapper">
      <div class="okkly-collapse__wrapper-inner">
        <template v-if="showContent">
          <slot />
        </template>
      </div>
    </div>
  </div>
</template>
