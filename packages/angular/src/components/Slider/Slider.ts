import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
} from "@angular/core";
import {
  adjustValueByIndex,
  areArraysEqual,
  clamp,
  findClosestIndex,
  isFocusVisible,
  normalizeValues,
  percentToValue,
  roundToStep,
  valueToArray,
  valueToPercent,
} from "./slider.utils";

export type SliderMark = { value: number; label?: string } | number;
export type SliderOrientation = "horizontal" | "vertical";
export type SliderSize = "small" | "medium" | "large";
export type SliderColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type SliderValueLabelDisplay = "auto" | "on" | "off";
export type SliderTrack = "normal" | "inverted" | "none";

/** `numberAttribute` that keeps an unset input unset rather than `NaN`. */
const optionalNumber = (value: unknown): number | undefined =>
  value == null || value === "" ? undefined : numberAttribute(value);

const DRAG_MOVE_THRESHOLD = 2;
const NAVIGATION_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);
const INCREMENT_KEYS = new Set(["ArrowRight", "ArrowUp", "PageUp"]);
const DECREMENT_KEYS = new Set(["ArrowLeft", "ArrowDown", "PageDown"]);

type Coords = { x: number; y: number };

const readThumbIndex = (event: Event) =>
  Number((event.currentTarget as HTMLElement | null)?.dataset["index"] ?? -1);

/**
 * Picks a number, or a range, along a track. Inputs follow MUI's Slider, as
 * `@okkly/react`'s `<Slider>` (and its `useSlider` hook) does — `min`, `max`,
 * `step`, `marks`, `orientation`, `disabled`, `color`, `size`,
 * `valueLabelDisplay`, `discrete`, `shiftStep`, `getAriaLabel`,
 * `getAriaValueText`, `track`, `valueLabelFormat`. Each thumb is a native
 * `<input type="range">`, so it keeps the ARIA slider semantics for free.
 *
 * Deliberate gaps: `value` is a `model()` (`[(value)]`) standing in for
 * React's `value`/`defaultValue` + `onChange` — a number, or an array for a
 * range; unset, it starts at `min`. `onChangeCommitted` is the
 * `changeCommitted` output. `valueLabelFormat` returns text, not a node.
 */
