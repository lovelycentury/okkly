import { computed, onUnmounted, ref, watch, type ComputedRef, type Ref } from "vue";
import {
  adjustValueByIndex,
  areArraysEqual,
  clamp,
  findClosestIndex,
  isFocusVisible,
  isTouchEvent,
  normalizeValues,
  percentToValue,
  roundToStep,
  valueToArray,
  valueToPercent,
} from "./useSlider.utils";

export type SliderMark = { value: number; label?: string } | number;
export type SliderOrientation = "horizontal" | "vertical";

export interface UseSliderOptions {
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
  discrete?: boolean;
  shiftStep?: number;
  disabled?: boolean;
  marks?: SliderMark[] | boolean;
  orientation?: SliderOrientation;
  label?: string;
  getAriaLabel?: (index: number) => string;
  getAriaValueText?: (value: number, index: number) => string;
  onChange?: (value: number | number[]) => void;
  onCommit?: (value: number | number[]) => void;
}

export interface UseSliderReturn {
  values: ComputedRef<number[]>;
  isRange: ComputedRef<boolean>;
  isDragging: Ref<boolean>;
  activeThumbIndex: Ref<number>;
  focusedThumbIndex: Ref<number>;
  marksList: ComputedRef<{ value: number; label?: string }[]>;
  valueToPercent: (value: number) => number;
  isMarkActive: (markValue: number) => boolean;
  rootStyle: ComputedRef<{ touchAction: "pan-x" | "pan-y" }>;
  rootEvents: {
    mousedown: (event: MouseEvent) => void;
    touchstart: (event: TouchEvent) => void;
  };
  trackStyle: ComputedRef<Record<string, string>>;
  thumbStyle: (index: number, thumbValue: number) => Record<string, string>;
  thumbInputAttrs: (
    index: number,
    thumbValue: number,
  ) => {
    min: number;
    max: number;
    value: number;
    role: "slider";
    type: "range";
    "aria-label"?: string;
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    "aria-valuetext"?: string;
    "aria-orientation": SliderOrientation;
    "data-index": number;
    tabindex: number;
    step: number | "any";
    disabled: boolean;
  };
  thumbInputEvents: {
    input: (event: Event) => void;
    focus: (event: FocusEvent) => void;
    blur: (event: FocusEvent) => void;
    keydown: (event: KeyboardEvent) => void;
  };
  markStyle: (mark: { value: number }) => Record<string, string>;
  markLabelStyle: (mark: { value: number }) => Record<string, string>;
}

const DRAG_MOVE_THRESHOLD = 2;

const KEY = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Home: "Home",
  End: "End",
} as const;

const NAVIGATION_KEYS = new Set<string>([
  KEY.Up,
  KEY.Down,
  KEY.Left,
  KEY.Right,
  KEY.PageUp,
  KEY.PageDown,
  KEY.Home,
  KEY.End,
]);

const INCREMENT_KEYS = new Set<string>([KEY.Right, KEY.Up, KEY.PageUp]);
const DECREMENT_KEYS = new Set<string>([KEY.Left, KEY.Down, KEY.PageDown]);

const TRACK_CALCULATION_STRATEGIES = {
  horizontal: (rect: DOMRect, coords: { x: number; y: number }) =>
    clamp((coords.x - rect.left) / rect.width, 0, 1),
  vertical: (rect: DOMRect, coords: { x: number; y: number }) =>
    clamp((rect.bottom - coords.y) / rect.height, 0, 1),
};

const readThumbIndex = (event: Event | { currentTarget: EventTarget | null }) =>
  Number((event.currentTarget as HTMLElement | null)?.dataset.index ?? -1);

