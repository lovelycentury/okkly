/**
 * Generation pipeline — the deterministic, rerunnable orchestration:
 *
 *   fonts → teardown → variables → styles → pages → paint pages.
 *
 * Every step is idempotent; running the plugin again reproduces the same result
 * after wiping every page but the first plus the previous run's namespaced
 * variables and styles.
 */

import { resolveFonts } from "./core/fonts";
import { buildVariables } from "./core/variables";
import { buildStyles } from "./core/styles";
import { createPage, teardown } from "./core/registry";
import { primeLogos } from "./core/logo";
import { ThemeContext } from "./core/theme";
import { paintFoundations } from "./pages/foundations";
import { paintBasic } from "./pages/catalog";
import { paintIcons } from "./pages/iconsPage";

export type ProgressFn = (step: string) => void;

export async function generate(onProgress: ProgressFn): Promise<void> {
  onProgress("Resolving fonts…");
  const fonts = await resolveFonts();

  onProgress("Clearing previous run…");
  await teardown();

  // Find the hand-drawn logo before any generated page exists, so a name match
  // can't hit something the plugin drew itself.
  onProgress("Locating brand logo…");
  await primeLogos();

  onProgress("Building color & scale variables…");
  const { colorVars, numberVars } = buildVariables();

  onProgress("Building text, effect & paint styles…");
  const { textStyles, paintStyles, effectStyles } = await buildStyles(fonts);

  const t: ThemeContext = {
    fonts,
    colorVars,
    numberVars,
    textStyles,
    paintStyles,
    effectStyles,
  };

  onProgress("Creating pages…");
  const foundationsPage = await createPage("00 · Foundations");
  const iconsPage = await createPage("01 · Icons");
  const basicPage = await createPage("02 · Basic");

  onProgress("Painting Foundations…");
  await paintFoundations(t, foundationsPage);

  onProgress("Painting Icons…");
  await paintIcons(t, iconsPage);

  onProgress("Painting Basic…");
  await paintBasic(t, basicPage);

  await figma.setCurrentPageAsync(foundationsPage);
  onProgress("Done");
}
