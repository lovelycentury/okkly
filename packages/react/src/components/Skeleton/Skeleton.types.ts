import type { HTMLAttributes } from "react";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
export type SkeletonAnimation = "pulse" | "wave" | false;

/**
 * Props follow MUI's Skeleton API (https://mui.com/material-ui/api/skeleton/) as closely
 * as this design allows: `variant`/`width`/`height`/`animation` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`, no `component` polymorphism (always a `span`).
 */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Placeholder shape.
   *
   * @default "text"
   * @type {SkeletonVariant}
   */
  variant?: SkeletonVariant;
  /**
   * Explicit width (number = px, string = any CSS length).
   *
   * @default undefined
   * @type {number | string}
   */
  width?: number | string;
  /**
   * Explicit height (number = px, string = any CSS length).
   *
   * @default undefined
   * @type {number | string}
   */
  height?: number | string;
  /**
   * Shimmer effect — pulse (default), wave, or none.
   *
   * @default "pulse"
   * @type {SkeletonAnimation}
   */
  animation?: SkeletonAnimation;
}
