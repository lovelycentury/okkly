import type { HTMLAttributes, ReactNode } from "react";

/**
 * Layered deep-space background — nebulae, twinkling stars, a falling dante
 * spark, a distant flaring beacon, micro-fireworks and film grain.
 *
 * The look is a straight descendant of the PixiJS scene in
 * packages/figma-plugin/docs/bg-lab, rebuilt as one SVG driven by CSS
 * keyframes: no canvas, no render loop, no runtime dependency. Filamented
 * nebulae come from feTurbulence + feDisplacementMap warping a soft ellipse,
 * which is what the generated noise textures were doing by hand.
 *
 * Fills its nearest positioned ancestor, so size it with a wrapper: a
 * `position: fixed; inset: 0` div for a full-page background, or a
 * `position: relative` hero section for an embedded one.
 *
 * Everything animates `transform` and `opacity` only, so the scene stays on
 * the compositor and never forces layout. `prefers-reduced-motion` settles it
 * on a calm still frame unless `respectReducedMotion` is off.
 */

export type BackgroundPreset = "aurora" | "midnight" | "neon" | "void";
export type BackgroundQuality = "low" | "medium" | "high";

export interface AnimatedBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which palette to render. Defaults to `"aurora"`.
   *
   * @default "aurora"
   * @type {BackgroundPreset}
   */
  preset?: BackgroundPreset;
  /**
   * How many stars, beacons and bursts to draw. Defaults to `"medium"`.
   *
   * @default "medium"
   * @type {BackgroundQuality}
   */
  quality?: BackgroundQuality;
  /**
   * Drift the scene against pointer movement. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  parallax?: boolean;
  /**
   * The rare micro-firework bursts. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  fireworks?: boolean;
  /**
   * Settle on a still frame under `prefers-reduced-motion`. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  respectReducedMotion?: boolean;
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
  dur: number;
  delay: number;
}

export interface Nebula {
  /** Centre, as a percentage of the container box. */
  x: number;
  y: number;
  /** Width as a percentage of container width; height follows from `ar`. */
  w: number;
  ar: number;
  hue: 1 | 2 | 3 | 4 | 5;
  /** Iridescent dante veil — rides a second, faster opacity cycle. */
  veil?: boolean;
  dur: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export interface Beacon {
  cx: number;
  cy: number;
  dur: number;
  delay: number;
}

export interface Sparkle {
  cx: number;
  cy: number;
  size: number;
  dur: number;
  delay: number;
}

export interface Spark {
  x: number;
  y: number;
  angle: number;
  len: number;
  dur: number;
  delay: number;
}

export interface Burst {
  cx: number;
  cy: number;
  radius: number;
  dur: number;
  delay: number;
  seed: number;
}
