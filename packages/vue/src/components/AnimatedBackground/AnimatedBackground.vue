<script lang="ts">
import type {
  Beacon,
  BackgroundQuality,
  Burst,
  Nebula,
  Spark,
  Sparkle,
  Spoke,
  Star,
} from "./AnimatedBackground.types";

/**
 * Element budget per quality tier: [far stars, near stars, beacons, bursts].
 *
 * The nebulae are deliberately not on this list — the wide soft washes are
 * the whole look, they are eight elements total, and now that their filters
 * are cached they are close to free. What scales is the small stuff.
 */
const BUDGET: Record<BackgroundQuality, [number, number, number, number]> = {
  low: [55, 14, 2, 2],
  medium: [90, 24, 3, 3],
  high: [140, 36, 4, 4],
};

/** Spokes per firework burst. */
const SPOKES = 10;

/**
 * Mulberry32 — a tiny deterministic PRNG.
 *
 * Star fields have to be random-looking but *stable*: the same positions on
 * every render, in every process. A seeded generator gives that for free.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

function makeStars(count: number, seed: number, minR: number, maxR: number): Star[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: round(rng() * 1000),
    cy: round(rng() * 1000),
    r: round(minR + rng() * (maxR - minR)),
    dur: round(2.4 + rng() * 5.2),
    delay: round(rng() * -8),
  }));
}

// Generated once at the largest budget, then sliced per quality — the field
// only ever gets denser, so lowering quality never reshuffles the sky.
const FAR_STARS = makeStars(BUDGET.high[0], 0x5eed, 0.5, 1.1);
const NEAR_STARS = makeStars(BUDGET.high[1], 0xd00d, 1.2, 1.36);

// Hand-placed so the composition reads deliberately rather than scattered.
const NEBULAE: Nebula[] = [
  { x: 95, y: -12, w: 104, ar: 1.3, hue: 1, dur: 34, delay: -2, driftX: -40, driftY: 26 },
  { x: 4, y: 82, w: 90, ar: 1.05, hue: 2, dur: 41, delay: -11, driftX: 34, driftY: -30 },
  { x: 76, y: -10, w: 48, ar: 1.1, hue: 1, dur: 29, delay: -6, driftX: 30, driftY: 34 },
  {
    x: 30,
    y: 47,
    w: 76,
    ar: 1.2,
    hue: 3,
    veil: true,
    dur: 37,
    delay: -15,
    driftX: -30,
    driftY: -22,
  },
  {
    x: 100,
    y: 108,
    w: 80,
    ar: 1.05,
    hue: 4,
    veil: true,
    dur: 45,
    delay: -4,
    driftX: -26,
    driftY: 30,
  },
  { x: 18, y: 126, w: 88, ar: 1.35, hue: 5, dur: 39, delay: -19, driftX: 38, driftY: -18 },
  { x: 48, y: -34, w: 60, ar: 1.2, hue: 2, dur: 31, delay: -9, driftX: 24, driftY: 28 },
  { x: -2, y: -2, w: 64, ar: 1.1, hue: 3, veil: true, dur: 43, delay: -24, driftX: 30, driftY: 24 },
];

// Long cycles with staggered negative delays: each flare occupies ~18% of its
// own period, so with four of them the sky lights up every few seconds
// without any two ever igniting together.
const BEACONS: Beacon[] = [
  { cx: 220, cy: 240, dur: 26, delay: -1 },
  { cx: 780, cy: 420, dur: 31, delay: -9 },
  { cx: 480, cy: 760, dur: 28, delay: -17 },
  { cx: 900, cy: 140, dur: 34, delay: -24 },
  { cx: 140, cy: 820, dur: 29, delay: -6 },
  { cx: 640, cy: 60, dur: 36, delay: -30 },
];

// A handful of little suns — the four-point diffraction sparkle you get off
// a bright point through a lens.
const SPARKLES: Sparkle[] = [
  { cx: 815, cy: 235, size: 7, dur: 9, delay: -1 },
  { cx: 415, cy: 745, size: 5, dur: 11, delay: -5 },
  { cx: 655, cy: 505, size: 4, dur: 13, delay: -8 },
];

/**
 * A four-point sparkle centred on the origin.
 *
 * Each arm is a quadratic curve that passes through the centre, so the waist
 * pinches to nothing and the points stay needle-sharp — a plain polygon
 * gives flat, blunt arms that read as a diamond instead of a glint.
 */
const sparklePath = (r: number) =>
  `M 0 ${-r} Q 0 0 ${r} 0 Q 0 0 0 ${r} Q 0 0 ${-r} 0 Q 0 0 0 ${-r} Z`;

