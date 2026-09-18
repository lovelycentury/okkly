export type RatingSize = "small" | "medium" | "large";
export type RatingColor = "warning" | "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type RatingIcon = "star" | "heart";
export type RatingPrecision = 0.5 | 1;

/**
 * Props follow MUI's Rating API (https://mui.com/material-ui/api/rating/)
 * closely, mirroring `@okkly/react`'s `<Rating>` name-for-name:
 * `max`/`precision`/`size`/`readOnly`/`disabled`/`name`/`getLabelText` match
 * name-for-name. Deliberate gaps carried over from React: no
 * `sx`/`classes`/`IconContainerComponent` (no CSS-in-JS system). `color`
 * uses okkly tone names with gold (`warning`) as the default instead of
 * MUI's `primary`. Built-in `label` renders trailing summary text (not in
 * MUI's Rating).
 *
 * Vue-forced differences: the controlled `value` + `onChange` pair becomes
 * an unnamed `defineModel<number | null>()`, so consumers can `v-model` it
 * — `defaultValue` still seeds it once on mount when nothing is bound; the
 * event argument drops the same way it does for `Checkbox`/`Switch`, since
 * nothing native fires one here either. `icon` narrows from React's
 * `RatingIcon | ReactNode` to just `RatingIcon` — pass a custom filled glyph
 * through the `icon` slot instead, which wins over the `icon` prop when
 * filled. `label` (`ReactNode` in React) becomes the `label` slot.
 */
export interface RatingProps {
  /**
   * Initial score (uncontrolled).
   *
   * @default null
   */
  defaultValue?: number | null;
  /**
   * Number of glyphs (default 5).
   *
   * @default 5
   */
  max?: number;
  /**
   * Half-step increments (default 0.5).
   *
   * @default 0.5
   */
  precision?: RatingPrecision;
  /**
   * Glyph size.
   *
   * @default "medium"
   */
  size?: RatingSize;
  /**
   * Fill colour — default gold uses `--okkly-feedback-warning`.
   *
   * @default "warning"
   */
  color?: RatingColor;
  /**
   * Built-in `"star"` / `"heart"` glyph. Overridden by the `icon` slot when it's filled.
   *
   * @default "star"
   */
  icon?: RatingIcon;
  /**
   * Display-only — no hover or click.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * Non-interactive.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Passed to each interactive star input for form grouping.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Accessible label per star button.
   *
   * @default defaultGetLabelText
   */
  getLabelText?: (value: number) => string;
}
