<script lang="ts">
/**
 * The mark is authored at 72×72 in Figma; every number below is in that space,
 * so the geometry can be compared against the source export line for line.
 */
const VB = 72;
const STROKE = 3.375;

/** Ring inset by half a stroke so the outline sits flush inside the box. */
const RING_R = VB / 2 - STROKE / 2;

/**
 * The glyph's own bounds, stroke included, padded to a square on its narrow
 * axis: the ink spans x 20.8125–52.875 and y 20.8125–54.5625, which half a
 * stroke either side grows to 35.4375 × 37.125.
 */
const GLYPH_BOX = { x: 18.28125, y: 19.125, size: 37.125 };

/**
 * Cropping to the glyph magnifies everything by VB/size, so pre-shrink the
 * stroke by the same factor and `pure` carries the weight the others do.
 */
const PURE_STROKE = (STROKE * GLYPH_BOX.size) / VB;
</script>

<script setup lang="ts">
import { computed, useId } from "vue";
import "@okkly/design-system/components/Logo/Logo.scss";
import LogoGlyph from "./LogoGlyph.vue";
import type { LogoProps } from "./Logo.types";

const props = withDefaults(defineProps<LogoProps>(), {
  layout: "horizontal",
  variant: "filled",
  tone: "multi",
  label: "okkly",
  showLabel: true,
});

const rawId = useId().replace(/:/g, "");
const gradientId = computed(() => `okkly-logo-gradient-${rawId}`);
const isMulti = computed(() => props.tone === "multi");

// "multi" keeps the signature mint→dante sweep; every other tone is flat, so
// it paints straight from the tone variable and needs no gradient at all.
const ink = computed(() =>
  isMulti.value ? `url(#${gradientId.value})` : "var(--okkly-logo-tone)",
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-logo",
    props.layout !== "horizontal" && `okkly-logo--${props.layout}`,
    props.variant !== "filled" && `okkly-logo--${props.variant}`,
    !isMulti.value && `okkly-logo--tone-${props.tone}`,
  ]
    .filter(Boolean)
    .join(" "),
);

const cssVars = computed(() =>
  props.size !== undefined
    ? {
        "--okkly-logo-emblem-size": typeof props.size === "number" ? `${props.size}px` : props.size,
      }
    : undefined,
);
</script>

<template>
  <div :class="classes" :style="cssVars">
    <svg
      v-if="variant === 'pure'"
      class="okkly-logo__emblem"
      :viewBox="`${GLYPH_BOX.x} ${GLYPH_BOX.y} ${GLYPH_BOX.size} ${GLYPH_BOX.size}`"
      fill="none"
      :stroke="ink"
      :stroke-width="PURE_STROKE"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs v-if="isMulti">
        <linearGradient
          :id="gradientId"
          x1="0"
          y1="0"
          :x2="VB"
          :y2="VB"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--okkly-logo-gradient-start)" />
          <stop offset="1" stop-color="var(--okkly-logo-gradient-end)" />
        </linearGradient>
      </defs>
      <LogoGlyph />
    </svg>
    <svg
      v-else-if="variant === 'outlined'"
      class="okkly-logo__emblem"
      :viewBox="`0 0 ${VB} ${VB}`"
      :stroke="ink"
      fill="none"
      :stroke-width="STROKE"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs v-if="isMulti">
        <linearGradient
          :id="gradientId"
          x1="0"
          y1="0"
          :x2="VB"
          :y2="VB"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--okkly-logo-gradient-start)" />
          <stop offset="1" stop-color="var(--okkly-logo-gradient-end)" />
        </linearGradient>
      </defs>
      <circle :cx="VB / 2" :cy="VB / 2" :r="RING_R" />
      <LogoGlyph />
    </svg>
    <svg
      v-else
      class="okkly-logo__emblem"
      :viewBox="`0 0 ${VB} ${VB}`"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs v-if="isMulti">
        <linearGradient
          :id="gradientId"
          x1="0"
          y1="0"
          :x2="VB"
          :y2="VB"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--okkly-logo-gradient-start)" />
          <stop offset="1" stop-color="var(--okkly-logo-gradient-end)" />
        </linearGradient>
      </defs>
      <circle :cx="VB / 2" :cy="VB / 2" :r="VB / 2" :fill="ink" />
      <g
        stroke="var(--okkly-logo-ink)"
        fill="none"
        :stroke-width="STROKE"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <LogoGlyph />
      </g>
    </svg>
    <span v-if="showLabel" class="okkly-logo__label">{{ label }}</span>
  </div>
</template>
