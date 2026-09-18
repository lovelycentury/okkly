<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  computed,
  normalizeClass,
  onUnmounted,
  ref,
  useId,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from "vue";
import "@okkly/design-system/components/Tooltip/Tooltip.scss";
import Grow from "../Grow/Grow.vue";
import Popper from "../Popper/Popper.vue";
import type { TooltipProps } from "./Tooltip.types";

/** Keeps the arrow clear of a rounded corner. */
const ARROW_PADDING = 8;

/**
 * Grace period for reaching an interactive tooltip.
 *
 * The bubble is offset a few pixels off its anchor, and that gap belongs to
 * neither of them — leaving the trigger to walk into the tooltip still fires
 * `mouseleave`. With a `leaveDelay` of 0 the close timer fires on the next
 * tick, long before a pointer can cross, so an interactive tooltip would be
 * unreachable. This is the floor that makes the trip possible; entering the
 * bubble cancels the timer.
 */
const INTERACTIVE_LEAVE_DELAY = 120;

const props = withDefaults(defineProps<TooltipProps>(), {
  title: undefined,
  placement: "top",
  defaultOpen: false,
  enterDelay: 200,
  leaveDelay: 0,
  arrow: true,
  disableHoverListener: false,
  disableFocusListener: false,
  interactive: true,
  describeChild: false,
  transitionDuration: "auto",
});

const emit = defineEmits<{
  open: [];
  close: [];
}>();

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** The single element that triggers the tooltip. */
  default?: () => unknown;
  /** Rich tooltip content — overrides `title`. */
  title?: () => unknown;
}>();

// Accordion-style: an explicit `default: undefined` keeps the unbound case
// genuinely `undefined` rather than Vue's Boolean-prop absent-value `false`
// — see Accordion.vue for the full explanation.
const openModel = defineModel<boolean | undefined>("open", { default: undefined });

const tooltipId = useId();
let enterTimer: ReturnType<typeof setTimeout> | undefined;
let leaveTimer: ReturnType<typeof setTimeout> | undefined;

const anchorEl = ref<HTMLElement | null>(null);
const arrowRef = useTemplateRef<HTMLSpanElement>("arrowRef");

const openState = computed(() =>
  openModel.value !== undefined ? openModel.value : props.defaultOpen,
);
const hasTitleSlot = computed(() => !!slots.title);
const isOpen = computed(() => openState.value && (hasTitleSlot.value || !!props.title));

function clearTimers() {
  if (enterTimer) clearTimeout(enterTimer);
  if (leaveTimer) clearTimeout(leaveTimer);
}

function setOpen(next: boolean) {
  openModel.value = next;
  if (next) emit("open");
  else emit("close");
}

function scheduleOpen() {
  clearTimers();
  enterTimer = setTimeout(() => setOpen(true), props.enterDelay);
}

function scheduleClose() {
  clearTimers();
  const delay = props.interactive
    ? Math.max(props.leaveDelay, INTERACTIVE_LEAVE_DELAY)
    : props.leaveDelay;
  leaveTimer = setTimeout(() => setOpen(false), delay);
}

onUnmounted(clearTimers);

// Mirrors React's `Children.toArray(children).filter(isValidElement)`, with
// one extra step React doesn't need: a slot's root can be a `Fragment`
// vnode rather than the trigger element directly, so fragments have to be
// flattened before whitespace text/comment nodes are dropped and what's
// left is the real trigger vnode.
function flattenSlotChildren(nodes: VNode[]): VNode[] {
  const result: VNode[] = [];
  for (const node of nodes) {
    if (node.type === Fragment)
      result.push(...flattenSlotChildren((node.children as VNode[]) ?? []));
    else if (node.type !== Text && node.type !== Comment) result.push(node);
  }
  return result;
}

const originalTrigger = computed<VNode | undefined>(
  () => flattenSlotChildren((slots.default?.() as VNode[] | undefined) ?? [])[0],
);

// A description is not a name. An icon button whose only label is its tooltip was
// announced as a bare "button", because `aria-describedby` is all this used to
// contribute — and only while open at that. So: when the trigger has a name of its
// own, the tooltip stays a description; when it has none, the tooltip becomes the
// name, permanently rather than on hover.
//
// `anchorEl` is null on the first render, so a text trigger is briefly treated as
// nameless; the ref lands in the same commit and the tree is correct before
// anything can read it.
const childAriaLabel = computed(
  () =>
    (originalTrigger.value?.props as Record<string, unknown> | null)?.["aria-label"] as
      string | undefined,
);
const triggerHasOwnName = computed(
  () => Boolean(childAriaLabel.value) || Boolean(anchorEl.value?.textContent?.trim()),
);

