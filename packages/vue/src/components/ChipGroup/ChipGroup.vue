<script setup lang="ts">
import { computed, normalizeClass, useAttrs } from "vue";
import "@okkly/design-system/components/ChipGroup/ChipGroup.scss";
import Chip from "../Chip/Chip.vue";
import type { ChipGroupItem, ChipGroupProps } from "./ChipGroup.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ChipGroupProps>(), {
  items: undefined,
  exclusive: false,
  color: "primary",
  disabled: false,
});

const slots = defineSlots<{
  /** Custom chip nodes — no built-in selection wiring. */
  default?: () => unknown;
}>();

const model = defineModel<string | string[]>();

const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-chip-group",
    props.color !== "primary" && `okkly-chip-group--color-${props.color}`,
    props.disabled && "okkly-chip-group--disabled",
    attrs.class,
  ]),
);

// See the "Deliberate simplification" note in ChipGroup.types.ts.
const isSelectable = computed(() => props.exclusive || model.value !== undefined);
const hasGroupRole = computed(
  () => !!props.items && (isSelectable.value || props.items.some((item) => item.onClick)),
);

function itemKey(item: ChipGroupItem, index: number) {
  return item.value ?? String(index);
}

function isItemSelected(itemValue: string, item: ChipGroupItem) {
  if (model.value !== undefined) {
    return props.exclusive
      ? model.value === itemValue
      : Array.isArray(model.value) && model.value.includes(itemValue);
  }
  return item.selected ?? false;
}

function handleToggle(event: MouseEvent | KeyboardEvent, item: ChipGroupItem, itemValue: string) {
  if (props.disabled || item.disabled) return;

  if (props.exclusive) {
    model.value = itemValue;
  } else {
    const current = Array.isArray(model.value) ? model.value : [];
    model.value = current.includes(itemValue)
      ? current.filter((entry) => entry !== itemValue)
      : [...current, itemValue];
  }

  item.onClick?.(event, item);
}

// `:onClick` (`v-bind`), not `@click` (`v-on`): a call-expression bound with
// `v-on` compiles to an inline statement that *invokes* this function and
// discards whatever it returns, rather than using the return value as the
// listener — `v-bind`ing the `onClick` vnode prop directly is what actually
// leaves the listener attached, or omits it, per chip.
function clickHandlerFor(item: ChipGroupItem, itemValue: string) {
  if (!isSelectable.value && !item.onClick) return undefined;
  return (event: MouseEvent | KeyboardEvent) => handleToggle(event, item, itemValue);
}
</script>

<template>
  <div :class="classes" v-bind="restAttrs" :role="hasGroupRole ? 'group' : undefined">
    <template v-if="items">
      <Chip
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
        :selected="isItemSelected(itemKey(item, index), item)"
        :disabled="disabled || item.disabled"
        :removable="!!item.onRemove"
        :onClick="clickHandlerFor(item, itemKey(item, index))"
        @remove="item.onRemove?.($event, item)"
        >{{ item.label }}</Chip
      >
    </template>
    <slot v-else />
  </div>
</template>
