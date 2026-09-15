<script setup lang="ts">
import { computed } from "vue";
import { resolveBoxSystemProps } from "@okkly/shared";
import "@okkly/design-system/components/Box/Box.scss";
import type { BoxProps } from "./Box.types";

const props = withDefaults(defineProps<BoxProps>(), {
  as: "div",
  container: false,
  m: undefined,
  mx: undefined,
  my: undefined,
  mt: undefined,
  mr: undefined,
  mb: undefined,
  ml: undefined,
  p: undefined,
  px: undefined,
  py: undefined,
  pt: undefined,
  pr: undefined,
  pb: undefined,
  pl: undefined,
  gap: undefined,
  rowGap: undefined,
  columnGap: undefined,
  display: undefined,
  flexDirection: undefined,
  flexWrap: undefined,
  alignItems: undefined,
  justifyContent: undefined,
  alignSelf: undefined,
  flexGrow: undefined,
  flexShrink: undefined,
  flexBasis: undefined,
  width: undefined,
  height: undefined,
  minWidth: undefined,
  maxWidth: undefined,
  minHeight: undefined,
  maxHeight: undefined,
  bgcolor: undefined,
  color: undefined,
  border: undefined,
  borderColor: undefined,
  borderRadius: undefined,
});

defineSlots<{
  /** Content of the box. */
  default?: () => unknown;
}>();

// Every system prop becomes a class plus the CSS variable it reads — the same
// resolution @okkly/react's Box runs. Everything else is an attribute, which
// falls through to the element on its own; Vue merges a consumer's `class`
// and `style` after these.
const system = computed(() => {
  const { as: _as, ...systemProps } = props;
  return resolveBoxSystemProps(systemProps);
});
</script>

<template>
  <component
    :is="as"
    :class="['okkly-component', 'okkly-box', system.className]"
    :style="system.style"
  >
    <slot />
  </component>
</template>
