export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

/**
 * Props mirror `@okkly/react`'s `<Button>` name-for-name, which in turn follows
 * MUI's Button API. Deliberate differences, both because Vue has no `ReactNode`:
 * `startIcon`/`endIcon` arrive as the `start-icon`/`end-icon` slots, and the
 * label as the default slot. Everything the element itself understands —
 * `class`, `type`, `@click`, `aria-*` — falls through to the rendered
 * `<button>`/`<a>` rather than being redeclared here.
 */
export interface ButtonProps {
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
   * Whether the button is disabled. Implied by `loading`.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Renders an `<a>` instead of a `<button>`. A disabled link drops its href.
   *
   * @default undefined
   */
  href?: string;
}
