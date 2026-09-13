import type { ReactNode } from "react";

export type ButtonGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonGroupVariant = "primary" | "secondary";

export interface ButtonGroupItem {
  /** Segment text. */
  label?: ReactNode;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ButtonGroupMenuItem {
  label: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * MUI's own "split button" recipe (https://mui.com/material-ui/react-button-group/#split-button)
 * — `ButtonGroup` + `Button` + `Menu` composed by the consumer — is folded
 * into this single component via `action`/`menu` instead. For a plain row of
 * independent toggle buttons, use `SegmentedToggle` — that's the dedicated
 * selection control (this component only ever renders one action).
 */
export interface ButtonGroupProps {
  /**
   * The main action: a one-click default, always visible.
   *
   * @default undefined
   * @type {ButtonGroupItem}
   */
  action: ButtonGroupItem;
  /**
   * Fill treatment.
   *
   * @default "primary"
   * @type {ButtonGroupVariant}
   */
  variant?: ButtonGroupVariant;
  /**
   * Dropdown opened by the chevron — variants of `action`, not unrelated commands.
   *
   * @default []
   * @type {ButtonGroupMenuItem[]}
   */
  menu?: ButtonGroupMenuItem[];
  /**
   * Tone colour (dante-ready).
   *
   * @default "primary"
   * @type {ButtonGroupColor}
   */
  color?: ButtonGroupColor;
  /**
   * Disables the whole split button.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Accessible name for the chevron toggle.
   *
   * @default "Open menu"
   * @type {string}
   */
  menuAriaLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