// Steep and slow: a full crossing takes ~22% of a ~90s cycle, so a streak is
// something you catch rather than something you watch on a timer.
const SPARKS: Spark[] = [
  { x: 120, y: -80, angle: 68, len: 300, dur: 88, delay: -4 },
  { x: 620, y: -120, angle: 74, len: 260, dur: 96, delay: -38 },
  { x: 380, y: -60, angle: 62, len: 330, dur: 104, delay: -71 },
];

// Deliberately tiny: these are meant to read as a distant sparkle catching
// your eye, not as a display going off in the foreground.
const BURSTS: Burst[] = [
  { cx: 740, cy: 300, radius: 31, dur: 23, delay: -3, seed: 0xb00 },
  { cx: 860, cy: 640, radius: 26, dur: 29, delay: -14, seed: 0xcafe },
  { cx: 620, cy: 150, radius: 29, dur: 26, delay: -21, seed: 0xf00d },
  { cx: 955, cy: 430, radius: 28, dur: 25, delay: -9, seed: 0x1dea },
  { cx: 700, cy: 810, radius: 24, dur: 31, delay: -18, seed: 0xbeef },
  { cx: 545, cy: 385, radius: 27, dur: 27, delay: -25, seed: 0xace },
];

/** Even spacing, jittered — the difference between organic and mechanical. */
function makeSpokes(seed: number, radius: number): Spoke[] {
  const rng = mulberry32(seed);
  return Array.from({ length: SPOKES }, (_, i) => ({
    angle: round((360 / SPOKES) * i + (rng() - 0.5) * 22),
    len: round(radius * (0.55 + rng() * 0.45)),
    delay: round(rng() * 0.12),
  }));
}

/** Maps a spoke index to one of the three firework gradients, round-robin. */
const spokeGradientSlot = (index: number) => ((index % 3) + 1) as 1 | 2 | 3;
</script>

<script setup lang="ts">
import { computed, onMounted, ref, useId, useTemplateRef, watchEffect } from "vue";
import "@okkly/design-system/components/AnimatedBackground/AnimatedBackground.scss";
import type { AnimatedBackgroundProps } from "./AnimatedBackground.types";

const props = withDefaults(defineProps<AnimatedBackgroundProps>(), {
  preset: "aurora",
  quality: "medium",
  parallax: true,
  fireworks: true,
  respectReducedMotion: true,
  scrim: false,
});

defineSlots<{
  /** Rendered above the scene — e.g. a hero section's headline. */
  default?: () => unknown;
}>();

const rawId = useId().replace(/:/g, "");
const grainId = `okkly-bg-grain-${rawId}`;
const starGlowId = `okkly-bg-star-${rawId}`;
const beaconCoreId = `okkly-bg-beacon-core-${rawId}`;
const beaconHaloId = `okkly-bg-beacon-halo-${rawId}`;
const sparkleCoreId = `okkly-bg-sparkle-core-${rawId}`;
const sparkleGlowId = `okkly-bg-sparkle-glow-${rawId}`;
const sparkGradId = `okkly-bg-spark-${rawId}`;
const fwId = (slot: number) => `okkly-bg-fw${slot}-${rawId}`;

// Nothing PixiJS-ish is left, but the scene is still decorative chrome that
// has no business in server output — and the pointer listener needs a
// client anyway. Rendering on mount keeps both simple.
const mounted = ref(false);
const svgRef = useTemplateRef<SVGSVGElement>("svgRef");

onMounted(() => {
  mounted.value = true;
});

// Parallax writes custom properties straight onto the node. Going through
// reactive state here would re-render the entire star field on every mouse
// move.
watchEffect((onCleanup) => {
  if (!mounted.value || !props.parallax) return;

  const onPointerMove = (event: PointerEvent) => {
    const svg = svgRef.value;
    if (!svg) return;
    svg.style.setProperty(
      "--okkly-animated-background-px",
      String(round((event.clientX / window.innerWidth - 0.5) * -2)),
    );
    svg.style.setProperty(
      "--okkly-animated-background-py",
      String(round((event.clientY / window.innerHeight - 0.5) * -2)),
    );
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  onCleanup(() => window.removeEventListener("pointermove", onPointerMove));
});

const farCount = computed(() => BUDGET[props.quality][0]);
const nearCount = computed(() => BUDGET[props.quality][1]);
const beaconCount = computed(() => BUDGET[props.quality][2]);
const burstCount = computed(() => BUDGET[props.quality][3]);

const farStars = computed(() => FAR_STARS.slice(0, farCount.value));
const nearStars = computed(() => NEAR_STARS.slice(0, nearCount.value));
const beacons = computed(() => BEACONS.slice(0, beaconCount.value));
const bursts = computed(() =>
  BURSTS.slice(0, burstCount.value).map((burst) => ({
    ...burst,
    spokes: makeSpokes(burst.seed, burst.radius),
  })),
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-animated-background",
    props.preset !== "aurora" && `okkly-animated-background--${props.preset}`,
    !props.respectReducedMotion && "okkly-animated-background--force-motion",
  ]
    .filter(Boolean)
    .join(" "),
);

