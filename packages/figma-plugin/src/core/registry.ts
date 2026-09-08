/**
 * Idempotent teardown so the plugin is safely rerunnable.
 *
 * Pages are wiped by position, not by name: the first page in the file always
 * stays (it holds the hand-drawn logo — see `core/logo`) and every page after
 * it goes, whatever it is called. Variable collections and styles are still
 * namespaced with `NS`, so teardown removes exactly those and leaves the user's
 * own styles alone.
 */

import { NS, PAGE_MARK } from "../tokens";

/** Wipe the previous run: every page but the first, plus namespaced styles. */
export async function teardown(): Promise<void> {
  await figma.loadAllPagesAsync();

  // ── Pages ───────────────────────────────────────────────────
  // Generated pages are appended, so the first page is never one of ours.
  const [survivor, ...doomed] = figma.root.children;
  await figma.setCurrentPageAsync(survivor);
  for (const p of doomed) p.remove();

  // ── Variable collections ────────────────────────────────────
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of collections) {
    if (c.name.startsWith(NS)) c.remove();
  }

  // ── Styles ──────────────────────────────────────────────────
  const paints = await figma.getLocalPaintStylesAsync();
  const texts = await figma.getLocalTextStylesAsync();
  const effects = await figma.getLocalEffectStylesAsync();
  for (const s of [...paints, ...texts, ...effects]) {
    if (s.name.startsWith(NS)) s.remove();
  }
}

/** Create a fresh, marked page and make it current. */
export async function createPage(title: string): Promise<PageNode> {
  const page = figma.createPage();
  page.name = `${PAGE_MARK} ${title}`;
  return page;
}
