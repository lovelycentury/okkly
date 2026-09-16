import type { SliderMark, SliderOrientation } from "@okkly/vue-composables";

export type { SliderMark, SliderOrientation };
export type SliderSize = "small" | "medium" | "large";
export type SliderColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type SliderValueLabelDisplay = "auto" | "on" | "off";
export type SliderTrack = "normal" | "inverted" | "none";

/**
 * Props follow MUI's Slider API (https://mui.com/material-ui/api/slider/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Slider>`
 * name-for-name: `min`/`max`/`step`/`marks`/`orientation`/`disabled`/`color`/
 * `size`/`valueLabelDisplay`/`discrete`/`shiftStep`/`getAriaLabel`/
 * `getAriaValueText`/`track`/`valueLabelFormat` match name-for-name.
 * Deliberate gaps carried over from React: no `sx`/`classes`/`components`/
 * `component`/`slots`/`slotProps` (no CSS-in-JS system). `color` uses okkly
 * tone names. `discrete` snaps to marks (MUI uses `step={null}` for the same
 * behavior) and auto-generates step marks when `marks` is omitted.
 *
 * Vue-forced differences: the controlled `value` + `onChange` pair becomes
 * an unnamed `defineModel<number | number[]>()`, so consumers can `v-model`
 * it — `defaultValue` still seeds it once on mount when nothing is bound,
 * same as React's uncontrolled mode. `onChangeCommitted` becomes the
 * `changeCommitted` emit. Both drop the `(event, …)` pair down to just the
 * value, same simplification `Checkbox`/`Switch`/`RadioGroup` already make —
 * there is no Vue equivalent of a synthetic event here since nothing native
 * fires one. `valueLabelFormat` returns a plain `string` rather than
 * `ReactNode`, since Vue has no equivalent to return from a callback prop
 * (its default already only ever returns `String(value)`).
 */
export interface SliderProps {
  /**
   * Initial value (uncontrolled). Ignored once `v-model` is bound.
   *
   * @default undefined
   */
  defaultValue?: number | number[];
  /**
   * Min.
   *
   * @default 0
   */
  min?: number;
  /**
   * Max.
   *
   * @default 100
   */
  max?: number;
  /**
   * Step.
   *
   * @default 1
   */
  step?: number;
  /**
   * Marks.
   *
   * @default false
   */
  marks?: boolean | SliderMark[];
  /**
   * Orientation.
   *
   * @default "horizontal"
   */
  orientation?: SliderOrientation;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: SliderColor;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: SliderSize;
  /**
   * Value Label Display.
   *
   * @default "off"
   */
  valueLabelDisplay?: SliderValueLabelDisplay;
  /**
   * Discrete.
   *
   * @default false
   */
  discrete?: boolean;
  /**
   * Shift Step.
   *
   * @default undefined
   */
  shiftStep?: number;
  /**
   * Get Aria Label.
   *
   * @default undefined
   */
  getAriaLabel?: (index: number) => string;
  /**
   * Get Aria Value Text.
   *
   * @default undefined
   */
  getAriaValueText?: (value: number, index: number) => string;
  /**
   * Track.
   *
   * @default "normal"
   */
  track?: SliderTrack;
  /**
   * Value Label Format.
   *
   * @default (value) => String(value)
   */
  valueLabelFormat?: (value: number, index: number) => string;
}
