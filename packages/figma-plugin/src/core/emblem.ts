/**
 * Brand emblem — the disc mark, rebuilt from its Figma export so it can be
 * recolored instead of cloned once per tone.
 *
 * The artwork is a 32×32 disc with a stroked wand-and-spark glyph on top.
 * `filled` keeps that reading: tone disc, dark glyph. `outlined` drops the disc
 * to a ring and strokes the glyph in the tone itself, for one-ink use. `pure`
 * drops the container altogether — the bare glyph, for tight chrome and
 * favicons, cropped so it fills its frame instead of floating in the disc's
 * padding.
 *
 * `logo.ts` stays the source of truth for the hand-drawn lockups on the logo
 * page; this module is the parametric one — 5 accent tones × 3 treatments,
 * alone or locked up with the wordmark.
 */

import { autoFrame } from "./layout";
import { makeText } from "./nodes";
import { ThemeContext } from "./theme";

export type LogoTone = "mint" | "indigo" | "dante" | "violet" | "ember";
export type LogoVariant = "filled" | "outlined" | "pure";
/** Wordmark arrangement: label to the right of the emblem, or below it. */
export type LogoLayout = "horizontal" | "stacked";

export interface ToneSpec {
  tone: LogoTone;
  /** Human label for the specimen caption. */
  label: string;
  /** Color token the tone mirrors, for the caption's mono line. */
  token: string;
  hex: string;
}

/** The five accent colorways, in brand order. */
export const LOGO_TONES: ToneSpec[] = [
  { tone: "mint", label: "Mint", token: "accent/primary", hex: "#5EE6C1" },
  { tone: "indigo", label: "Indigo", token: "accent/secondary", hex: "#818CF8" },
  { tone: "dante", label: "Dante", token: "accent/dante", hex: "#FF3D8B" },
  { tone: "violet", label: "Violet", token: "accent/violet", hex: "#B84BFF" },
  { tone: "ember", label: "Ember", token: "accent/ember", hex: "#FF8A5C" },
];

/** The two container treatments, in the order they are shown. */
export const LOGO_VARIANTS: LogoVariant[] = ["filled", "outlined", "pure"];

/** Default wordmark beside the emblem. */
export const WORDMARK = "okkly";

/** The size ramp shown on the Foundations board, smallest approved first. */
export const LOGO_SIZES = [16, 20, 24, 32, 48, 64];

/** The artwork is authored at 32×32 and rescaled from there. */
const VB = 32;

/** Glyph ink on a filled disc — `accent/contrast`, as in the source artwork. */
const INK = "#04140F";

const STROKE = 1.5;

/** The wand-and-spark glyph, exactly as exported from Figma. */
const GLYPH = `<path d="M14.4549 17.545L11.4999 20.5L10.0749 19.075C9.93547 18.9357 9.82484 18.7703 9.74935 18.5882C9.67386 18.4061 9.63501 18.2109 9.63501 18.0137C9.63501 17.8166 9.67386 17.6214 9.74935 17.4393C9.82484 17.2572 9.93547 17.0918 10.0749 16.9525L15.9999 11.0275C16.1392 10.888 16.3047 10.7774 16.4868 10.7019C16.6689 10.6264 16.8641 10.5876 17.0612 10.5876C17.2583 10.5876 17.4535 10.6264 17.6356 10.7019C17.8177 10.7774 17.9831 10.888 18.1224 11.0275L20.4999 11.5"/>
<path d="M16 9.25V12.25"/>
<path d="M9.25 16H12.25"/>
<path d="M20.5 18.25L21.25 20.5L23.5 21.25L21.25 22L20.5 24.25L19.75 22L17.5 21.25L19.75 20.5L20.5 18.25Z"/>`;

export function toneSpec(tone: LogoTone): ToneSpec {
  const spec = LOGO_TONES.find((s) => s.tone === tone);
  if (!spec) throw new Error(`Unknown logo tone: ${tone}`);
  return spec;
}

