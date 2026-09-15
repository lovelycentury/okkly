import type { HTMLAttributes, ReactNode } from "react";
import type { AvatarColor, AvatarSize } from "../Avatar/Avatar.types";

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupSpacing = "dense" | "default" | "loose";

/**
 * Props follow MUI's AvatarGroup API (https://mui.com/material-ui/api/avatar-group/)
 * for `max`/`total`, and `children` are plain `Avatar` elements, mirroring MUI.
 * Deliberate gaps/renames: `spacing` takes this design's three named steps
 * instead of a raw px number, `size` overrides every member's `Avatar` size
 * instead of relying on MUI's `sx`-based sizing, `hues` cycles this design's
 * tone palette across members instead of MUI's single `variant`, no
 * `renderSurplus` (the surplus chip's look is fixed by the design).
 */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `Avatar` elements to stack. Their own `size`/`color` are overridden by this component.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Avatars visible before the "+N" chip.
   *
   * @default 5
   * @type {number}
   */
  max?: number;
  /**
   * Real member count backing the "+N" chip, when higher than the number of `children`.
   *
   * @default undefined
   * @type {number}
   */
  total?: number;
  /**
   * Diameter applied to every member.
   *
   * @default "sm"
   * @type {AvatarGroupSize}
   */
  size?: AvatarGroupSize;
  /**
   * Overlap amount.
   *
   * @default "default"
   * @type {AvatarGroupSpacing}
   */
  spacing?: AvatarGroupSpacing;
  /**
   * Canvas-coloured separator ring around each member.
   *
   * @default true
   * @type {boolean}
   */
  ring?: boolean;
  /**
   * Gradient tone cycled across members, in order.
   *
   * @default ["mint"]
   * @type {AvatarColor[]}
   */
  hues?: AvatarColor[];
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
