export type IconButtonVariant = "ghost" | "glass" | "solid";
export type IconButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type IconButtonSize = "small" | "medium" | "large";

/**
 * Props follow MUI's IconButton API (https://mui.com/material-ui/api/icon-button/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<IconButton>`
 * name-for-name: `variant`/`color`/`size`/`disabled`/`disableRipple`/`href`
 * match name-for-name. Deliberate gaps carried over from React: `variant` is
 * `"ghost"|"glass"|"solid"` (surface treatment — MUI encodes fill via `color`
 * instead), no `edge` padding tweak, no generic `component` polymorphism
 * (use `href` for links, exactly like `Button`).
 *
 * Vue-forced difference: React's `icon` prop and `children` fallback (`icon
 * ?? children`) collapse into a single default slot — the glyph, whichever
 * way you pass it. Everything the element itself understands (`class`,
 * `@click`, `aria-*`…) falls through to the rendered `<button>`/`<a>`.
 * Provide `aria-label` when the control has no visible text — it always
 * doesn't, since the slot is a bare icon.
 */
export interface IconButtonProps {
  /**
   * Surface treatment.
   *
   * @default "ghost"
   */
  variant?: IconButtonVariant;
  /**
   * Accent tone for focus glow (and rare tint).
   *
   * @default "primary"
   */
  color?: IconButtonColor;
  /**
   * Square tap target size.
   *
   * @default "medium"
   */
  size?: IconButtonSize;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   */
  disableRipple?: boolean;
  /**
   * Whether the control is disabled.
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
