<script setup lang="ts">
import { computed, useAttrs, useTemplateRef } from "vue";
import "@okkly/design-system/components/Slider/Slider.scss";
import { useSlider } from "@okkly/vue-composables";
import type { SliderProps } from "./Slider.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SliderProps>(), {
  defaultValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  marks: false,
  orientation: "horizontal",
  disabled: false,
  color: "primary",
  size: "medium",
  valueLabelDisplay: "off",
  discrete: false,
  shiftStep: undefined,
  getAriaLabel: undefined,
  getAriaValueText: undefined,
  track: "normal",
  valueLabelFormat: (value: number) => String(value),
});

const emit = defineEmits<{
  changeCommitted: [value: number | number[]];
}>();

const model = defineModel<number | number[]>();
// `defaultValue` is only ever read here, never written into `model` — an
// eager write would emit `update:modelValue` on mount (setting `model.value`
// always emits, controlled or not), which React's lazy `useState` initializer
// never does since nothing calls `onChange` before the user acts.
const resolvedValue = computed(() =>
  model.value !== undefined
    ? model.value
    : props.defaultValue !== undefined
      ? props.defaultValue
      : props.min,
);

const attrs = useAttrs();
// `aria-label` doesn't land on the root — React reads it off the props and
// hands it to the hook, which applies it per-thumb instead (see the `label`
// option below), so it's pulled out of the fallthrough rest here too.
const restAttrs = computed(() => {
  const { class: _class, "aria-label": _ariaLabel, ...rest } = attrs;
  return rest;
});

const root = useTemplateRef<HTMLDivElement>("root");

const slider = useSlider(root, () => ({
  value: resolvedValue.value,
  min: props.min,
  max: props.max,
  step: props.step,
  discrete: props.discrete,
  shiftStep: props.shiftStep,
  disabled: props.disabled,
  marks: props.marks,
  orientation: props.orientation,
  label: attrs["aria-label"] as string | undefined,
  getAriaLabel: props.getAriaLabel,
  getAriaValueText: props.getAriaValueText,
  onChange: (next) => {
    model.value = next;
  },
  onCommit: (next) => {
    emit("changeCommitted", next);
  },
}));

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-slider",
    props.size !== "medium" && `okkly-slider--${props.size}`,
    props.color !== "primary" && `okkly-slider--color-${props.color}`,
    props.orientation === "vertical" && "okkly-slider--vertical",
    props.disabled && "okkly-slider--disabled",
    props.track === "inverted" && "okkly-slider--track-inverted",
    props.track === "none" && "okkly-slider--track-none",
    attrs.class,
  ]
    .filter(Boolean)
    .join(" "),
);

const axisPosition = computed(() => (props.orientation === "vertical" ? "bottom" : "left"));
const axisSize = computed(() => (props.orientation === "vertical" ? "height" : "width"));

const invertedTracks = computed(() => {
  if (props.track !== "inverted") return null;

  const values = slider.values.value;
  const toPercent = slider.valueToPercent;

  if (!slider.isRange.value) {
    const start = toPercent(values[0] ?? props.min);
    return [{ offset: start, length: 100 - start }];
  }

  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return [
    { offset: 0, length: toPercent(lo) },
    { offset: toPercent(hi), length: 100 - toPercent(hi) },
  ];
});

function showValueLabel(index: number) {
  if (props.valueLabelDisplay === "off") return false;
  if (props.valueLabelDisplay === "on") return true;
  return (
    slider.isDragging.value ||
    slider.activeThumbIndex.value === index ||
    slider.focusedThumbIndex.value === index
  );
}
</script>

<template>
  <div
    ref="root"
    v-bind="restAttrs"
    :class="classes"
    :style="slider.rootStyle.value"
    :aria-disabled="disabled || undefined"
    v-on="slider.rootEvents"
  >
    <div class="okkly-slider__rail" role="presentation" aria-hidden="true" />

    <div
      v-if="track === 'normal'"
      class="okkly-slider__track"
      role="presentation"
      aria-hidden="true"
      :style="slider.trackStyle.value"
    />

    <div
      v-for="(segment, index) in invertedTracks"
      :key="`inverted-${index}`"
      class="okkly-slider__track-inverted"
      role="presentation"
      aria-hidden="true"
      :style="{ [axisPosition]: `${segment.offset}%`, [axisSize]: `${segment.length}%` }"
    />

    <div v-if="slider.marksList.value.length > 0" class="okkly-slider__marks">
      <div v-for="mark in slider.marksList.value" :key="mark.value">
        <div
          :class="[
            'okkly-slider__mark',
            slider.isMarkActive(mark.value) && 'okkly-slider__mark--active',
          ]"
          :data-value="mark.value"
          aria-hidden="true"
          :style="slider.markStyle(mark)"
        />
        <span
          v-if="mark.label"
          class="okkly-slider__mark-label"
          :data-value="mark.value"
          aria-hidden="true"
          :style="slider.markLabelStyle(mark)"
          >{{ mark.label }}</span
        >
      </div>
    </div>

    <div
      v-for="(thumbValue, index) in slider.values.value"
      :key="index"
      class="okkly-slider__thumb"
      :class="{
        'okkly-slider__thumb--active':
          slider.activeThumbIndex.value === index || slider.focusedThumbIndex.value === index,
      }"
      :data-index="index"
      :style="slider.thumbStyle(index, thumbValue)"
    >
      <span v-if="showValueLabel(index)" class="okkly-slider__value-label">{{
        valueLabelFormat(thumbValue, index)
      }}</span>
      <span class="okkly-slider__handle" aria-hidden="true" />
      <input
        class="okkly-slider__input"
        v-bind="slider.thumbInputAttrs(index, thumbValue)"
        v-on="slider.thumbInputEvents"
      />
    </div>
  </div>
</template>
