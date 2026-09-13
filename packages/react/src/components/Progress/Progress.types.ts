import type { HTMLAttributes } from "react";

export type ProgressVariant = "determinate" | "indeterminate";
export type ProgressType = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's LinearProgress / CircularProgress APIs
 * (https://mui.com/material-ui/api/linear-progress/) as closely as this design allows:
 * `value` (0–100), `variant` (`determinate`|`indeterminate`), `color`, and `size` match
 * name-for-name. Deliberate gaps: no `sx`/`classes`, `type` selects linear vs circular
 * (MUI splits these into two components), circular shows an optional percentage label.
 */
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Progress value, 0–100. Ignored when `variant="indeterminate"`.
   *
   * @default 0
   * @type {number}
   */
  value?: number;
  /**
   * Known vs unknown duration.
   *
   * @default "determinate"
   * @type {ProgressVariant}
   */
  variant?: ProgressVariant;
  /**
   * Linear bar or circular ring.
   *
   * @default "linear"
   * @type {ProgressType}
   */
  type?: ProgressType;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   * @type {ProgressColor}
   */
  color?: ProgressColor;
  /**
   * Track / ring thickness preset.
   *
   * @default "medium"
   * @type {ProgressSize}
   */
  size?: ProgressSize;
  /**
   * Show percentage label inside circular progress.
   *
   * @default false
   * @type {boolean}
   */
  showLabel?: boolean;
}