@Component({
  selector: "okkly-slider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-slider",
    "[class]": "modifiers()",
    "[style.touch-action]": "orientation() === 'vertical' ? 'pan-x' : 'pan-y'",
    "[attr.aria-disabled]": "disabled() || null",
    // The name belongs on the thumbs, not on this element.
    "[attr.aria-label]": "null",
    "(mousedown)": "onRootMouseDown($event)",
    "(touchstart)": "onTouchStart($event)",
  },
  templateUrl: "./Slider.html",
})
export class OkklySlider {
  /**
   * A number, or `[from, to]` for a range. Two-way bindable as `[(value)]`. Unset, it starts at `min`.
   *
   * @default undefined
   */
  readonly value = model<number | number[] | undefined>(undefined);
  /**
   * Lowest value.
   *
   * @default 0
   */
  readonly min = input(0, { transform: numberAttribute });
  /**
   * Highest value.
   *
   * @default 100
   */
  readonly max = input(100, { transform: numberAttribute });
  /**
   * Granularity of the values.
   *
   * @default 1
   */
  readonly step = input(1, { transform: numberAttribute });
  /**
   * `true` for a mark at every step, or the marks themselves — values, optionally labelled.
   *
   * @default false
   */
  readonly marks = input<boolean | SliderMark[], unknown>(false, {
    transform: (value) => (Array.isArray(value) ? value : booleanAttribute(value)),
  });
  /**
   * Track direction.
   *
   * @default "horizontal"
   */
  readonly orientation = input<SliderOrientation>("horizontal");
  /**
   * Non-interactive and dimmed.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Accent tone of the track and thumbs.
   *
   * @default "primary"
   */
  readonly color = input<SliderColor>("primary");
  /**
   * Track and thumb size.
   *
   * @default "medium"
   */
  readonly size = input<SliderSize>("medium");
  /**
   * When to show the value above a thumb: always (`on`), while active (`auto`), or never (`off`).
   *
   * @default "off"
   */
  readonly valueLabelDisplay = input<SliderValueLabelDisplay>("off");
  /**
   * Snaps to the marks only (MUI's `step={null}`). Without `marks`, one is made per `step`.
   *
   * @default false
   */
  readonly discrete = input(false, { transform: booleanAttribute });
  /**
   * Step with Shift held. Unset, about a tenth of the range, in whole steps.
   *
   * @default undefined
   */
  readonly shiftStep = input(undefined, { transform: optionalNumber });
  /**
   * Accessible name of each thumb, by index — for a range.
   *
   * @default undefined
   */
  readonly getAriaLabel = input<(index: number) => string>();
  /**
   * Spoken value of each thumb, when the number alone is not enough.
   *
   * @default undefined
   */
  readonly getAriaValueText = input<(value: number, index: number) => string>();
  /**
   * Which part of the rail is filled: up to the thumb (`normal`), past it (`inverted`), or none.
   *
   * @default "normal"
   */
  readonly track = input<SliderTrack>("normal");
  /**
   * Text of the value label.
   *
   * @default String
   */
  readonly valueLabelFormat = input<(value: number, index: number) => string>(String);
  /**
   * Accessible name of a single-thumb slider, set on the thumb.
   *
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Emits once a drag ends or a key sets a value — MUI's `onChangeCommitted`. */
  readonly changeCommitted = output<number | number[]>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  protected readonly isDragging = signal(false);
  protected readonly activeThumbIndex = signal(-1);
  protected readonly focusedThumbIndex = signal(-1);
  private touchId: number | null = null;
  private movesSinceStart = 0;
  private lastChangedValue: number[] | null = null;
  private previousActiveIndex: number | null = null;

  protected readonly isRange = computed(() => {
    const value = this.value();
    return Array.isArray(value) && value.length > 1;
  });
  protected readonly values = computed(() => {
    const value = this.value();
    const min = this.min();
    if (Array.isArray(value)) {
      return value.length ? normalizeValues(value, min, this.max(), this.step()) : [min];
    }
    return typeof value === "number"
      ? normalizeValues([value], min, this.max(), this.step())
      : [min];
  });

  private readonly effectiveShiftStep = computed(() => {
    const shiftStep = this.shiftStep();
    if (shiftStep !== undefined) return shiftStep;
    const step = this.step();
    return Math.max(1, Math.round(((this.max() - this.min()) * 0.1) / step)) * step;
  });

  protected readonly marksList = computed(() => {
    const marks = this.marks();
    const min = this.min();
    const max = this.max();
    const step = this.step();
    // Discrete snaps to marks (MUI `step={null}`). Without marks, make them
    // from `step`, so `discrete step="10"` works alone.
    if (marks === false && !this.discrete()) return [];
    if (Array.isArray(marks)) {
      return marks
        .map((mark) => (typeof mark === "number" ? { value: mark } : mark))
        .filter((mark) => mark.value >= min && mark.value <= max)
        .toSorted((a, b) => a.value - b.value);
    }
    if (step > 0) {
      return Array.from({ length: Math.floor((max - min) / step + 1) }, (_, index) => ({
        value: min + step * index,
        label: undefined as string | undefined,
      }));
    }
    return [];
  });
  private readonly marksValues = computed(() => this.marksList().map((mark) => mark.value));

  /** The CSS side each position is measured from. */
  protected readonly axis = computed(() =>
    this.orientation() === "vertical" ? ("bottom" as const) : ("left" as const),
  );
  private readonly axisSize = computed(() =>
    this.orientation() === "vertical" ? ("height" as const) : ("width" as const),
  );

