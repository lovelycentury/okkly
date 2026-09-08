/**
 * Icon system — crisp vector icons sourced from `@okkly/icons`.
 *
 * The glyph markup lives in exactly one place: `packages/icons/src/assets`.
 * This module is the Figma adapter for it — Figma's `createNodeFromSvg` has no
 * notion of `currentColor`, so each glyph is rewrapped with a concrete paint
 * and then recolored to a color token.
 *
 * Every icon is a 24×24 stroke glyph; `icon()` imports, rescales, and recolors.
 * Reuse everywhere via `icon(t, name, size, token)`. The brand logo is not an
 * icon — it is cloned from the hand-drawn logo page by `core/logo`.
 */

import * as okklyIcons from "@okkly/icons";
import { ICON_METADATA, getIconImportName } from "@okkly/icons/utils";
import { ThemeContext, colorVar } from "./theme";

function bound(v: Variable): SolidPaint {
  const p: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  return figma.variables.setBoundVariableForPaint(p, "color", v) as SolidPaint;
}

const RAW_SVG = okklyIcons as unknown as Record<string, string>;

/**
 * Drops the package's `<svg>` wrapper. The two builders below each supply their
 * own root element — one stroke-based, one fill-based — so only the shapes
 * inside are wanted here.
 */
function innerMarkup(svg: string, name: string): string {
  const match = /^<svg[^>]*>([\s\S]*)<\/svg>\s*$/.exec(svg);
  if (!match) throw new Error(`Malformed SVG for icon: ${name}`);
  return match[1];
}

/** name → inner SVG markup (paths/shapes), stroke-based, 24×24 viewBox. */
export const ICONS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  // ICON_METADATA is the registry; the package's generator guarantees every
  // entry in it has a matching asset, so a miss here means a stale build.
  for (const name of Object.keys(ICON_METADATA)) {
    const svg = RAW_SVG[getIconImportName(name)];
    if (svg) map[name] = innerMarkup(svg, name);
  }
  return map;
})();

export const ICON_NAMES = Object.keys(ICONS);

const HEAD = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5F5F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`;

/** Create an icon node, rescaled to `size` and recolored to a color token. */
export function icon(t: ThemeContext, name: string, size = 16, token = "text/primary"): FrameNode {
  const inner = ICONS[name];
  if (!inner) throw new Error(`Unknown icon: ${name}`);
  const node = figma.createNodeFromSvg(`${HEAD}${inner}</svg>`);
  node.name = `icon/${name}`;
  node.clipsContent = false;
  if (size !== 24) node.rescale(size / 24);
  const paint = bound(colorVar(t, token));
  for (const child of node.findAll((n) => "strokes" in n)) {
    (child as VectorNode).strokes = [paint];
  }
  return node;
}

const HEAD_FILL = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#F5F5F7" stroke="none">`;

/** Filled variant of an icon (e.g. a filled star), recolored to a token. */
export function iconFilled(
  t: ThemeContext,
  name: string,
  size = 16,
  token = "text/primary",
): FrameNode {
  const inner = ICONS[name];
  if (!inner) throw new Error(`Unknown icon: ${name}`);
  const node = figma.createNodeFromSvg(`${HEAD_FILL}${inner}</svg>`);
  node.name = `icon/${name}`;
  node.clipsContent = false;
  if (size !== 24) node.rescale(size / 24);
  const paint = bound(colorVar(t, token));
  for (const child of node.findAll((n) => "fills" in n)) {
    (child as VectorNode).fills = [paint];
  }
  return node;
}
