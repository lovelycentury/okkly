<!--
  Internal sub-part of TimePicker — not exported from the package. A single
  scrollable value list (hours, minutes, or AM/PM) — a plain, MUI
  `MultiSectionDigitalClock`-style column: uniform rows, the selected one
  picked out with a filled pill, no wheel/fisheye effect. Built on native
  scrolling with CSS `scroll-snap` rather than a drag library, so the
  browser's own touch/trackpad momentum gives the "coast to a stop on a
  value" feel for free.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";

// Matches `--okkly-time-picker-row-height`'s default (2.5rem @ 16px root) —
// only used when the real rendered height can't be measured (e.g. a headless
// test environment with no layout engine, which always reports 0).
const FALLBACK_ROW_HEIGHT = 40;

/** `Element.scrollTo` isn't implemented everywhere — fall back to a plain jump. */
function scrollElementTo(el: HTMLElement, top: number, behavior: ScrollBehavior) {
  if (typeof el.scrollTo === "function") el.scrollTo({ top, behavior });
  else el.scrollTop = top;
}

const props = defineProps<{
  values: number[];
  value: number;
  formatValue: (value: number) => string;
  // Named `label`, not `ariaLabel`: Vue never camelCases a template's
  // `aria-*`/`data-*` bindings to match a declared prop, so `:aria-label`
  // would land in `$attrs` instead of this prop.
  label: string;
}>();

const emit = defineEmits<{
  "value-change": [value: number];
}>();

const viewport = useTemplateRef<HTMLDivElement>("viewport");
let rowHeight = FALLBACK_ROW_HEIGHT;
// Always holds "the value we last told the outside world about", updated the
// instant we call `emit` (scroll/click/keyboard) *and* by the sync watcher
// below. Comparing against it there is what tells an update apart as
// self-inflicted vs. genuinely external — see that watcher.
let lastReported = props.value;
// The scrollTop a smooth scroll *we* started is heading for. While set, the
// scroll listener ignores every intermediate position — otherwise the rows
// crossed on the way get committed as values (e.g. switching `format` from
// 13:00 re-dials the hour from row 13 to row 0 and emitted 12, 11, 10…, and a
// ResizeObserver re-centre mid-animation could strand it on one of them).
let programmaticTarget: number | null = null;

function indexOf(v: number): number {
  return Math.max(props.values.indexOf(v), 0);
}
// The list carries half a viewport of padding at each end (see
// `__column-container` in the SCSS), so centring row `i` is exactly
// `i * rowHeight` — every value can reach the middle, ends included.
function targetScrollTop(index: number): number {
  return index * rowHeight;
}

function smoothScrollToIndex(el: HTMLElement, index: number) {
  const top = targetScrollTop(index);
  programmaticTarget = top;
  scrollElementTo(el, top, "smooth");
}

// Land on the initial value with no animation, and measure the real rendered
// row height before the first paint (CSS sizes it in `rem`, so a hardcoded
// pixel constant would drift with the root font size). `offsetHeight`, not
// `getBoundingClientRect()`: the picker often mounts inside a Grow transition,
// whose `transform: scale()` would otherwise be measured as a smaller row.
// Re-measures on resize too — `DateTimePicker` pushes a taller viewport in via
// CSS var once it has measured the Calendar — and re-centres the value.
onMounted(() => {
  const el = viewport.value;
  if (!el) return;
  const measure = () => {
    const row = el.querySelector<HTMLElement>(".okkly-time-picker__slide");
    if (row?.offsetHeight) rowHeight = row.offsetHeight;
  };
  measure();
  el.scrollTop = targetScrollTop(indexOf(props.value));

  if (typeof ResizeObserver === "undefined") return;
  const observer = new ResizeObserver(() => {
    measure();
    // A hard jump supersedes any smooth scroll still in flight.
    programmaticTarget = null;
    el.scrollTop = targetScrollTop(indexOf(props.value));
  });
  observer.observe(el);
  onUnmounted(() => observer.disconnect());
});

