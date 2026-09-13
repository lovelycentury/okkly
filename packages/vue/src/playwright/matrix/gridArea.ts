/**
 * Used both from Node (`index.ts`, orchestrating captures) and from the
 * browser bundle (`ScreenshotMatrix.vue`, laying out the grid) — a plain `.ts`
 * module rather than living inside the `.vue` file, since Playwright's Node
 * test runner has no SFC compiler for the latter.
 */

/** Makes a label safe to use as a CSS `grid-area` name. */
export const escapeGridAreaName = (name: string): string =>
  name.replace(/\W/g, (character) => character.codePointAt(0)?.toString() ?? "-");

export const getCellId = (row: string, column: string): string =>
  `${escapeGridAreaName(row)}-${escapeGridAreaName(column)}`;
