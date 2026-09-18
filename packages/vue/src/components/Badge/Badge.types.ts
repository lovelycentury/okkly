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
 * closely as this design allows, mirroring `@okkly/react`'s `<Badge>`
 * name-for-name where Vue lets it: `color`/`variant`/`max`/`invisible`/
 * `overlap`/`anchorOrigin` match name-for-name. Deliberate gaps carried over
 * from React: no `showZero` (zero counts stay hidden like MUI's default), no
 * `anchorOrigin` presets beyond top/bottom × left/right, and the default
 * uncoloured pill uses this design's neutral raised surface instead of MUI's
 * grey `default`.
 *
 * Vue-forced differences: the anchor (React's `children`) becomes the
 * default slot — the badge is standalone when it's empty. `badgeContent`
 * narrows from `ReactNode` to `string | number` rather than becoming a slot,
 * since its value is read back for the max-overflow/zero-hiding logic, not
 * just rendered; a slot's content can't be inspected that way. `className`
 * is dropped — a consumer's `class` merges onto the root automatically.
 */
export interface BadgeProps {
  /**
   * Count or short label. Hidden when `0`.
   *
   * @default undefined
   */
  badgeContent?: string | number;
  /**
   * Semantic fill tone. Omit for a neutral raised count.
   *
   * @default undefined
   */
  color?: BadgeColor;
  /**
   * Number pill or status dot.
   *
   * @default "standard"
   */
  variant?: BadgeVariant;
  /**
   * Overflow cap — numbers above this render as `{max}+`.
   *
   * @default 99
   */
  max?: number;
  /**
   * Hides the badge without unmounting the anchor it sits on.
   *
   * @default false
   */
  invisible?: boolean;
  /**
   * Adjusts corner offset for circular vs rectangular anchors.
   *
   * @default "circular"
   */
  overlap?: BadgeOverlap;
  /**
   * Corner placement relative to the default slot.
   *
   * @default { vertical: "top", horizontal: "right" }
   */
  anchorOrigin?: BadgeAnchorOrigin;
}
