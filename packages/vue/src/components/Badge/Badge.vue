<script setup lang="ts">
import { computed, useSlots } from "vue";
import "@okkly/design-system/components/Badge/Badge.scss";
import type { BadgeProps } from "./Badge.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "standard",
  max: 99,
  invisible: false,
  overlap: "circular",
  anchorOrigin: () => ({ vertical: "top", horizontal: "right" }),
});

defineSlots<{
  /** Element the badge anchors to. Omit for a standalone pill/dot. */
  default?: () => unknown;
}>();

const slots = useSlots();
const standalone = computed(() => !slots.default);

const formatted = computed<string | number | undefined>(() => {
  if (props.variant === "dot") return undefined;
  const content = props.badgeContent;
  if (content == null) return undefined;
  if (typeof content === "number") {
    if (content === 0) return undefined;
    if (content > props.max) return `${props.max}+`;
  }
  return content;
});

const hidden = computed(() => {
  if (props.invisible) return true;
  if (props.variant === "dot") return false;
  return formatted.value == null;
});

const rootClasses = computed(() =>
  [
    "okkly-component",
    "okkly-badge",
    standalone.value && "okkly-badge--standalone",
    props.overlap === "rectangular" && "okkly-badge--overlap-rectangular",
    props.color && `okkly-badge--color-${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);

const contentClasses = computed(() =>
  [
    "okkly-badge__content",
    props.variant === "dot" && "okkly-badge__content--dot",
    hidden.value && "okkly-badge__content--invisible",
    !standalone.value && `okkly-badge__content--${props.anchorOrigin.vertical}`,
    !standalone.value && `okkly-badge__content--${props.anchorOrigin.horizontal}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <span :class="rootClasses" v-bind="$attrs">
    <span v-if="!standalone" class="okkly-badge__anchor"><slot /></span>
    <span
      :class="contentClasses"
      data-testid="badge-content"
      :aria-hidden="variant === 'dot' || hidden ? true : undefined"
      >{{ variant === "standard" ? formatted : "" }}</span
    >
  </span>
</template>
