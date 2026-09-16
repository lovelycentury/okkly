<script lang="ts">
/**
 * The editorial type scale, and the element each step renders as by default.
 * This map is the single source of truth: `TypographyVariant` (in
 * Typography.types.ts) is inferred from its keys, so adding a step here (and
 * its `&--<key>` block in Typography.scss) is the whole change — no union to
 * keep in sync.
 *
 * Mirrors TYPE_TOKENS in packages/figma-plugin/src/tokens/typography.ts.
 */
export const TYPOGRAPHY_VARIANTS = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h2",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-md": "span",
  "label-sm": "span",
  caption: "span",
  overline: "span",
  "mono-sm": "code",
} as const satisfies Record<string, string>;

const DEFAULT_VARIANT = "body-md" satisfies keyof typeof TYPOGRAPHY_VARIANTS;
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Typography/Typography.scss";
import type { TypographyProps } from "./Typography.types";

const props = withDefaults(defineProps<TypographyProps>(), {
  variant: DEFAULT_VARIANT,
  color: "inherit",
  align: "inherit",
  gutterBottom: false,
  noWrap: false,
  as: undefined,
});

defineSlots<{
  default?: () => unknown;
}>();

const element = computed(() => props.as ?? TYPOGRAPHY_VARIANTS[props.variant]);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-typography",
    props.variant !== DEFAULT_VARIANT && `okkly-typography--${props.variant}`,
    props.color !== "inherit" && `okkly-typography--color-${props.color}`,
    props.align !== "inherit" && `okkly-typography--align-${props.align}`,
    props.gutterBottom && "okkly-typography--gutter-bottom",
    props.noWrap && "okkly-typography--no-wrap",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <component :is="element" :class="classes">
    <slot />
  </component>
</template>
