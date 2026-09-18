<script setup lang="ts">
import {
  computed,
  normalizeClass,
  onBeforeUnmount,
  ref,
  shallowRef,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";
import {
  createPopper,
  type Instance,
  type Modifier,
  type Placement,
  type VirtualElement,
} from "@popperjs/core";
import "@okkly/design-system/components/Popper/Popper.scss";
import type { PopperAnchorEl, PopperProps, PopperTransitionSlotProps } from "./Popper.types";

const props = withDefaults(defineProps<PopperProps>(), {
  anchorEl: undefined,
  placement: "bottom",
  keepMounted: false,
  disablePortal: false,
  container: undefined,
  modifiers: undefined,
  popperOptions: () => ({}),
  transition: false,
  matchAnchorWidth: false,
  minWidth: undefined,
  role: "tooltip",
});

defineSlots<{
  default?: (scope: {
    placement: Placement;
    transitionProps?: PopperTransitionSlotProps;
  }) => unknown;
}>();

// Vue's automatic `$attrs` fallthrough does not reliably reach content that
// sits behind a conditional `<Teleport>` root, so `class`/`style` and every
// other passthrough attribute are merged onto the popper element by hand.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => normalizeClass(["okkly-component", "okkly-popper", attrs.class]));
const restAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const root = useTemplateRef<HTMLDivElement>("root");
const placement = ref<Placement>(props.placement);
// Whether the exit transition (when `transition` is set) has finished. Starts
// `true` so a Popper that opens closed does not think it is mid-exit.
const exited = ref(true);
const popperInstance = shallowRef<Instance | null>(null);

function resolveAnchorEl(
  anchorEl: PopperAnchorEl | undefined,
): HTMLElement | VirtualElement | null {
  if (anchorEl == null) return null;
  return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}

function isHTMLElement(element: HTMLElement | VirtualElement): element is HTMLElement {
  return (element as HTMLElement).nodeType !== undefined;
}

const resolvedAnchor = computed(() => resolveAnchorEl(props.anchorEl));

// Whether the node is in the DOM at all. Deliberately not the same thing as
// `open`: during an exit transition the popper is closed but still on screen,
// and it has to stay positioned for the whole way out.
const shouldRender = computed(
  () => props.keepMounted || props.open || (props.transition && !exited.value),
);

watch(
  () => props.open,
  (open) => {
    if (open) exited.value = false;
  },
  { immediate: true },
);

watch(
  () => props.placement,
  (next) => {
    placement.value = next;
  },
);

const target = computed<Element | DocumentFragment>(() => {
  if (props.container) return props.container;
  const anchor = resolvedAnchor.value;
  if (anchor && isHTMLElement(anchor)) return anchor.ownerDocument.body;
  return document.body;
});

const display = computed(() =>
  !props.open && props.keepMounted && (!props.transition || exited.value) ? "none" : undefined,
);

// `minWidth` is included only when the prop itself is set. `matchAnchorWidth`
// sets the same CSS property imperatively (bypassing Vue), so an unconditional
// `{ minWidth }` here — with `props.minWidth` at its default `undefined` — would
// have Vue's own style patching clear it right back out on every re-render:
// `v-bind:style`'s patcher walks every key of the *current* bound style object
// on every patch, not just changed ones, and a value of `undefined` reads as
// "unset this property". Any reactive dependency the slot content touches
// (`filteredOptions`, `highlightedIndex`, …, for Autocomplete) is enough to
// trigger that re-render, which is why the popup would visibly narrow back to
// its content width as the listbox re-rendered while typing or arrowing.
const rootStyle = computed(() => {
  const style: Record<string, string | number> = { position: "fixed", top: 0, left: 0 };
  if (display.value !== undefined) style.display = display.value;
  if (props.minWidth !== undefined) style.minWidth = props.minWidth;
  return style;
});

// Runs after the DOM patch so `root.value` is already attached once
// `shouldRender` turns true — mirrors the React version's `useLayoutEffect`.
watch(
  [
    resolvedAnchor,
    shouldRender,
    () => props.placement,
    () => props.modifiers,
    () => props.popperOptions,
    () => props.matchAnchorWidth,
    () => props.disablePortal,
  ],
  ([anchor, render], _old, onCleanup) => {
    if (!anchor || !render || !root.value) return;

    let popperModifiers: Array<Partial<Modifier<string, object>>> = [
      { name: "preventOverflow", options: { altBoundary: props.disablePortal } },
      { name: "flip", options: { altBoundary: props.disablePortal } },
      {
        name: "onUpdate",
        enabled: true,
        phase: "afterWrite",
        fn: ({ state }) => {
          placement.value = state.placement;
        },
      },
    ];

    if (props.matchAnchorWidth) {
      // `"min"` writes the floor and leaves `width` alone, so whatever the
      // caller put in `style` still decides how wide the panel actually is.
      const property = props.matchAnchorWidth === "min" ? "minWidth" : "width";
      popperModifiers.push({
        name: "matchAnchorWidth",
        enabled: true,
        phase: "beforeWrite",
        requires: ["computeStyles"],
        fn: ({ state }) => {
          state.styles.popper[property] = `${state.rects.reference.width}px`;
        },
        // Sized once up front too, so the first paint is not a frame at the
        // wrong width that then snaps.
        effect: ({ state }) => {
          const reference = state.elements.reference as HTMLElement;
          state.elements.popper.style[property] = `${reference.getBoundingClientRect().width}px`;
        },
      });
    }

    if (props.modifiers) popperModifiers = popperModifiers.concat(props.modifiers);
    if (props.popperOptions?.modifiers) {
      popperModifiers = popperModifiers.concat(props.popperOptions.modifiers);
    }

    popperInstance.value = createPopper(anchor, root.value, {
      // Must agree with the `position: fixed` this component puts on the root.
      // Popper.js defaults to `absolute` and writes that onto the element; the
      // two only differ once the instance is destroyed, at which point the
      // style restored below would resolve against the wrong offset parent —
      // the popper would jump to a corner mid-close.
      strategy: "fixed",
      placement: props.placement,
      ...props.popperOptions,
      modifiers: popperModifiers,
    });

    const popperElement = root.value;
    onCleanup(() => {
      const instance = popperInstance.value;
      popperInstance.value = null;
      if (!popperElement) {
        instance?.destroy();
        return;
      }
      const { style: nodeStyle } = popperElement;
      const position = nodeStyle.position;
      const top = nodeStyle.top;
      const left = nodeStyle.left;
      const transform = nodeStyle.transform;
      instance?.destroy();
      nodeStyle.position = position;
      nodeStyle.top = top;
      nodeStyle.left = left;
      nodeStyle.transform = transform;
    });
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  popperInstance.value?.destroy();
  popperInstance.value = null;
});

function handleEnter() {
  exited.value = false;
}

function handleExited() {
  exited.value = true;
}

defineExpose({ popperInstance });
</script>

<template>
  <Teleport :to="target" :disabled="disablePortal">
    <div
      v-if="shouldRender"
      ref="root"
      v-bind="restAttrs"
      :role="role"
      :class="rootClass"
      :style="[rootStyle, attrs.style]"
    >
      <slot
        :placement="placement"
        :transition-props="
          transition ? { in: open, onEnter: handleEnter, onExited: handleExited } : undefined
        "
      />
    </div>
  </Teleport>
</template>
