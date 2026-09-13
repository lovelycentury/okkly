import type { HTMLAttributes } from "react";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";
export type AvatarStatus = "online" | "offline";
export type AvatarColor = "mint" | "dante" | "indigo";

/**
 * Props follow MUI's Avatar API (https://mui.com/material-ui/api/avatar/) where
 * shapes line up: `src`/`alt` match name-for-name, `shape` covers MUI's
 * `variant="circular"|"rounded"` (no `"square"` — not part of this design).
 * Deliberate gaps/additions: `initials` replaces MUI's `children` (this design
 * always renders letters, never an arbitrary node), `status` adds a presence
 * dot MUI doesn't have, `color` cycles this design's tone palette instead of
 * MUI's single `sx`-driven background.
 */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Image source; falls back to `initials` when unset or when it fails to load.
   *
   * @default undefined
   * @type {string}
   */
  src?: string;
  /**
   * Accessible name for the image. Also exposes the avatar as `role="img"` when set.
   *
   * @default undefined
   * @type {string}
   */
  alt?: string;
  /**
   * Fallback letters, shown when there's no image. Only the first two characters are used.
   *
   * @default undefined
   * @type {string}
   */
  initials?: string;
  /**
   * Presence dot. Omit for no status.
   *
   * @default undefined
   * @type {AvatarStatus}
   */
  status?: AvatarStatus;
  /**
   * Avatar shape.
   *
   * @default "circle"
   * @type {AvatarShape}
   */
  shape?: AvatarShape;
  /**
   * Avatar diameter.
   *
   * @default "md"
   * @type {AvatarSize}
   */
  size?: AvatarSize;
  /**
   * Gradient tone, used when no image is shown.
   *
   * @default "mint"
   * @type {AvatarColor}
   */
  color?: AvatarColor;
}