/**
 * Headless slider behavior — the Vue counterpart of `useSlider` in
 * `@okkly/react-hooks`. `sliderRef` is the root element (measured for
 * pointer-to-value math); `options` is read fresh on every call, the Vue
 * equivalent of a hook whose body reruns each render with new props, since a
 * composable's `setup()` body runs only once.
 *
 * Vue-forced differences: React's `getRootProps()`/`getThumbInputProps()`
 * exist to solve JSX's "spread everything in one prop" ergonomics, which
 * templates don't need — this composable instead returns styles/attrs
 * (`v-bind`-able, no event-key casing to get right) separately from event
 * listeners (`v-on`-able, keyed by bare native event name, matching
 * `useRipple`'s own `events` return). React's controlled-input `onChange`
 * maps to the native `input` event, not `change` — `thumbInputEvents.input`
 * is what keeps a screen reader's native slider gesture on the hidden
 * `<input type="range">` reported at the same point in the interaction.
 */
export function useSlider(
  sliderRef: Ref<HTMLDivElement | null>,
  options: () => UseSliderOptions,
): UseSliderReturn {
  let touchId: number | null = null;
  let movesSinceStart = 0;
  let lastChangedValue: number[] | null = null;
  let previousActiveIndex: number | null = null;

  const isDragging = ref(false);
  const activeThumbIndex = ref(-1);
  const focusedThumbIndex = ref(-1);

  const isRange = computed(() => {
    const v = options().value;
    return Array.isArray(v) && v.length > 1;
  });

  const values = computed(() => {
    const o = options();
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const raw = o.value;
    if (Array.isArray(raw)) {
      if (!raw.length) return [min];
      return normalizeValues(raw, min, max, step);
    }
    if (typeof raw !== "number") return [min];
    return normalizeValues([raw], min, max, step);
  });

  const marksList = computed(() => {
    const o = options();
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const discrete = o.discrete ?? false;
    const marksOption = o.marks ?? false;

    // Discrete snaps to marks (MUI `step={null}`). When marks aren't
    // provided, generate them from step so `discrete` alone works.
    if (marksOption === false && !discrete) return [];

    if (Array.isArray(marksOption)) {
      return marksOption
        .map((mark) => (typeof mark === "number" ? { value: mark } : mark))
        .filter((mark) => mark.value >= min && mark.value <= max)
        .toSorted((a, b) => a.value - b.value);
    }

    if (step > 0) {
      return [...Array(Math.floor((max - min) / step + 1))].map((_, index) => ({
        value: min + step * index,
      }));
    }

    return [];
  });

  const axis = computed(() => {
    const orientation = options().orientation ?? "horizontal";
    return orientation === "vertical"
      ? ({ position: "bottom", size: "height" } as const)
      : ({ position: "left", size: "width" } as const);
  });

  function valueToPercentFn(value: number) {
    const o = options();
    return valueToPercent(value, o.min ?? 0, o.max ?? 100);
  }

  const trackOffset = computed(() => {
    const v = values.value;
    const min = options().min ?? 0;
    return valueToPercentFn(isRange.value && v[0] !== undefined ? v[0] : min);
  });

  const trackLength = computed(() => {
    const v = values.value;
    const min = options().min ?? 0;
    return valueToPercentFn(v.at(-1) ?? min) - trackOffset.value;
  });

  const trackStyle = computed(() => ({
    [axis.value.position]: `${trackOffset.value}%`,
    [axis.value.size]: `${trackLength.value}%`,
  }));

  function shiftStepFor(o: UseSliderOptions) {
    if (typeof o.shiftStep !== "undefined") return o.shiftStep;
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const stepMultiple = Math.max(1, Math.round(((max - min) * 0.1) / step));
    return stepMultiple * step;
  }

  function emitChange(next: number[]) {
    const currentValues = values.value;
    if (!areArraysEqual(currentValues, next)) {
      const nextValue = isRange.value ? next : next[0];
      if (typeof nextValue !== "undefined") options().onChange?.(nextValue);
    }
    lastChangedValue = next;
  }

  function emitCommit(fallback: number[]) {
    const valueWithFallback = lastChangedValue ?? fallback;
    const nextValue = isRange.value ? valueWithFallback : valueWithFallback[0];
    if (typeof nextValue !== "undefined") options().onCommit?.(nextValue);
  }

  function stopPointerListening() {
    document.removeEventListener("mousemove", handlePointerMove);
    document.removeEventListener("mouseup", handlePointerEnd);
    document.removeEventListener("touchmove", handlePointerMove);
    document.removeEventListener("touchend", handlePointerEnd);
  }

  function eventToCoords(
    event: MouseEvent | TouchEvent,
    id?: number | null,
  ): { x: number; y: number } | false {
    if (id !== undefined && isTouchEvent(event)) {
      for (let i = 0; i < event.changedTouches.length; i += 1) {
        const touch = event.changedTouches[i];
        if (touch && touch.identifier === id) {
          return { x: touch.clientX, y: touch.clientY };
        }
      }
      return false;
    }

    if ("clientX" in event) {
      return { x: event.clientX, y: event.clientY };
    }

    return false;
  }

  function ensureFocusOnThumb(opts: { index: number; shouldSetActive: boolean }) {
    const { index, shouldSetActive } = opts;
    const slider = sliderRef.value;
    if (!slider) return;

    if (
      slider.contains(document.activeElement) &&
      Number(document.activeElement?.getAttribute("data-index")) !== index
    ) {
      slider.querySelector<HTMLElement>(`[type="range"][data-index="${index}"]`)?.focus();
    }

    if (shouldSetActive) activeThumbIndex.value = index;
  }

  function getNextFromCoords(opts: { coords: { x: number; y: number }; isMoving?: boolean }) {
    const { coords, isMoving = false } = opts;
    const slider = sliderRef.value;
    if (!slider) return null;

    const o = options();
    const orientation = o.orientation ?? "horizontal";
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const discrete = o.discrete ?? false;

    const rect = slider.getBoundingClientRect();
    const mainSize = orientation === "vertical" ? rect.height : rect.width;
    if (mainSize <= 0) return null;

    const percent = TRACK_CALCULATION_STRATEGIES[orientation](rect, coords);
    const raw = percentToValue(percent, min, max);
    const marksValues = marksList.value.map((mark) => mark.value);
    const snapped =
      discrete && marksValues.length > 0
        ? marksValues[findClosestIndex(marksValues, raw)]
        : roundToStep(raw, step, min);

    if (typeof snapped !== "number") return null;

    const candidate = clamp(snapped, min, max);

    if (!isRange.value) {
      return { newValue: candidate, activeIndex: 0 };
    }

    const currentValues = values.value;
    const closestIndex = findClosestIndex(currentValues, candidate);
    const index = isMoving && previousActiveIndex != null ? previousActiveIndex : closestIndex;

    const adjustedValues = adjustValueByIndex({
      values: currentValues,
      newValue: candidate,
      index,
    });

    const adjustedIndex = findClosestIndex(adjustedValues, candidate);
    previousActiveIndex = adjustedIndex;

    return { newValue: adjustedValues, activeIndex: adjustedIndex };
  }

  function commitValueFromEvent(event: KeyboardEvent | Event, input: number) {
    const o = options();
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const discrete = o.discrete ?? false;

    const index = readThumbIndex(event);
    const currentValues = values.value;
    const current = currentValues[index];
    if (typeof current !== "number") return;

    const list = marksList.value;
    const useMarks = discrete && list.length > 0;
    const listValues = list.map((mark) => mark.value);

    const snapByMarks = (candidate: number) => {
      const first = list[0];
      const last = list.at(-1);
      if (!first || !last) return current;
      if (candidate <= first.value) return first.value;
      if (candidate >= last.value) return last.value;

      const pos = listValues.indexOf(current);
      const neighbor = candidate < current ? list[pos - 1] : list[pos + 1];
      return neighbor?.value ?? current;
    };

    const scalar = clamp(useMarks ? snapByMarks(input) : input, min, max);
    const nextValues = isRange.value
      ? adjustValueByIndex({ values: currentValues, newValue: scalar, index })
      : [scalar];

    if (isRange.value) {
      const nextActiveIndex = nextValues.indexOf(scalar);
      ensureFocusOnThumb({ index: nextActiveIndex, shouldSetActive: true });
    }

    focusedThumbIndex.value = index;

    if (!areArraysEqual(currentValues, nextValues)) emitChange(nextValues);
    emitCommit(nextValues);
  }

  function handlePointerEnd(event: MouseEvent | TouchEvent) {
    const coords = eventToCoords(event, touchId);
    isDragging.value = false;

    if (!coords) return;

    const next = getNextFromCoords({ coords, isMoving: true });
    if (!next) return;

    const { newValue } = next;
    activeThumbIndex.value = -1;
    emitCommit(valueToArray(newValue));

    movesSinceStart = 0;
    touchId = null;
    stopPointerListening();
  }

  function handlePointerMove(event: MouseEvent | TouchEvent) {
    const coords = eventToCoords(event, touchId);
    if (!coords) return;

    movesSinceStart += 1;

    if (event.type === "mousemove" && "buttons" in event && event.buttons === 0) {
      handlePointerEnd(event);
      return;
    }

    const nextState = getNextFromCoords({ coords, isMoving: true });
    if (!nextState) {
      handlePointerEnd(event);
      return;
    }

    const { newValue, activeIndex } = nextState;

    if (movesSinceStart > DRAG_MOVE_THRESHOLD) {
      isDragging.value = true;
    }

    ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
    emitChange(valueToArray(newValue));
    isDragging.value = true;
  }

  function handlePointerStart(event: TouchEvent) {
    if (options().disabled) return;

    const touch = event.changedTouches[0];
    if (touch !== null && touch !== undefined) touchId = touch.identifier;

    const coords = eventToCoords(event, touchId);
    if (coords) {
      const nextState = getNextFromCoords({ coords, isMoving: false });
      if (nextState) {
        const { newValue, activeIndex } = nextState;
        ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
        emitChange(valueToArray(newValue));
      }
    }

    movesSinceStart = 0;
    document.addEventListener("touchmove", handlePointerMove, { passive: true });
    document.addEventListener("touchend", handlePointerEnd);
  }

  function handleRootMouseDown(event: MouseEvent) {
    if (options().disabled) return;
    if (event.button !== 0) return;
    if (event.defaultPrevented) return;

    event.preventDefault();
    const coords = eventToCoords(event, touchId);
    if (coords) {
      const nextState = getNextFromCoords({ coords });
      if (nextState) {
        const { newValue, activeIndex } = nextState;
        ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
        emitChange(valueToArray(newValue));
      }
    }

    movesSinceStart = 0;
    document.addEventListener("mousemove", handlePointerMove, { passive: true });
    document.addEventListener("mouseup", handlePointerEnd);
  }

  function handleHiddenInputChange(event: Event) {
    if (options().disabled) return;
    commitValueFromEvent(event, (event.currentTarget as HTMLInputElement).valueAsNumber);
  }

  function handleHiddenInputFocus(event: FocusEvent) {
    const index = readThumbIndex(event);
    if (isFocusVisible(event.target as Element)) {
      focusedThumbIndex.value = index;
      activeThumbIndex.value = index;
    }
  }

  function handleHiddenInputBlur(event: FocusEvent) {
    if (!isFocusVisible(event.target as Element)) {
      focusedThumbIndex.value = -1;
      activeThumbIndex.value = -1;
    }
  }

  function handleHiddenInputKeydown(event: KeyboardEvent) {
    const o = options();
    if (o.disabled) return;
    if (!NAVIGATION_KEYS.has(event.key)) return;
    event.preventDefault();

    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const discrete = o.discrete ?? false;

    const index = readThumbIndex(event);
    const currentValues = values.value;
    const current = currentValues[index];
    if (typeof current !== "number") return;

    if (!discrete) {
      const stepSize = event.shiftKey ? shiftStepFor(o) : step;

      if (event.key === KEY.Home) return commitValueFromEvent(event, min);
      if (event.key === KEY.End) return commitValueFromEvent(event, max);

      if (INCREMENT_KEYS.has(event.key)) {
        const next = clamp(current + stepSize, min, max);
        if (next !== current) commitValueFromEvent(event, next);
        return;
      }

      if (DECREMENT_KEYS.has(event.key)) {
        const next = clamp(current - stepSize, min, max);
        if (next !== current) commitValueFromEvent(event, next);
        return;
      }

      return;
    }

    const list = marksList.value;
    const listValues = list.map((mark) => mark.value);
    const lastIndex = listValues.length - 1;
    const currentIndex = listValues.indexOf(current);
    const first = listValues[0];
    const last = listValues[lastIndex];

    if (event.key === KEY.Home && typeof first === "number")
      return commitValueFromEvent(event, first);
    if (event.key === KEY.End && typeof last === "number") return commitValueFromEvent(event, last);

    if (INCREMENT_KEYS.has(event.key)) {
      const nextIdx = currentIndex < 0 ? 0 : Math.min(lastIndex, currentIndex + 1);
      const next = listValues[nextIdx];
      if (next !== current && typeof next === "number") commitValueFromEvent(event, next);
      return;
    }

    if (DECREMENT_KEYS.has(event.key)) {
      const nextIdx = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
      const next = listValues[nextIdx];
      if (next !== current && typeof next === "number") commitValueFromEvent(event, next);
    }
  }

  watch(
    () => options().disabled ?? false,
    (disabled) => {
      if (!disabled) return;
      isDragging.value = false;
      activeThumbIndex.value = -1;
      focusedThumbIndex.value = -1;
      stopPointerListening();
    },
  );

  onUnmounted(stopPointerListening);

  function isMarkActive(markValue: number) {
    const v = values.value;
    if (isRange.value) {
      const minValue = Math.min(...v);
      const maxValue = Math.max(...v);
      return markValue >= minValue && markValue <= maxValue;
    }
    const min = options().min ?? 0;
    return markValue <= (v[0] ?? min);
  }

  const rootStyle = computed(() => ({
    touchAction:
      (options().orientation ?? "horizontal") === "vertical" ? "pan-x" : ("pan-y" as const),
  })) as ComputedRef<{ touchAction: "pan-x" | "pan-y" }>;

  function thumbStyle(_index: number, thumbValue: number): Record<string, string> {
    return { [axis.value.position]: `${valueToPercentFn(thumbValue)}%` };
  }

  function thumbInputAttrs(index: number, thumbValue: number) {
    const o = options();
    const min = o.min ?? 0;
    const max = o.max ?? 100;
    const step = o.step ?? 1;
    const discrete = o.discrete ?? false;
    const orientation = o.orientation ?? "horizontal";
    const disabled = o.disabled ?? false;
    const list = marksList.value;

    return {
      min,
      max,
      value: thumbValue,
      role: "slider" as const,
      type: "range" as const,
      "aria-label": o.getAriaLabel?.(index) ?? o.label,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": thumbValue,
      "aria-valuetext": o.getAriaValueText?.(thumbValue, index),
      "aria-orientation": orientation,
      "data-index": index,
      tabindex: disabled ? -1 : 0,
      step: discrete && list.length > 0 ? ("any" as const) : step,
      disabled,
    };
  }

  function markStyle(mark: { value: number }): Record<string, string> {
    return { [axis.value.position]: `${clamp(valueToPercentFn(mark.value), 0, 100)}%` };
  }

  function markLabelStyle(mark: { value: number }): Record<string, string> {
    return { [axis.value.position]: `${valueToPercentFn(mark.value)}%` };
  }

  return {
    values,
    isRange,
    isDragging,
    activeThumbIndex,
    focusedThumbIndex,
    marksList,
    valueToPercent: valueToPercentFn,
    isMarkActive,
    rootStyle,
    rootEvents: {
      mousedown: handleRootMouseDown,
      touchstart: handlePointerStart,
    },
    trackStyle,
    thumbStyle,
    thumbInputAttrs,
    thumbInputEvents: {
      input: handleHiddenInputChange,
      focus: handleHiddenInputFocus,
      blur: handleHiddenInputBlur,
      keydown: handleHiddenInputKeydown,
    },
    markStyle,
    markLabelStyle,
  };
}
