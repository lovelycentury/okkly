export type ChipVariant = "glass" | "solid" | "outline" | "accent" | "dante";
export type ChipSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Chip API (https://mui.com/material-ui/api/chip/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Chip>`
 * name-for-name where Vue lets it: `variant`/`size`/`selected`/`dot`/
 * `removable`/`disabled`/`removeLabel` match name-for-name. Deliberate
 * gaps/renames carried over from React: `onDelete` → `onRemove` (the
 * `remove` emit here), no `avatar` (use the `icon` slot), no
 * `variant="filled"|"outlined"` (this design's five surface `variant`s
 * replace MUI's two), "clickable" is inferred from whether a `click`
 * listener is attached rather than a separate boolean.
 *
 * Vue-forced differences: `label` becomes the default slot (the chip's only
 * primary content, same mapping as `Button`'s `children`) and `icon`
 * becomes the `icon` slot, since Vue has no `ReactNode`. `onClick` stays a
 * native `click` listener you attach with `@click`, but — unlike a plain
 * fallthrough — this component reads it itself (via `useAttrs()`) rather
 * than letting the browser dispatch it natively: only that lets it decide
 * `role="button"`/`tabindex`/keyboard activation from whether a listener is
 * present at all, and gate it in JS when `disabled` (the CSS
 * `pointer-events: none` alone doesn't stop a listener attached directly to
 * the element, e.g. from a test or a synthetic dispatch).
 */
export interface ChipProps {
  /**
   * Surface style.
   *
   * @default "glass"
   */
  variant?: ChipVariant;
  /**
   * Chip size.
   *
   * @default "medium"
   */
  size?: ChipSize;
  /**
   * Active/filter state.
   *
   * @default false
   */
  selected?: boolean;
  /**
   * Leading status dot. Ignored when the `icon` slot is filled.
   *
   * @default false
   */
  dot?: boolean;
  /**
   * Shows a trailing × to remove the chip.
   *
   * @default false
   */
  removable?: boolean;
  /**
   * Non-interactive; blocks `click` and `remove`.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Accessible name for the trailing × button.
   *
   * @default "Remove"
   */
  removeLabel?: string;
}
