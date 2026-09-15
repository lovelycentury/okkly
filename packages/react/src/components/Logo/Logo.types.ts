import type { HTMLAttributes } from "react";

export type LogoLayout = "compact" | "horizontal" | "stacked";
export type LogoTone = "multi" | "mint" | "indigo" | "dante" | "violet" | "ember";
export type LogoVariant = "filled" | "outlined" | "pure";

/**
 * Brand logo — the disc mark in three treatments.
 *
 * `filled` is the identity mark: a tone disc with the glyph knocked out in ink.
 * `outlined` reduces the disc to a ring and strokes the glyph in the tone, for
 * one-ink use — stamps, engraving, watermarks. `pure` drops the container
 * altogether and crops to the glyph, for favicons and dense chrome.
 *
 * `layout` controls arrangement: `compact` (nav bars), `horizontal` (headers),
 * `stacked` (mobile, centered emblem with the label below).
 */
export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lockup arrangement. Default: "horizontal"
   *
   * @default "horizontal"
   * @type {LogoLayout}
   */
  layout?: LogoLayout;
  /**
   * Container treatment. Default: "filled"
   *
   * @default "filled"
   * @type {LogoVariant}
   */
  variant?: LogoVariant;
  /**
   * Emblem colorway. Default: "multi" (the brand gradient)
   *
   * @default "multi"
   * @type {LogoTone}
   */
  tone?: LogoTone;
  /**
   * Wordmark text. Default: "okkly"
   *
   * @default "okkly"
   * @type {string}
   */
  label?: string;
  /**
   * Hide the wordmark. Default: true
   *
   * @default true
   * @type {boolean}
   */
  showLabel?: boolean;
  /**
   * Overrides emblem size. Defaults: compact 24px, others 48px
   *
   * @default undefined
   * @type {number | string}
   */
  size?: number | string;
}