  protected readonly trackStyle = computed(() => {
    const values = this.values();
    const min = this.min();
    const max = this.max();
    const offset = valueToPercent(this.isRange() ? (values[0] ?? min) : min, min, max);
    const length = valueToPercent(values.at(-1) ?? min, min, max) - offset;
    return { [this.axis()]: `${offset}%`, [this.axisSize()]: `${length}%` };
  });

  protected readonly invertedTracks = computed(() => {
    if (this.track() !== "inverted") return [];
    const values = this.values();
    const toPercent = (value: number) => this.percent(value);
    const segment = (offset: number, length: number) => ({
      [this.axis()]: `${offset}%`,
      [this.axisSize()]: `${length}%`,
    });
    if (!this.isRange()) {
      const start = toPercent(values[0] ?? this.min());
      return [segment(start, 100 - start)];
    }
    const lo = toPercent(Math.min(...values));
    const hi = toPercent(Math.max(...values));
    return [segment(0, lo), segment(hi, 100 - hi)];
  });

  protected readonly modifiers = computed(() =>
    [
      this.size() !== "medium" && `okkly-slider--${this.size()}`,
      this.color() !== "primary" && `okkly-slider--color-${this.color()}`,
      this.orientation() === "vertical" && "okkly-slider--vertical",
      this.disabled() && "okkly-slider--disabled",
      this.track() === "inverted" && "okkly-slider--track-inverted",
      this.track() === "none" && "okkly-slider--track-none",
    ]
      .filter(Boolean)
      .join(" "),
  );

  private readonly onPointerMove = (event: MouseEvent | TouchEvent) => this.pointerMove(event);
  private readonly onPointerEnd = (event: MouseEvent | TouchEvent) => this.pointerEnd(event);

  constructor() {
    effect(() => {
      if (!this.disabled()) return;
      untracked(() => {
        this.isDragging.set(false);
        this.activeThumbIndex.set(-1);
        this.focusedThumbIndex.set(-1);
        this.stopPointerListening();
      });
    });
    inject(DestroyRef).onDestroy(() => this.stopPointerListening());
  }

  protected percent(value: number): number {
    return valueToPercent(value, this.min(), this.max());
  }

  protected positionStyle(value: number, clampToRail = false): Record<string, string> {
    const percent = this.percent(value);
    return { [this.axis()]: `${clampToRail ? clamp(percent, 0, 100) : percent}%` };
  }

  protected isMarkActive(markValue: number): boolean {
    const values = this.values();
    if (this.isRange()) {
      return markValue >= Math.min(...values) && markValue <= Math.max(...values);
    }
    return markValue <= (values[0] ?? this.min());
  }

  protected showValueLabel(index: number): boolean {
    const display = this.valueLabelDisplay();
    if (display === "off") return false;
    if (display === "on") return true;
    return (
      this.isDragging() || this.activeThumbIndex() === index || this.focusedThumbIndex() === index
    );
  }

  protected thumbAriaLabel(index: number): string | null {
    return this.getAriaLabel()?.(index) ?? this.ariaLabel() ?? null;
  }

  protected thumbAriaValueText(value: number, index: number): string | null {
    return this.getAriaValueText()?.(value, index) ?? null;
  }

  private emitChange(next: number[]): void {
    if (!areArraysEqual(this.values(), next)) {
      this.value.set(this.isRange() ? next : next[0]);
    }
    this.lastChangedValue = next;
  }

  private emitCommit(fallback: number[]): void {
    const committed = this.lastChangedValue ?? fallback;
    const next = this.isRange() ? committed : committed[0];
    if (next !== undefined) this.changeCommitted.emit(next);
  }

  private stopPointerListening(): void {
    this.document.removeEventListener("mousemove", this.onPointerMove);
    this.document.removeEventListener("mouseup", this.onPointerEnd);
    this.document.removeEventListener("touchmove", this.onPointerMove);
    this.document.removeEventListener("touchend", this.onPointerEnd);
  }

