<script setup lang="ts">
import { Comment, Fragment, Text, cloneVNode, computed, h, type VNode } from "vue";
import "@okkly/design-system/components/AvatarGroup/AvatarGroup.scss";
import type { AvatarGroupProps } from "./AvatarGroup.types";

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: 5,
  total: undefined,
  size: "sm",
  spacing: "default",
  ring: true,
  hues: () => ["mint"],
});

// The returned object is the runtime slots record — using it directly avoids
// the circular inference `useSlots()` hits when the same file declares them.
const slots = defineSlots<{
  /** `Avatar` elements to stack. Their own `size`/`color` are overridden by this component. */
  default?: () => unknown;
}>();

// Mirrors React's `Children.toArray(children).filter(isValidElement)`, with
// one extra step React doesn't need: a `v-for` in a slot compiles to a
// single keyed `Fragment` vnode wrapping the repeated children, not N
// sibling vnodes the way `{list.map(...)}` already is in JSX, so fragments
// have to be flattened before whitespace text/comment nodes are dropped and
// what's left is real `Avatar` vnodes.
function flattenSlotChildren(nodes: VNode[]): VNode[] {
  const result: VNode[] = [];
  for (const node of nodes) {
    if (node.type === Fragment)
      result.push(...flattenSlotChildren((node.children as VNode[]) ?? []));
    else if (node.type !== Text && node.type !== Comment) result.push(node);
  }
  return result;
}

const items = computed<VNode[]>(() =>
  flattenSlotChildren((slots.default?.() as VNode[] | undefined) ?? []),
);

const effectiveTotal = computed(() => props.total ?? items.value.length);
const renderedCount = computed(() =>
  items.value.length > props.max ? Math.max(props.max - 1, 0) : items.value.length,
);
const overflowCount = computed(() => effectiveTotal.value - renderedCount.value);

// `cloneVNode` merges these onto whatever props the caller's `<Avatar>`
// already carries — Vue's equivalent of React's `cloneElement(child, { size, color })`.
const renderedItems = computed(() =>
  items.value
    .slice(0, renderedCount.value)
    .map((vnode, index) =>
      cloneVNode(vnode, { size: props.size, color: props.hues[index % props.hues.length] }),
    ),
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-avatar-group",
    props.size !== "sm" && `okkly-avatar-group--${props.size}`,
    props.spacing !== "default" && `okkly-avatar-group--${props.spacing}`,
    !props.ring && "okkly-avatar-group--no-ring",
  ]
    .filter(Boolean)
    .join(" "),
);

// A raw vnode (from `cloneVNode`) can't be dropped straight into a `<template>`
// the way a component/tag name can via `:is` — it has to be returned from a
// render function. This one plain function, invoked as a functional component
// via `<component :is="Items" />` below, is the template-only escape hatch for
// rendering already-built vnodes. It has to return a single root (a
// `Fragment` wrapping the spans, not a bare array) — a raw array here is
// silently mishandled by Vue's dynamic-component resolution.
function Items() {
  const spans = renderedItems.value.map((vnode, index) =>
    h("span", { key: vnode.key ?? index, class: "okkly-avatar-group__item" }, [vnode]),
  );
  if (overflowCount.value > 0) {
    spans.push(
      h("span", { key: "overflow", class: "okkly-avatar-group__item" }, [
        h("span", { class: "okkly-avatar-group__overflow" }, `+${overflowCount.value}`),
      ]),
    );
  }
  return h(Fragment, spans);
}
</script>

<template>
  <div :class="classes">
    <component :is="Items" />
  </div>
</template>
