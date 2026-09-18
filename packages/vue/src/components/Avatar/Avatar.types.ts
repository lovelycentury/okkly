export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";
export type AvatarStatus = "online" | "offline";
export type AvatarColor = "mint" | "dante" | "indigo";

/**
 * Props follow MUI's Avatar API (https://mui.com/material-ui/api/avatar/)
 * where shapes line up, mirroring `@okkly/react`'s `<Avatar>` name-for-name:
 * `src`/`alt`/`shape`/`size`/`color` all match. Deliberate gaps/additions
 * carried over from React: `initials` replaces MUI's `children` (this design
 * always renders letters, never arbitrary content), `status` adds a presence
 * dot MUI doesn't have, `color` cycles this design's tone palette instead of
 * MUI's single `sx`-driven background.
 *
 * Vue-forced differences: none — there is no `children`, and every native
 * attribute (`class`, `style`, `aria-*`, `data-*`) falls through to the root
 * element.
 */
export interface AvatarProps {
  /**
   * Image source; falls back to `initials` when unset or when it fails to load.
   *
   * @default undefined
   */
  src?: string;
  /**
   * Accessible name for the image. Also exposes the avatar as `role="img"` when set.
   *
   * @default undefined
   */
  alt?: string;
  /**
   * Fallback letters, shown when there's no image. Only the first two characters are used.
   *
   * @default undefined
   */
  initials?: string;
  /**
   * Presence dot. Omit for no status.
   *
   * @default undefined
   */
  status?: AvatarStatus;
  /**
   * Avatar shape.
   *
   * @default "circle"
   */
  shape?: AvatarShape;
  /**
   * Avatar diameter.
   *
   * @default "md"
   */
  size?: AvatarSize;
  /**
   * Gradient tone, used when no image is shown.
   *
   * @default "mint"
   */
  color?: AvatarColor;
}
