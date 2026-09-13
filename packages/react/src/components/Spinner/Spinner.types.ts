import type { HTMLAttributes } from "react";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's CircularProgress API (https://mui.com/material-ui/api/circular-progress/)
 * in spirit: `size`/`color`/`thickness` match the loading-indicator role. Deliberate
 * gaps: no `sx`/`classes`, no `disableShrink`/`variant` (always an indeterminate arc),
 * SVG ring with stroke-dash animation instead of MUI's two-circle technique.
 */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /**
   * Diameter preset.
   *
   * @default "medium"
   * @type {SpinnerSize}
   */
  size?: SpinnerSize;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   * @type {SpinnerColor}
   */
  color?: SpinnerColor;
  /**
   * Ring stroke width in pixels at the preset's own size. Overrides the preset.
   *
   * @default undefined
   * @type {number}
   */
  thickness?: number;
}
