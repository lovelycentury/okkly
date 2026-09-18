<script lang="ts">
function defaultGetLabelText(value: number): string {
  return `${value} Star${value !== 1 ? "s" : ""}`;
}

function starKind(displayValue: number, index: number): "full" | "half" | "empty" {
  const position = index + 1;
  if (displayValue >= position) return "full";
  if (displayValue >= position - 0.5) return "half";
  return "empty";
}

function valueFromPointer(event: MouseEvent, index: number, precision: 0.5 | 1): number {
  if (precision === 1) return index + 1;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  return ratio <= 0.5 ? index + 0.5 : index + 1;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import "@okkly/design-system/components/Rating/Rating.scss";
import RatingGlyph from "./RatingGlyph.vue";
import type { RatingProps } from "./Rating.types";

const props = withDefaults(defineProps<RatingProps>(), {
  defaultValue: null,
  max: 5,
  precision: 0.5,
  size: "medium",
  color: "warning",
  icon: "star",
  readOnly: false,
  disabled: false,
  name: undefined,
  getLabelText: defaultGetLabelText,
});

const slots = defineSlots<{
  /** Custom filled glyph, overriding the built-in `"star"`/`"heart"` shape. */
  icon?: () => unknown;
  /** Trailing summary (e.g. "4.8 · 128 reviews"). */
  label?: () => unknown;
}>();

// Unlike React's manual `value !== undefined ? value : internalValue` split,
// `model.value` already resolves controlled vs. uncontrolled — `undefined`
// means genuinely unbound, so it's the only case that falls back to
// `defaultValue`.
const model = defineModel<number | null>();
const resolvedValue = computed<number | null>(() =>
  model.value !== undefined ? model.value : props.defaultValue,
);

const hoverValue = ref<number | null>(null);
const displayValue = computed(() => hoverValue.value ?? resolvedValue.value ?? 0);

function commit(next: number | null) {
  model.value = next;
}

function handleItemClick(event: MouseEvent, index: number) {
  if (props.readOnly || props.disabled) return;
  const next = valueFromPointer(event, index, props.precision);
  if (next === resolvedValue.value) commit(null);
  else commit(next);
}

function handleItemMove(event: MouseEvent, index: number) {
  if (props.readOnly || props.disabled) return;
  hoverValue.value = valueFromPointer(event, index, props.precision);
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.readOnly || props.disabled) return;
  const step = props.precision;
  const base = resolvedValue.value ?? 0;

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    commit(Math.min(props.max, base + step));
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    commit(Math.max(0, base - step) || null);
  }
}

const stars = computed(() =>
  Array.from({ length: props.max }, (_, index) => ({
    index,
    kind: starKind(displayValue.value, index),
    label: props.getLabelText(index + 1),
  })),
);

const interactive = computed(() => !props.readOnly && !props.disabled);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-rating",
    props.color !== "warning" && `okkly-rating--color-${props.color}`,
    props.size !== "medium" && `okkly-rating--${props.size}`,
    props.readOnly && "okkly-rating--read-only",
    props.disabled && "okkly-rating--disabled",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <span
    :class="classes"
    :role="interactive ? 'radiogroup' : 'img'"
    :aria-label="!interactive ? `${displayValue} of ${max}` : undefined"
    @mouseleave="hoverValue = null"
  >
    <span class="okkly-rating__stars">
      <template v-for="star in stars" :key="star.index">
        <span v-if="!interactive" class="okkly-rating__item" aria-hidden="true">
          <RatingGlyph v-if="slots.icon" :kind="star.kind" :glyph="icon"
            ><slot name="icon"
          /></RatingGlyph>
          <RatingGlyph v-else :kind="star.kind" :glyph="icon" />
        </span>
        <button
          v-else
          type="button"
          class="okkly-rating__item"
          :name="name"
          :aria-label="star.label"
          @click="handleItemClick($event, star.index)"
          @mousemove="handleItemMove($event, star.index)"
          @keydown="handleKeyDown"
        >
          <RatingGlyph v-if="slots.icon" :kind="star.kind" :glyph="icon"
            ><slot name="icon"
          /></RatingGlyph>
          <RatingGlyph v-else :kind="star.kind" :glyph="icon" />
        </button>
      </template>
    </span>
    <span v-if="slots.label" class="okkly-rating__label"><slot name="label" /></span>
  </span>
</template>
