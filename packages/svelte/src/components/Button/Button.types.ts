import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

type SharedProps = {
  /**
   * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
   *
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   */
  color?: ButtonColor;
  /**
   * Shape of the button. Can be `pill` or `rounded`.
   *
   * @default "pill"
   */
  shape?: ButtonShape;
  /**
   * Size of the button. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  size?: ButtonSize;
  /**
   * Whether the button takes the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   */
  disableRipple?: boolean;
  /**
   * Whether the loading indicator is visible and the button is disabled.
   *
   * @default false
   */
  loading?: boolean;
  /**
   * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
   *
   * @default "center"
   */
  loadingPosition?: ButtonLoadingPosition;
  /**
   * Icon before the label.
   *
   * @default undefined
   */
  startIcon?: Snippet;
  /**
   * Icon after the label.
   *
   * @default undefined
   */
  endIcon?: Snippet;
  /**
   * Label of the button.
   *
   * @default undefined
   */
  children?: Snippet;
};

/**
 * Props mirror `@okkly/react`'s `<Button>` name-for-name, which in turn follows
 * MUI's Button API. `startIcon`/`endIcon`/`children` are snippets rather than
 * `ReactNode`, and everything the element itself understands — `class`,
 * `onclick`, `aria-*` — spreads through to the rendered `<button>`/`<a>`.
 */
export type ButtonProps = SharedProps &
  Omit<HTMLButtonAttributes & HTMLAnchorAttributes, keyof SharedProps>;
