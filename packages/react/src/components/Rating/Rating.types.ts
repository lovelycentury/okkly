import type { ReactNode, SyntheticEvent } from "react";

export type RatingSize = "small" | "medium" | "large";
export type RatingColor = "warning" | "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type RatingIcon = "star" | "heart";
export type RatingPrecision = 0.5 | 1;

/**
 * Props follow MUI's Rating API (https://mui.com/material-ui/api/rating/)
 * closely: `value`/`defaultValue`/`max`/`precision`/`size`/`readOnly`/
 * `disabled`/`onChange`/`name`/`getLabelText` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`IconContainerComponent` (no CSS-in-JS
 * system). `color` uses okkly tone names with gold (`warning`) as the default
 * instead of MUI's `primary`. `icon` accepts `"star"|"heart"` or a custom
 * `ReactNode` (filled state only — empty uses the same glyph muted). Built-in
 * `label` renders trailing summary text (not in MUI's Rating).
 */
export interface RatingProps {
  /**
   * Current score. `null` clears every star.
   *
   * @default undefined
   * @type {number | null}
   */
  value?: number | null;
  /**
   * Initial score (uncontrolled).
   *
   * @default null
   * @type {number | null}
   */
  defaultValue?: number | null;
  /**
   * Fires when the user picks a score. Pass `null` to clear (click active star).
   *
   * @default undefined
   * @type {(event: SyntheticEvent, value: number | null) => void}
   */
  onChange?: (event: SyntheticEvent, value: number | null) => void;
  /**
   * Number of glyphs (default 5).
   *
   * @default 5
   * @type {number}
   */
  max?: number;
  /**
   * Half-step increments (default 0.5).
   *
   * @default 0.5
   * @type {RatingPrecision}
   */
  precision?: RatingPrecision;
  /**
   * Glyph size.
   *
   * @default "medium"
   * @type {RatingSize}
   */
  size?: RatingSize;
  /**
   * Fill colour — default gold uses `--okkly-feedback-warning`.
   *
   * @default "warning"
   * @type {RatingColor}
   */
  color?: RatingColor;
  /**
   * Built-in `"star"` / `"heart"` or a custom filled glyph.
   *
   * @default "star"
   * @type {RatingIcon | ReactNode}
   */
  icon?: RatingIcon | ReactNode;
  /**
   * Display-only — no hover or click.
   *
   * @default false
   * @type {boolean}
   */
  readOnly?: boolean;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Trailing summary (e.g. "4.8 · 128 reviews").
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Passed to each interactive star input for form grouping.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Accessible label per star button.
   *
   * @default defaultGetLabelText
   * @type {(value: number) => string}
   */
  getLabelText?: (value: number) => string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
