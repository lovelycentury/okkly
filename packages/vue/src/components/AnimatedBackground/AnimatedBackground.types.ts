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
 *
 * Props mirror `@okkly/react`'s `<AnimatedBackground>` name-for-name:
 * `preset`/`quality`/`parallax`/`fireworks`/`respectReducedMotion`/`scrim`.
 * `children` becomes the default slot — content rendered above the scene,
 * since Vue has no `ReactNode`.
 */

export type BackgroundPreset = "aurora" | "midnight" | "neon" | "void";
export type BackgroundQuality = "low" | "medium" | "high";

export interface AnimatedBackgroundProps {
  /**
   * Which palette to render.
   *
   * @default "aurora"
   */
  preset?: BackgroundPreset;
  /**
   * How many stars, beacons and bursts to draw.
   *
   * @default "medium"
   */
  quality?: BackgroundQuality;
  /**
   * Drift the scene against pointer movement.
   *
   * @default true
   */
  parallax?: boolean;
  /**
   * The rare micro-firework bursts.
   *
   * @default true
   */
  fireworks?: boolean;
  /**
   * Settle on a still frame under `prefers-reduced-motion`.
   *
   * @default true
   */
  respectReducedMotion?: boolean;
  /**
   * The content-legibility gradient wash over the scene.
   *
   * @default false
   */
  scrim?: boolean;
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

export interface Spoke {
  angle: number;
  len: number;
  delay: number;
}
