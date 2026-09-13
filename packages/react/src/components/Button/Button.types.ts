import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

/**
 * Props follow MUI's Button API (https://mui.com/material-ui/api/button/) as
 * closely as this design allows: `variant`/`color`/`size`/`disabled`/
 * `startIcon`/`endIcon`/`fullWidth`/`href`/`loading*`/`disableRipple` all
 * match name-for-name. Deliberate gaps: no `sx` (no CSS-in-JS system here),
 * no `classes` (use `className`), no generic `component` polymorphism (use
 * `href` instead — covers the "plain navigation" case), no
 * `disableElevation`/`disableFocusRipple` (this design has no elevation
 * concept and doesn't distinguish focus-ripple from click-ripple).
 */
export type SharedProps = {
  /**
   * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
   *
   * @default "primary"
   * @type {ButtonVariant}
   */
  variant?: ButtonVariant;
  /**
   * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   * @type {ButtonColor}
   */
  color?: ButtonColor;
  /**
   * Shape of the button. Can be `pill` or `rounded`.
   *
   * @default "pill"
   * @type {ButtonShape}
   */
  shape?: ButtonShape;
  /**
   * Size of the button. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   * @type {ButtonSize}
   */
  size?: ButtonSize;
  /**
   * Whether the button takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /**
   * Whether the loading indicator is visible and the button is disabled.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
   *
   * @default "center"
   * @type {ButtonLoadingPosition}
   */
  loadingPosition?: ButtonLoadingPosition;
  /**
   * Icon before the label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startIcon?: ReactNode;
  /**
   * Icon after the label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endIcon?: ReactNode;
  /**
   * Label of the button.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
};

export type ButtonProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;
