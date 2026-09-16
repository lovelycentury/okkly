export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's CircularProgress API
 * (https://mui.com/material-ui/api/circular-progress/) in spirit, mirroring
 * `@okkly/react`'s `<Spinner>` name-for-name: `size`/`color`/`thickness`
 * match the loading-indicator role. Deliberate gaps: no `sx`/`classes`, no
 * `disableShrink`/`variant` (always an indeterminate arc), SVG ring with
 * stroke-dash animation instead of MUI's two-circle technique.
 *
 * Vue-forced differences: none — there is no `children`, and every native
 * attribute (`class`, `aria-*`, `data-*`) falls through to the root `<span>`.
 */
export interface SpinnerProps {
  /**
   * Diameter preset.
   *
   * @default "medium"
   */
  size?: SpinnerSize;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   */
  color?: SpinnerColor;
  /**
   * Ring stroke width in pixels at the preset's own size. Overrides the preset.
   *
   * @default undefined
   */
  thickness?: number;
}
