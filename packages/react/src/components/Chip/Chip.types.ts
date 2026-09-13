import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";

export type ChipVariant = "glass" | "solid" | "outline" | "accent" | "dante";
export type ChipSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Chip API (https://mui.com/material-ui/api/chip/) as
 * closely as this design allows: `label`/`icon`/`size`/`disabled`/`onClick`
 * match name-for-name. Deliberate gaps/renames: `onDelete` → `onRemove`
 * (clearer intent, same trailing-× behaviour), no `avatar` (no avatar
 * concept in this design; use `icon`), no `variant="filled"|"outlined"`
 * (this design's five surface `variant`s replace MUI's two), `clickable` is
 * inferred from `onClick` being set rather than a separate boolean.
 */
export interface ChipProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  /**
   * Chip text.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label: ReactNode;
  /**
   * Surface style.
   *
   * @default "glass"
   * @type {ChipVariant}
   */
  variant?: ChipVariant;
  /**
   * Chip size.
   *
   * @default "medium"
   * @type {ChipSize}
   */
  size?: ChipSize;
  /**
   * Active/filter state.
   *
   * @default false
   * @type {boolean}
   */
  selected?: boolean;
  /**
   * Leading status dot. Ignored when `icon` is set.
   *
   * @default false
   * @type {boolean}
   */
  dot?: boolean;
  /**
   * Leading icon — overrides `dot`.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Shows a trailing × to remove the chip.
   *
   * @default false
   * @type {boolean}
   */
  removable?: boolean;
  /**
   * Non-interactive; blocks `onClick` and `onRemove`.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Makes the chip clickable (e.g. a filter toggle). Adds button semantics.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void}
   */
  onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  /**
   * Fires when the trailing × is activated.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLButtonElement>) => void}
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Accessible name for the trailing × button.
   *
   * @default "Remove"
   * @type {string}
   */
  removeLabel?: string;
}