function cloudClass(nebula: Nebula) {
  return [
    "okkly-animated-background__cloud",
    nebula.veil && "okkly-animated-background__cloud--veil",
  ]
    .filter(Boolean)
    .join(" ");
}

function cloudStyle(nebula: Nebula) {
  return {
    "--okkly-animated-background-hue": `var(--okkly-animated-background-n${nebula.hue})`,
    "--okkly-animated-background-x": `${nebula.x}%`,
    "--okkly-animated-background-y": `${nebula.y}%`,
    "--okkly-animated-background-w": `${nebula.w}%`,
    "--okkly-animated-background-ar": `${nebula.ar}`,
    "--okkly-animated-background-dur": `${nebula.dur}s`,
    "--okkly-animated-background-delay": `${nebula.delay}s`,
    "--okkly-animated-background-drift-x": `${nebula.driftX}px`,
    "--okkly-animated-background-drift-y": `${nebula.driftY}px`,
  };
}
</script>

<template>
  <div :class="classes">
    <!-- L1 — the wide soft washes. GPU-composited; see NEBULAE. -->
    <div v-if="mounted" class="okkly-animated-background__clouds" aria-hidden="true">
      <div
        v-for="(nebula, index) in NEBULAE"
        :key="index"
        :class="cloudClass(nebula)"
        :style="cloudStyle(nebula)"
      />
    </div>

    <svg
      v-if="mounted"
      ref="svgRef"
      class="okkly-animated-background__svg"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <!-- Warp a soft ellipse into filaments — the SVG stand-in for the
             domain-warped noise texture the Pixi scene generated. -->
        <filter :id="grainId" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
        </filter>

        <!-- Tight bright core, minimal halo — reads crisp, not fuzzy. -->
        <radialGradient :id="starGlowId">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="12%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop
            offset="30%"
            stop-color="var(--okkly-animated-background-star)"
            stop-opacity="0.28"
          />
          <stop offset="100%" stop-color="var(--okkly-animated-background-star)" stop-opacity="0" />
        </radialGradient>

        <!-- A far-off sun is a *tiny* hot core inside a wide, very faint halo. -->
        <radialGradient :id="beaconCoreId">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop
            offset="35%"
            stop-color="var(--okkly-animated-background-beacon)"
            stop-opacity="0.9"
          />
          <stop
            offset="100%"
            stop-color="var(--okkly-animated-background-beacon)"
            stop-opacity="0"
          />
        </radialGradient>

        <!-- The sparkle's arms stay near-white so it reads as a glint. -->
        <radialGradient :id="sparkleCoreId">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop
            offset="100%"
            stop-color="var(--okkly-animated-background-star)"
            stop-opacity="0.35"
          />
        </radialGradient>

        <radialGradient :id="sparkleGlowId">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
          <stop
            offset="30%"
            stop-color="var(--okkly-animated-background-star)"
            stop-opacity="0.16"
          />
          <stop offset="100%" stop-color="var(--okkly-animated-background-star)" stop-opacity="0" />
        </radialGradient>

        <radialGradient :id="beaconHaloId">
          <stop
            offset="0%"
            stop-color="var(--okkly-animated-background-beacon)"
            stop-opacity="0.22"
          />
          <stop
            offset="40%"
            stop-color="var(--okkly-animated-background-beacon)"
            stop-opacity="0.07"
          />
          <stop
            offset="100%"
            stop-color="var(--okkly-animated-background-beacon)"
            stop-opacity="0"
          />
        </radialGradient>

        <!-- Tail at x=0 fading to nothing, head at x=1 — the streak is one
             continuous line, never a row of dots. -->
        <linearGradient :id="sparkGradId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--okkly-animated-background-spark)" stop-opacity="0" />
          <stop
            offset="70%"
            stop-color="var(--okkly-animated-background-spark)"
            stop-opacity="0.5"
          />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="1" />
        </linearGradient>

        <radialGradient v-for="slot in [1, 2, 3]" :key="slot" :id="fwId(slot)">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop
            offset="55%"
            :stop-color="`var(--okkly-animated-background-fw${slot})`"
            stop-opacity="0.95"
          />
          <stop
            offset="100%"
            :stop-color="`var(--okkly-animated-background-fw${slot})`"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>

      <!-- L2 — stars, two depths -->
      <g class="okkly-animated-background__stars">
        <circle
          v-for="(star, index) in farStars"
          :key="`f${index}`"
          class="okkly-animated-background__star"
          :cx="star.cx"
          :cy="star.cy"
          :r="star.r"
          :style="{
            '--okkly-animated-background-dur': `${star.dur}s`,
            '--okkly-animated-background-delay': `${star.delay}s`,
          }"
        />
        <circle
          v-for="(star, index) in nearStars"
          :key="`n${index}`"
          class="okkly-animated-background__star okkly-animated-background__star--near"
          :cx="star.cx"
          :cy="star.cy"
          :r="star.r"
          :fill="`url(#${starGlowId})`"
          :style="{
            '--okkly-animated-background-dur': `${star.dur}s`,
            '--okkly-animated-background-delay': `${star.delay}s`,
          }"
        />
      </g>

      <!-- L3 — beacons -->
      <g>
        <g
          v-for="(beacon, index) in beacons"
          :key="index"
          class="okkly-animated-background__beacon"
          :style="{
            '--okkly-animated-background-dur': `${beacon.dur}s`,
            '--okkly-animated-background-delay': `${beacon.delay}s`,
          }"
        >
          <circle :cx="beacon.cx" :cy="beacon.cy" r="46" :fill="`url(#${beaconHaloId})`" />
          <circle :cx="beacon.cx" :cy="beacon.cy" r="4.5" :fill="`url(#${beaconCoreId})`" />
        </g>
      </g>

      <!-- L3b — little suns -->
      <g>
        <!-- The placement has to live on its own wrapper: a CSS `transform`
             from the animation replaces the `transform` attribute outright
             rather than composing with it, so putting both on one node drops
             the translate and stacks every sparkle at the viewBox origin. -->
        <g
          v-for="(sparkle, index) in SPARKLES"
          :key="index"
          :transform="`translate(${sparkle.cx} ${sparkle.cy})`"
        >
          <g
            class="okkly-animated-background__sparkle"
            :style="{
              '--okkly-animated-background-dur': `${sparkle.dur}s`,
              '--okkly-animated-background-delay': `${sparkle.delay}s`,
            }"
          >
            <circle cx="0" cy="0" :r="sparkle.size * 1.1" :fill="`url(#${sparkleGlowId})`" />
            <path :d="sparklePath(sparkle.size)" :fill="`url(#${sparkleCoreId})`" />
          </g>
        </g>
      </g>

      <!-- L4 — dante sparks -->
      <g>
        <g
          v-for="(spark, index) in SPARKS"
          :key="index"
          :transform="`translate(${spark.x} ${spark.y}) rotate(${spark.angle})`"
        >
          <rect
            class="okkly-animated-background__spark"
            x="0"
            y="-0.56"
            :width="spark.len"
            height="1.12"
            rx="0.56"
            :fill="`url(#${sparkGradId})`"
            :style="{
              '--okkly-animated-background-dur': `${spark.dur}s`,
              '--okkly-animated-background-delay': `${spark.delay}s`,
              '--okkly-animated-background-spark-x': '1500px',
              '--okkly-animated-background-spark-y': '0px',
            }"
          />
        </g>
      </g>

      <!-- L5 — micro-fireworks -->
      <g v-if="fireworks">
        <g
          v-for="(burst, burstIndex) in bursts"
          :key="burstIndex"
          :transform="`translate(${burst.cx} ${burst.cy})`"
        >
          <g
            v-for="(spoke, spokeIndex) in burst.spokes"
            :key="spokeIndex"
            class="okkly-animated-background__spoke"
            :transform="`rotate(${spoke.angle})`"
          >
            <g
              class="okkly-animated-background__spoke-body"
              :style="{
                '--okkly-animated-background-dur': `${burst.dur}s`,
                '--okkly-animated-background-delay': `${burst.delay + spoke.delay}s`,
                '--okkly-animated-background-spoke-r': `${spoke.len}px`,
              }"
            >
              <!-- tail behind the head, pointing back at the core -->
              <rect
                :x="-spoke.len * 0.8"
                y="-0.3"
                :width="spoke.len * 0.8"
                height="0.6"
                rx="0.3"
                :fill="`url(#${fwId(spokeGradientSlot(spokeIndex))})`"
                opacity="0.7"
              />
              <circle
                cx="0"
                cy="0"
                r="1.3"
                :fill="`url(#${fwId(spokeGradientSlot(spokeIndex))})`"
              />
            </g>
          </g>
        </g>
      </g>

      <!-- L6 — grain. Same split as the nebulae: the noise is generated
           once on the static rect, the wrapper does the drifting. -->
      <g class="okkly-animated-background__grain">
        <rect x="-5%" y="-5%" width="110%" height="110%" :filter="`url(#${grainId})`" />
      </g>
    </svg>

    <div v-if="scrim" class="okkly-animated-background__scrim" aria-hidden="true" />
    <div v-if="mounted" class="okkly-animated-background__bloom" aria-hidden="true" />
    <slot />
  </div>
</template>