  private eventToCoords(event: MouseEvent | TouchEvent, touchId?: number | null): Coords | false {
    if (touchId !== undefined && touchId !== null && "changedTouches" in event) {
      for (const touch of Array.from(event.changedTouches)) {
        if (touch.identifier === touchId) return { x: touch.clientX, y: touch.clientY };
      }
      return false;
    }
    if ("clientX" in event) return { x: event.clientX, y: event.clientY };
    return false;
  }

  private ensureFocusOnThumb(index: number): void {
    const active = this.document.activeElement;
    if (this.host.contains(active) && Number(active?.getAttribute("data-index")) !== index) {
      this.host.querySelector<HTMLElement>(`[type="range"][data-index="${index}"]`)?.focus();
    }
    this.activeThumbIndex.set(index);
  }

  private getNextFromCoords(
    coords: Coords,
    isMoving = false,
  ): { newValue: number | number[]; activeIndex: number } | null {
    const rect = this.host.getBoundingClientRect();
    const vertical = this.orientation() === "vertical";
    if ((vertical ? rect.height : rect.width) <= 0) return null;

    const min = this.min();
    const max = this.max();
    const percent = vertical
      ? clamp((rect.bottom - coords.y) / rect.height, 0, 1)
      : clamp((coords.x - rect.left) / rect.width, 0, 1);
    const raw = percentToValue(percent, min, max);
    const marksValues = this.marksValues();
    const snapped =
      this.discrete() && marksValues.length > 0
        ? marksValues[findClosestIndex(marksValues, raw)]
        : roundToStep(raw, this.step(), min);
    if (typeof snapped !== "number") return null;

    const candidate = clamp(snapped, min, max);
    if (!this.isRange()) return { newValue: candidate, activeIndex: 0 };

    const values = this.values();
    const index =
      isMoving && this.previousActiveIndex !== null
        ? this.previousActiveIndex
        : findClosestIndex(values, candidate);
    const adjusted = adjustValueByIndex(values, candidate, index);
    const adjustedIndex = findClosestIndex(adjusted, candidate);
    this.previousActiveIndex = adjustedIndex;
    return { newValue: adjusted, activeIndex: adjustedIndex };
  }

  private commitValueFromEvent(event: Event, requested: number): void {
    const index = readThumbIndex(event);
    const values = this.values();
    const current = values[index];
    if (typeof current !== "number") return;

    const marksList = this.marksList();
    const useMarks = this.discrete() && marksList.length > 0;
    const snapByMarks = (candidate: number) => {
      const first = marksList[0];
      const last = marksList.at(-1);
      if (!first || !last) return current;
      if (candidate <= first.value) return first.value;
      if (candidate >= last.value) return last.value;
      const position = this.marksValues().indexOf(current);
      const neighbor = candidate < current ? marksList[position - 1] : marksList[position + 1];
      return neighbor?.value ?? current;
    };

    const scalar = clamp(useMarks ? snapByMarks(requested) : requested, this.min(), this.max());
    const next = this.isRange() ? adjustValueByIndex(values, scalar, index) : [scalar];
    if (this.isRange()) this.ensureFocusOnThumb(next.indexOf(scalar));
    this.focusedThumbIndex.set(index);

    if (!areArraysEqual(values, next)) this.emitChange(next);
    this.emitCommit(next);
  }

  private pointerEnd(event: MouseEvent | TouchEvent): void {
    const coords = this.eventToCoords(event, this.touchId);
    this.isDragging.set(false);
    if (!coords) return;
    const next = this.getNextFromCoords(coords, true);
    if (!next) return;

    this.activeThumbIndex.set(-1);
    this.emitCommit(valueToArray(next.newValue));
    this.movesSinceStart = 0;
    this.touchId = null;
    this.stopPointerListening();
  }

  private pointerMove(event: MouseEvent | TouchEvent): void {
    const coords = this.eventToCoords(event, this.touchId);
    if (!coords) return;
    this.movesSinceStart += 1;

    if (event.type === "mousemove" && "buttons" in event && event.buttons === 0) {
      this.pointerEnd(event);
      return;
    }
    const next = this.getNextFromCoords(coords, true);
    if (!next) {
      this.pointerEnd(event);
      return;
    }
    if (this.movesSinceStart > DRAG_MOVE_THRESHOLD) this.isDragging.set(true);
    this.ensureFocusOnThumb(next.activeIndex);
    this.emitChange(valueToArray(next.newValue));
    this.isDragging.set(true);
  }

