import type { ReactNode } from "react";

export type BadgeColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

export type BadgeVariant = "standard" | "dot";
export type BadgeOverlap = "circular" | "rectangular";

export interface BadgeAnchorOrigin {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}

/**
 * Props follow MUI's Badge API (https://mui.com/material-ui/api/badge/) as
 * closely as this design allows: `badgeContent`/`children`/`color`/`variant`/
 * `max`/`invisible`/`overlap`/`anchorOrigin` match name-for-name.
 * Deliberate gaps: no `showZero` (zero counts stay hidden like MUI's default),
 * no `anchorOrigin` presets beyond top/bottom × left/right, and the default
 * uncoloured pill uses this design's neutral raised surface instead of MUI's
 * grey `default`.
 */
export interface BadgeProps {
  /**
   * Count or short label. Hidden when `0`, unless you pass a non-numeric node.
   *
   * @default undefined
   * @type {ReactNode}
   */
  badgeContent?: ReactNode;
  /**
   * Element the badge anchors to. Omit for a standalone pill/dot.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Semantic fill tone. Omit for a neutral raised count.
   *
   * @default undefined
   * @type {BadgeColor}
   */
  color?: BadgeColor;
  /**
   * Number pill or status dot.
   *
   * @default "standard"
   * @type {BadgeVariant}
   */
  variant?: BadgeVariant;
  /**
   * Overflow cap — numbers above this render as `{max}+`.
   *
   * @default 99
   * @type {number}
   */
  max?: number;
  /**
   * Hides the badge without unmounting the anchor it sits on.
   *
   * @default false
   * @type {boolean}
   */
  invisible?: boolean;
  /**
   * Adjusts corner offset for circular vs rectangular anchors.
   *
   * @default "circular"
   * @type {BadgeOverlap}
   */
  overlap?: BadgeOverlap;
  /**
   * Corner placement relative to `children`.
   *
   * @default { vertical: "top", horizontal: "right" }
   * @type {BadgeAnchorOrigin}
   */
  anchorOrigin?: BadgeAnchorOrigin;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
