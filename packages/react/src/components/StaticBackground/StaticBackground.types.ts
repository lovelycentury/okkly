import type { HTMLAttributes, ReactNode } from "react";

/**
 * SSR-safe sibling of `AnimatedBackground` — the same nebulae, stars, grain
 * and bloom, frozen on their resting frame instead of animated.
 *
 * There is no client mount gate, no pointer listener and no `useEffect`:
 * every prop is resolved during render, so the server-rendered markup is
 * already the finished picture with no motion pass or hydration flash.
 * Reach for this over `AnimatedBackground` whenever the scene has to be
 * correct in the very first HTML response — an above-the-fold hero on a
 * content page, an email-rendered preview, a `prefers-reduced-motion`
 * fallback rendered server-side, or anywhere the animation budget isn't
 * worth spending.
 *
 * Fills its nearest positioned ancestor, so size it with a wrapper: a
 * `position: fixed; inset: 0` div for a full-page background, or a
 * `position: relative` hero section for an embedded one.
 */

export type StaticBackgroundPreset = "aurora" | "midnight" | "neon" | "void";
export type StaticBackgroundQuality = "low" | "medium" | "high";

export interface StaticBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which palette to render. Defaults to `"aurora"`.
   *
   * @default "aurora"
   * @type {StaticBackgroundPreset}
   */
  preset?: StaticBackgroundPreset;
  /**
   * How many stars to draw. Defaults to `"medium"`.
   *
   * @default "medium"
   * @type {StaticBackgroundQuality}
   */
  quality?: StaticBackgroundQuality;
  /**
   * The content-legibility gradient wash over the scene. Defaults to `false`.
   *
   * @default false
   * @type {boolean}
   */
  scrim?: boolean;
  /**
   * Rendered above the scene — e.g. a hero section's headline.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

export interface Star {
  cx: number;
  cy: number;
  r: number;
}

export interface Nebula {
  x: number;
  y: number;
  w: number;
  ar: number;
  hue: 1 | 2 | 3 | 4 | 5;
}