const namingProps = computed<Record<string, string | undefined>>(() => {
  if (props.describeChild || triggerHasOwnName.value) {
    return { "aria-describedby": isOpen.value ? tooltipId : undefined };
  }
  if (!hasTitleSlot.value) {
    return { "aria-label": props.title };
  }
  return { "aria-labelledby": isOpen.value ? tooltipId : undefined };
});

// A raw vnode (from `cloneVNode`) can't be dropped straight into a
// `<template>` the way a component/tag name can via `:is` — it has to be
// returned from a render function. This one plain function, invoked as a
// functional component via `<component :is="Trigger" />` below, is the
// template-only escape hatch for rendering an already-built vnode.
//
// The clone happens inside this function rather than in a `computed`, so
// `cloneVNode`'s `ref` gets normalized while Vue is actually mid-render
// (the only time it has a rendering-instance context to attach the ref to)
// — building it inside a `computed` instead evaluates it lazily, outside
// any render pass, which leaves the ref ownerless and crashes on unmount.
//
// `cloneVNode` merges these onto whatever props/listeners the caller's
// trigger element already carries — Vue's equivalent of React's
// `cloneElement(children, { ref, className, onMouseEnter, ... })`. Its class
// and event-listener merging happen automatically, so there's no need to
// manually chain the trigger's own handlers the way React does.
function Trigger() {
  const original = originalTrigger.value;
  if (!original) return null;
  return cloneVNode(
    original,
    {
      // Most real triggers (a `<Button>`, an `<IconButton>`) are Vue
      // components, not raw elements — a ref on a component vnode resolves
      // to its public instance, not its DOM node, so `$el` has to be
      // unwrapped explicitly. A plain-element trigger (a bare `<button>`)
      // still resolves `el` straight to the node itself.
      ref: (el: Element | ComponentPublicInstance | null) => {
        const node = el && "$el" in el ? (el.$el as Element | null) : el;
        anchorEl.value = node instanceof HTMLElement ? node : null;
      },
      class: "okkly-tooltip__trigger",
      ...namingProps.value,
      onMouseenter: () => {
        if (!props.disableHoverListener) scheduleOpen();
      },
      onMouseleave: () => {
        if (!props.disableHoverListener) scheduleClose();
      },
      onFocus: () => {
        if (!props.disableFocusListener) setOpen(true);
      },
      onBlur: () => {
        if (!props.disableFocusListener) setOpen(false);
      },
    },
    true,
  );
}

const tooltipClasses = computed(() =>
  normalizeClass(["okkly-tooltip", props.interactive && "okkly-tooltip--interactive"]),
);

const modifiers = computed(() => [
  { name: "offset", options: { offset: [0, props.arrow ? 10 : 6] } },
  ...(props.arrow && arrowRef.value
    ? [{ name: "arrow", options: { element: arrowRef.value, padding: ARROW_PADDING } }]
    : []),
]);

function popupClasses(resolvedPlacement: string) {
  return normalizeClass([
    "okkly-tooltip__popup",
    `okkly-tooltip__popup--${resolvedPlacement.split("-")[0]}`,
    !props.arrow && "okkly-tooltip__popup--no-arrow",
  ]);
}

// Arriving in the tooltip cancels the pending close; leaving it starts a new
// one. Without the first of these, a tooltip you reach for vanishes exactly
// as you get there.
function handlePopperMouseEnter() {
  if (props.interactive) clearTimers();
}
function handlePopperMouseLeave() {
  if (props.interactive) scheduleClose();
}
</script>

<template>
  <component :is="Trigger" />
  <Popper
    :open="isOpen"
    :anchor-el="anchorEl"
    :placement="placement"
    transition
    role="presentation"
    :class="tooltipClasses"
    :modifiers="modifiers"
    @mouseenter="handlePopperMouseEnter"
    @mouseleave="handlePopperMouseLeave"
  >
    <template #default="{ placement: resolvedPlacement, transitionProps }">
      <Grow
        :in="transitionProps!.in"
        :timeout="transitionDuration"
        @enter="transitionProps!.onEnter"
        @exited="transitionProps!.onExited"
      >
        <!-- `data-popper-placement` is what the arrow's CSS keys off, so it
             follows the side the tooltip actually landed on after a flip,
             not the side originally requested. -->
        <div :class="popupClasses(resolvedPlacement)" :data-popper-placement="resolvedPlacement">
          <span :id="tooltipId" class="okkly-tooltip__bubble" role="tooltip">
            <slot name="title">{{ title }}</slot>
          </span>
          <span
            v-if="arrow"
            ref="arrowRef"
            class="okkly-tooltip__arrow"
            data-popper-arrow=""
            aria-hidden="true"
          />
        </div>
      </Grow>
    </template>
  </Popper>
</template>
