export type LogoLayout = "compact" | "horizontal" | "stacked";
export type LogoTone = "multi" | "mint" | "indigo" | "dante" | "violet" | "ember";
export type LogoVariant = "filled" | "outlined" | "pure";

/**
 * Brand logo — the disc mark in three treatments. Props mirror
 * `@okkly/react`'s `<Logo>` name-for-name: `layout`/`variant`/`tone`/
 * `label`/`showLabel`/`size`.
 *
 * `filled` is the identity mark: a tone disc with the glyph knocked out in ink.
 * `outlined` reduces the disc to a ring and strokes the glyph in the tone, for
 * one-ink use — stamps, engraving, watermarks. `pure` drops the container
 * altogether and crops to the glyph, for favicons and dense chrome.
 *
 * `layout` controls arrangement: `compact` (nav bars), `horizontal` (headers),
 * `stacked` (mobile, centered emblem with the label below).
 */
export interface LogoProps {
  /**
   * Lockup arrangement.
   *
   * @default "horizontal"
   */
  layout?: LogoLayout;
  /**
   * Container treatment.
   *
   * @default "filled"
   */
  variant?: LogoVariant;
  /**
   * Emblem colorway. `"multi"` is the brand gradient.
   *
   * @default "multi"
   */
  tone?: LogoTone;
  /**
   * Wordmark text.
   *
   * @default "okkly"
   */
  label?: string;
  /**
   * Shows the wordmark.
   *
   * @default true
   */
  showLabel?: boolean;
  /**
   * Overrides emblem size. Defaults: compact 24px, others 48px.
   *
   * @default undefined
   */
  size?: number | string;
}
