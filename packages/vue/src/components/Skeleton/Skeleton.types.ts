export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
export type SkeletonAnimation = "pulse" | "wave" | false;

/**
 * Props follow MUI's Skeleton API (https://mui.com/material-ui/api/skeleton/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<Skeleton>`
 * name-for-name: `variant`/`width`/`height`/`animation` match name-for-name.
 * Deliberate gaps carried over from React: no `sx`/`classes`, no
 * `component` polymorphism (always a `span`).
 */
export interface SkeletonProps {
  /**
   * Placeholder shape.
   *
   * @default "text"
   */
  variant?: SkeletonVariant;
  /**
   * Explicit width (number = px, string = any CSS length).
   *
   * @default undefined
   */
  width?: number | string;
  /**
   * Explicit height (number = px, string = any CSS length).
   *
   * @default undefined
   */
  height?: number | string;
  /**
   * Shimmer effect — pulse (default), wave, or none.
   *
   * @default "pulse"
   */
  animation?: SkeletonAnimation;
}
