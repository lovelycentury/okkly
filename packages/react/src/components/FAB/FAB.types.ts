import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type FabVariant = "standard" | "soft";
export type FabColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type FabSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Fab API (https://mui.com/material-ui/api/fab/) as
 * closely as this design allows: `color`/`size`/`disabled`/`href` match
 * name-for-name. Deliberate gaps/renames: `variant` is `"standard"|"soft"`
 * instead of MUI's `"circular"|"extended"` — shape here is inferred from
 * whether `label` is set (the "extended" pill) rather than a separate enum
 * value, and `"soft"` is this design's de-emphasized surface treatment (no
 * MUI equivalent). No `disableRipple`/`disableFocusRipple` split — one
 * `disableRipple` covers both, matching `Button`. No built-in `SpeedDial` —
 * MUI ships that as its own component; compose plain `Fab`s instead (see the
 * "SpeedDial" story).
 */
export type SharedProps = {
  /**
   * Fill treatment.
   *
   * @default "standard"
   * @type {FabVariant}
   */
  variant?: FabVariant;
  /**
   * Fill colour (dante-ready). Only affects the "standard" variant.
   *
   * @default "primary"
   * @type {FabColor}
   */
  color?: FabColor;
  /**
   * Diameter.
   *
   * @default "medium"
   * @type {FabSize}
   */
  size?: FabSize;
  /**
   * Glyph slot — always present.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon: ReactNode;
  /**
   * Label slot. Setting it grows the FAB into an extended pill (icon + text) instead of a plain circle.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /** Accessible name. Required when there's no visible `label` (a plain icon FAB needs one). */
  "aria-label"?: string;
};

export type FabProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;