// The list's native drag/momentum/snap does all the "inertia" work by
// itself — this only turns the settled scroll position back into a value
// (as soon as a new row crosses center, not just once scrolling fully stops).
onMounted(() => {
  const el = viewport.value;
  if (!el) return;
  const update = () => {
    const target = programmaticTarget;
    if (target !== null) {
      if (Math.abs(el.scrollTop - target) > 1) return;
      programmaticTarget = null;
    }
    const vals = props.values;
    const centered = el.scrollTop / rowHeight;
    const nearestIndex = Math.min(Math.max(Math.round(centered), 0), vals.length - 1);
    const nearest = vals[nearestIndex];
    if (nearest !== lastReported) {
      lastReported = nearest;
      emit("value-change", nearest);
    }
  };
  // Any real gesture hands control back to the user mid-animation.
  const releaseToUser = () => {
    programmaticTarget = null;
  };
  const userEvents = ["wheel", "touchstart", "pointerdown"] as const;
  el.addEventListener("scroll", update, { passive: true });
  for (const type of userEvents) el.addEventListener(type, releaseToUser, { passive: true });
  onUnmounted(() => {
    el.removeEventListener("scroll", update);
    for (const type of userEvents) el.removeEventListener(type, releaseToUser);
  });
});

// Reacts to *externally*-driven value changes only. An update whose `value`
// already matches `lastReported` was caused by us (the scroll listener above,
// or `commitIndex` below, both update that variable right before emitting) —
// the scroll position is already correct, or the user's gesture is still in
// progress and must not be interrupted. Force-scrolling on every one of
// those self-inflicted updates is what made scrolling feel robotic: it fought
// the browser's own momentum on every row crossed mid-drag. `flush: "post"`
// so the programmatic-scroll guard is in place before the browser fires the
// scroll event from clamping `scrollTop` when `values` shrinks — mirrors the
// React version's `useLayoutEffect`.
watch(
  [() => props.value, () => props.values],
  ([value]) => {
    const isSelfInflicted = value === lastReported;
    lastReported = value;
    if (isSelfInflicted) return;
    const el = viewport.value;
    if (!el) return;
    const index = indexOf(value);
    if (Math.abs(el.scrollTop - targetScrollTop(index)) > 1) smoothScrollToIndex(el, index);
  },
  { flush: "post" },
);

// Click/keyboard commit the value directly instead of only nudging the
// scroll position and waiting for the "scroll" listener above to notice —
// that listener depends on real layout (row/viewport height, scroll events
// firing on assignment) that headless test environments don't provide.
function commitIndex(index: number) {
  const next = props.values[index];
  lastReported = next;
  emit("value-change", next);
  const el = viewport.value;
  if (el) smoothScrollToIndex(el, index);
}

function stepBy(delta: number) {
  commitIndex(Math.min(Math.max(indexOf(props.value) + delta, 0), props.values.length - 1));
}

function handleKeyDown(event: KeyboardEvent) {
  // ARIA authoring practice for role="spinbutton": Up increases, Down decreases.
  if (event.key === "ArrowUp") {
    event.preventDefault();
    stepBy(1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    stepBy(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    commitIndex(0);
  } else if (event.key === "End") {
    event.preventDefault();
    commitIndex(props.values.length - 1);
  }
}
</script>

<template>
  <div
    class="okkly-time-picker__column"
    role="spinbutton"
    tabindex="0"
    :aria-label="label"
    :aria-valuenow="value"
    :aria-valuemin="values[0]"
    :aria-valuemax="values[values.length - 1]"
    :aria-valuetext="String(formatValue(value))"
    @keydown="handleKeyDown"
  >
    <div ref="viewport" class="okkly-time-picker__column-viewport">
      <div class="okkly-time-picker__column-container">
        <div
          v-for="(v, index) in values"
          :key="v"
          :data-value="v"
          :class="['okkly-time-picker__slide', v === value && 'okkly-time-picker__slide--selected']"
          @click="commitIndex(index)"
        >
          {{ formatValue(v) }}
        </div>
      </div>
    </div>
  </div>
</template>
