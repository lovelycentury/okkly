import type { AvatarColor, AvatarSize } from "../Avatar/Avatar.types";

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupSpacing = "dense" | "default" | "loose";

/**
 * Props follow MUI's AvatarGroup API (https://mui.com/material-ui/api/avatar-group/)
 * for `max`/`total`, mirroring `@okkly/react`'s `<AvatarGroup>` name-for-name:
 * `max`/`total`/`size`/`spacing`/`ring`/`hues` all match. Deliberate
 * gaps/renames carried over from React: `spacing` takes this design's three
 * named steps instead of a raw px number, `size` overrides every member's
 * `Avatar` size instead of relying on MUI's `sx`-based sizing, `hues` cycles
 * this design's tone palette across members instead of MUI's single
 * `variant`, no `renderSurplus` (the surplus chip's look is fixed by the
 * design).
 *
 * Vue-forced difference: `children` becomes the default slot, expected to be
 * `Avatar` elements. This component reads them via the slot function's own
 * returned vnodes and clones each with an overridden `size`/`color` using
 * Vue's `cloneVNode` — the same transparent-override contract React's
 * version gets from `cloneElement`.
 */
export interface AvatarGroupProps {
  /**
   * Avatars visible before the "+N" chip.
   *
   * @default 5
   */
  max?: number;
  /**
   * Real member count backing the "+N" chip, when higher than the number of
   * `Avatar` children.
   *
   * @default undefined
   */
  total?: number;
  /**
   * Diameter applied to every member.
   *
   * @default "sm"
   */
  size?: AvatarGroupSize;
  /**
   * Overlap amount.
   *
   * @default "default"
   */
  spacing?: AvatarGroupSpacing;
  /**
   * Canvas-coloured separator ring around each member.
   *
   * @default true
   */
  ring?: boolean;
  /**
   * Gradient tone cycled across members, in order.
   *
   * @default ["mint"]
   */
  hues?: AvatarColor[];
}
