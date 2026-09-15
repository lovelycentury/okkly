import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "ghost" | "glass" | "solid";
export type IconButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type IconButtonSize = "small" | "medium" | "large";

/**
 * Props follow MUI's IconButton API (https://mui.com/material-ui/api/icon-button/) as
 * closely as this design allows: `color`/`size`/`disabled`/`disableRipple`/`href` match
 * name-for-name. Deliberate gaps: `variant` is `"ghost"|"glass"|"solid"` (surface
 * treatment — MUI encodes fill via `color` instead), no `edge` padding tweak, no generic
 * `component` polymorphism (use `href` for links). Accepts `icon` or `children` for the
 * glyph slot; provide `aria-label` when the control has no visible text.
 */
export type SharedProps = {
  /**
   * Surface treatment.
   *
   * @default "ghost"
   * @type {IconButtonVariant}
   */
  variant?: IconButtonVariant;
  /**
   * Accent tone for focus glow (and rare tint).
   *
   * @default "primary"
   * @type {IconButtonColor}
   */
  color?: IconButtonColor;
  /**
   * Square tap target size.
   *
   * @default "medium"
   * @type {IconButtonSize}
   */
  size?: IconButtonSize;
  /**
   * Glyph slot — prefer `icon`, fall back to `children`.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Alternative glyph slot when `icon` is omitted.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /** Accessible name. Required when there is no visible text label. */
  "aria-label"?: string;
};

export type IconButtonProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;
