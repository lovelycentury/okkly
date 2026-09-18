export type FabVariant = "standard" | "soft";
export type FabColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type FabSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Fab API (https://mui.com/material-ui/api/fab/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Fab>`
 * name-for-name: `color`/`size`/`disabled`/`href` match name-for-name.
 * Deliberate gaps/renames carried over from React: `variant` is
 * `"standard"|"soft"` instead of MUI's `"circular"|"extended"` — shape here
 * is inferred from whether the `label` slot is filled (the "extended" pill)
 * rather than a separate enum value, and `"soft"` is this design's
 * de-emphasized surface treatment (no MUI equivalent). No
 * `disableRipple`/`disableFocusRipple` split — one `disableRipple` covers
 * both, matching `Button`. No built-in `SpeedDial` — MUI ships that as its
 * own component; compose plain `Fab`s instead (see the "Speed dial" story).
 *
 * Vue-forced difference: React's required `icon` prop becomes the default
 * slot — the glyph, always present — and `label` becomes the `label` slot.
 * Everything the element itself understands (`class`, `@click`, `aria-*`…)
 * falls through to the rendered `<button>`/`<a>`. Provide `aria-label` when
 * the `label` slot is empty (a plain icon FAB needs one).
 */
export interface FabProps {
  /**
   * Fill treatment.
   *
   * @default "standard"
   */
  variant?: FabVariant;
  /**
   * Fill colour (dante-ready). Only affects the "standard" variant.
   *
   * @default "primary"
   */
  color?: FabColor;
  /**
   * Diameter.
   *
   * @default "medium"
   */
  size?: FabSize;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   */
  disableRipple?: boolean;
  /**
   * Whether the control is disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Renders an `<a>` instead of a `<button>`. A disabled link drops its href.
   *
   * @default undefined
   */
  href?: string;
}