  private startFrom(coords: Coords | false, isMoving = false): void {
    if (!coords) return;
    const next = this.getNextFromCoords(coords, isMoving);
    if (!next) return;
    this.ensureFocusOnThumb(next.activeIndex);
    this.emitChange(valueToArray(next.newValue));
  }

  protected onTouchStart(event: TouchEvent): void {
    if (this.disabled()) return;
    const touch = event.changedTouches[0];
    if (touch) this.touchId = touch.identifier;
    this.startFrom(this.eventToCoords(event, this.touchId));
    this.movesSinceStart = 0;
    this.document.addEventListener("touchmove", this.onPointerMove, { passive: true });
    this.document.addEventListener("touchend", this.onPointerEnd);
  }

  protected onRootMouseDown(event: MouseEvent): void {
    if (this.disabled() || event.button !== 0 || event.defaultPrevented) return;
    event.preventDefault();
    this.startFrom(this.eventToCoords(event, this.touchId));
    this.movesSinceStart = 0;
    this.document.addEventListener("mousemove", this.onPointerMove, { passive: true });
    this.document.addEventListener("mouseup", this.onPointerEnd);
  }

  protected onThumbInput(event: Event): void {
    if (this.disabled()) return;
    this.commitValueFromEvent(event, (event.currentTarget as HTMLInputElement).valueAsNumber);
  }

  protected onThumbFocus(event: FocusEvent): void {
    const index = readThumbIndex(event);
    if (isFocusVisible(event.target as Element)) {
      this.focusedThumbIndex.set(index);
      this.activeThumbIndex.set(index);
    }
  }

  protected onThumbBlur(event: FocusEvent): void {
    if (!isFocusVisible(event.target as Element)) {
      this.focusedThumbIndex.set(-1);
      this.activeThumbIndex.set(-1);
    }
  }

  protected onThumbKeydown(event: KeyboardEvent): void {
    if (this.disabled() || !NAVIGATION_KEYS.has(event.key)) return;
    event.preventDefault();

    const index = readThumbIndex(event);
    const current = this.values()[index];
    if (typeof current !== "number") return;
    const min = this.min();
    const max = this.max();

    if (!this.discrete()) {
      const stepSize = event.shiftKey ? this.effectiveShiftStep() : this.step();
      if (event.key === "Home") return this.commitValueFromEvent(event, min);
      if (event.key === "End") return this.commitValueFromEvent(event, max);
      const direction = INCREMENT_KEYS.has(event.key) ? 1 : DECREMENT_KEYS.has(event.key) ? -1 : 0;
      if (!direction) return;
      const next = clamp(current + direction * stepSize, min, max);
      if (next !== current) this.commitValueFromEvent(event, next);
      return;
    }

    const marksValues = this.marksValues();
    const lastIndex = marksValues.length - 1;
    const currentIndex = marksValues.indexOf(current);
    const first = marksValues[0];
    const last = marksValues[lastIndex];
    if (event.key === "Home" && typeof first === "number") {
      return this.commitValueFromEvent(event, first);
    }
    if (event.key === "End" && typeof last === "number") {
      return this.commitValueFromEvent(event, last);
    }
    let nextIndex: number | undefined;
    if (INCREMENT_KEYS.has(event.key)) {
      nextIndex = currentIndex < 0 ? 0 : Math.min(lastIndex, currentIndex + 1);
    } else if (DECREMENT_KEYS.has(event.key)) {
      nextIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
    }
    const next = nextIndex === undefined ? undefined : marksValues[nextIndex];
    if (typeof next === "number" && next !== current) this.commitValueFromEvent(event, next);
  }
}
