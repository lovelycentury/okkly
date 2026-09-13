import type { HTMLAttributes, ReactNode, SyntheticEvent } from "react";
import type { SliderMark, SliderOrientation } from "@okkly/react-hooks";

export type { SliderMark, SliderOrientation };
export type SliderSize = "small" | "medium" | "large";
export type SliderColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type SliderValueLabelDisplay = "auto" | "on" | "off";
export type SliderTrack = "normal" | "inverted" | "none";

/**
 * Props follow MUI's Slider API (https://mui.com/material-ui/api/slider/) as closely
 * as this design allows: `value`/`defaultValue`/`min`/`max`/`step`/`marks`/
 * `orientation`/`disabled`/`size`/`valueLabelDisplay`/`shiftStep`/`getAriaLabel`/
 * `getAriaValueText`/`track`/`onChange`/`onChangeCommitted` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`components`/`component`/`slots`/`slotProps`
 * (no CSS-in-JS system). `color` uses okkly tone names. `discrete` snaps to marks
 * (MUI uses `step={null}` for the same behavior) and auto-generates step marks
 * when `marks` is omitted.
 */
export interface SliderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  /**
   * Value.
   *
   * @default undefined
   * @type {number | number[]}
   */
  value?: number | number[];
  /**
   * Default Value.
   *
   * @default undefined
   * @type {number | number[]}
   */
  defaultValue?: number | number[];
  /**
   * On Change.
   *
   * @default undefined
   * @type {(event: Event | SyntheticEvent, value: number | number[], activeThumb?: number) => void}
   */
  onChange?: (
    event: Event | SyntheticEvent,
    value: number | number[],
    activeThumb?: number,
  ) => void;
  /**
   * On Change Committed.
   *
   * @default undefined
   * @type {(event: Event | SyntheticEvent, value: number | number[]) => void}
   */
  onChangeCommitted?: (event: Event | SyntheticEvent, value: number | number[]) => void;
  /**
   * Min.
   *
   * @default 0
   * @type {number}
   */
  min?: number;
  /**
   * Max.
   *
   * @default 100
   * @type {number}
   */
  max?: number;
  /**
   * Step.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
  /**
   * Marks.
   *
   * @default false
   * @type {boolean | SliderMark[]}
   */
  marks?: boolean | SliderMark[];
  /**
   * Orientation.
   *
   * @default "horizontal"
   * @type {SliderOrientation}
   */
  orientation?: SliderOrientation;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   * @type {SliderColor}
   */
  color?: SliderColor;
  /**
   * Size.
   *
   * @default "medium"
   * @type {SliderSize}
   */
  size?: SliderSize;
  /**
   * Value Label Display.
   *
   * @default "off"
   * @type {SliderValueLabelDisplay}
   */
  valueLabelDisplay?: SliderValueLabelDisplay;
  /**
   * Discrete.
   *
   * @default false
   * @type {boolean}
   */
  discrete?: boolean;
  /**
   * Shift Step.
   *
   * @default undefined
   * @type {number}
   */
  shiftStep?: number;
  /**
   * Get Aria Label.
   *
   * @default undefined
   * @type {(index: number) => string}
   */
  getAriaLabel?: (index: number) => string;
  /**
   * Get Aria Value Text.
   *
   * @default undefined
   * @type {(value: number, index: number) => string}
   */
  getAriaValueText?: (value: number, index: number) => string;
  /**
   * Track.
   *
   * @default "normal"
   * @type {SliderTrack}
   */
  track?: SliderTrack;
  /**
   * Value Label Format.
   *
   * @default formatValueLabel
   * @type {(value: number, index: number) => ReactNode}
   */
  valueLabelFormat?: (value: number, index: number) => ReactNode;
}