/** Solid disc in the tone, glyph in ink on top — the primary mark. */
export function filledSvg(hex: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VB}" height="${VB}" viewBox="0 0 ${VB} ${VB}" fill="none">
<rect width="${VB}" height="${VB}" rx="${VB / 2}" fill="${hex}"/>
<g stroke="${INK}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">
${GLYPH}
</g>
</svg>`;
}

/** Root element shared by the container-less, single-color treatments. */
function strokeRoot(
  hex: string,
  body: string,
  viewBox = `0 0 ${VB} ${VB}`,
  stroke = STROKE,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VB}" height="${VB}" viewBox="${viewBox}" fill="none" stroke="${hex}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
${body}
</svg>`;
}

/**
 * Line mark: the disc reduced to a ring, glyph in the tone. One color, no
 * fills — for stamps, engraving, watermarks and one-ink print.
 */
export function outlinedSvg(hex: string): string {
  const inset = STROKE / 2;
  const side = VB - STROKE;
  const ring = `<rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${side / 2}"/>`;
  return strokeRoot(hex, `${ring}\n${GLYPH}`);
}

/**
 * The glyph's own bounding box, stroke included, padded to a square on its
 * narrow axis: the ink spans x 9.25–23.5 and y 9.25–24.25, which half a stroke
 * either side grows to 15.75 × 16.5.
 */
const GLYPH_BOX = { x: 8.125, y: 8.5, size: 16.5 };

/**
 * Bare glyph — no disc, no ring. The mark at its smallest: favicons, inline
 * with text, dense chrome, and anywhere a container would fight the layout.
 */
export function pureSvg(hex: string): string {
  const { x, y, size } = GLYPH_BOX;
  // Cropping magnifies everything by VB/size, so pre-shrink the stroke by the
  // same factor and the line lands at the weight the other two treatments carry.
  return strokeRoot(hex, GLYPH, `${x} ${y} ${size} ${size}`, (STROKE * size) / VB);
}

/** The emblem alone, at any size. */
export function logoEmblem(tone: LogoTone, size = VB, variant: LogoVariant = "filled"): FrameNode {
  const { hex } = toneSpec(tone);
  const svg =
    variant === "filled"
      ? filledSvg(hex)
      : variant === "outlined"
        ? outlinedSvg(hex)
        : pureSvg(hex);
  const node = figma.createNodeFromSvg(svg);
  node.name = `logo/${variant}/${tone}`;
  if (Math.abs(size / VB - 1) > 0.001) node.rescale(size / VB);
  return node;
}

/** Emblem size, gap and label style per arrangement. */
const LAYOUTS: Record<LogoLayout, { emblem: number; gap: number; style: string }> = {
  horizontal: { emblem: 48, gap: 16, style: "label/md" },
  stacked: { emblem: 48, gap: 12, style: "label/md" },
};

/** Emblem + wordmark — label to the right (`horizontal`) or below (`stacked`). */
export async function brandLockup(
  t: ThemeContext,
  opts: {
    tone?: LogoTone;
    variant?: LogoVariant;
    layout?: LogoLayout;
    label?: string;
    labelToken?: string;
  } = {},
): Promise<FrameNode> {
  const tone = opts.tone ?? "mint";
  const variant = opts.variant ?? "filled";
  const layout = opts.layout ?? "horizontal";
  const spec = LAYOUTS[layout];

  const row = autoFrame({
    name: `logo/lockup/${layout}/${variant}/${tone}`,
    direction: layout === "stacked" ? "VERTICAL" : "HORIZONTAL",
    gap: spec.gap,
    cross: "CENTER",
  });
  row.appendChild(logoEmblem(tone, spec.emblem, variant));
  row.appendChild(
    await makeText(t, spec.style, opts.label ?? WORDMARK, opts.labelToken ?? "text/primary"),
  );
  return row;
}
