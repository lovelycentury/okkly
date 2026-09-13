import type { HTMLAttributes, ReactNode } from "react";

export type PhotoVariant = "plain" | "framed" | "scrim" | "noir" | "cutout";
export type PhotoSize = "sm" | "md" | "lg";
export type PhotoRadius = "none" | "sm" | "md" | "lg" | "xl";

/**
 * Portraits & hero cutouts on a dark background. Not for icons or logos — use Icon / SVG for those.
 */
export interface PhotoProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Source image (transparent PNG best for `cutout`). Falls back to a silhouette placeholder when omitted.
   *
   * @default undefined
   * @type {string}
   */
  image?: string;
  /**
   * Alt.
   *
   * @default undefined
   * @type {string}
   */
  alt: string;
  /**
   * Frame & overlay treatment.
   *
   * @default "plain"
   * @type {PhotoVariant}
   */
  variant?: PhotoVariant;
  /**
   * Adds the bottom darkening gradient on top of any `variant`. Implied by
   * `scrim`/`noir` and by `caption`, which is unreadable without it.
   *
   * @default false
   * @type {boolean}
   */
  scrim?: boolean;
  /**
   * Alias for `variant="cutout"` — drops the frame and the corners.
   *
   * @default false
   * @type {boolean}
   */
  transparent?: boolean;
  /**
   * Portrait dimensions.
   *
   * @default "md"
   * @type {PhotoSize}
   */
  size?: PhotoSize;
  /**
   * Name/role over the scrim.
   *
   * @default undefined
   * @type {string}
   */
  caption?: string;
  /**
   * Corners (ignored if cutout).
   *
   * @default "xl"
   * @type {PhotoRadius}
   */
  radius?: PhotoRadius;
  /**
   * Show a skeleton until the image loads.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Custom placeholder when no image is provided or it fails to load.
   *
   * @default undefined
   * @type {ReactNode}
   */
  fallback?: ReactNode;
}
