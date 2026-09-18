export type ProgressVariant = "determinate" | "indeterminate";
export type ProgressType = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's LinearProgress / CircularProgress APIs
 * (https://mui.com/material-ui/api/linear-progress/) as closely as this
 * design allows, mirroring `@okkly/react`'s `<Progress>` name-for-name:
 * `value`/`variant`/`type`/`color`/`size`/`showLabel` match name-for-name.
 * Deliberate gaps carried over from React: no `sx`/`classes`, `type` selects
 * linear vs circular (MUI splits these into two components), circular shows
 * an optional percentage label.
 */
export interface ProgressProps {
  /**
   * Progress value, 0–100. Ignored when `variant="indeterminate"`.
   *
   * @default 0
   */
  value?: number;
  /**
   * Known vs unknown duration.
   *
   * @default "determinate"
   */
  variant?: ProgressVariant;
  /**
   * Linear bar or circular ring.
   *
   * @default "linear"
   */
  type?: ProgressType;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   */
  color?: ProgressColor;
  /**
   * Track / ring thickness preset.
   *
   * @default "medium"
   */
  size?: ProgressSize;
  /**
   * Show percentage label inside circular progress.
   *
   * @default false
   */
  showLabel?: boolean;
}
