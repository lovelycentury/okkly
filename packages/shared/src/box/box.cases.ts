/**
 * What every framework's Box component tests share: the cases that pin each
 * system prop to the CSS it sets, the layouts the breakpoint tests resize
 * around, and every screenshot matrix, cell by cell. The four packages render
 * these the same way, so they are held to the same behaviour and produce the
 * same images.
 */
import type { BoxColorToken, BoxSystemPropName, BoxSystemProps } from "./box.types";

/** Props of one Box in a test layout: the system props plus `container`. */
export type BoxTestProps = BoxSystemProps & { container?: boolean };

/**
 * A Box, optionally a second Box inside it, and 24px color swatches (Boxes as
 * well) at the innermost level — the shape of every screenshot cell.
 */
export type BoxTree = {
  outer: BoxTestProps;
  inner?: BoxTestProps;
  swatches: BoxColorToken[];
};

/** One screenshot matrix: a `BoxTree` per column/row combination. */
export interface BoxMatrix<TColumn extends string = string, TRow extends string = string> {
  name: string;
  columns: readonly TColumn[];
  rows: readonly TRow[];
  /** The viewport the matrix is captured at, when the layout depends on it. */
  viewport?: { width: number; height: number };
  cell: (column: TColumn, row: TRow) => BoxTree;
}

/**
 * One case per system prop: the value to pass, a computed CSS property it must
 * set, and the value that property must compute to. The `satisfies` clause
 * makes a system prop without a case a type error.
 */
export const BOX_SYSTEM_PROP_CASES = {
  m: [2, "margin-top", "8px"],
  mx: [2, "margin-left", "8px"],
  my: [2, "margin-bottom", "8px"],
  mt: [2, "margin-top", "8px"],
  mr: [2, "margin-right", "8px"],
  mb: [2, "margin-bottom", "8px"],
  ml: [2, "margin-left", "8px"],
  p: [2, "padding-top", "8px"],
  px: [2, "padding-right", "8px"],
  py: [2, "padding-top", "8px"],
  pt: [2, "padding-top", "8px"],
  pr: [2, "padding-right", "8px"],
  pb: [2, "padding-bottom", "8px"],
  pl: [2, "padding-left", "8px"],
  gap: [2, "column-gap", "8px"],
  rowGap: [2, "row-gap", "8px"],
  columnGap: [2, "column-gap", "8px"],
  display: ["flex", "display", "flex"],
  flexDirection: ["column", "flex-direction", "column"],
  flexWrap: ["wrap", "flex-wrap", "wrap"],
  alignItems: ["center", "align-items", "center"],
  justifyContent: ["space-between", "justify-content", "space-between"],
  alignSelf: ["flex-end", "align-self", "flex-end"],
  flexGrow: [2, "flex-grow", "2"],
  flexShrink: [0, "flex-shrink", "0"],
  flexBasis: [40, "flex-basis", "40px"],
  width: [40, "width", "40px"],
  height: [40, "height", "40px"],
  minWidth: [40, "min-width", "40px"],
  maxWidth: [40, "max-width", "40px"],
  minHeight: [40, "min-height", "40px"],
  maxHeight: [40, "max-height", "40px"],
  bgcolor: ["rgb(1, 2, 3)", "background-color", "rgb(1, 2, 3)"],
  color: ["rgb(1, 2, 3)", "color", "rgb(1, 2, 3)"],
  border: [3, "border-top-width", "3px"],
  borderColor: ["rgb(1, 2, 3)", "border-top-color", "rgb(1, 2, 3)"],
  borderRadius: [2, "border-top-left-radius", "8px"],
} as const satisfies Record<BoxSystemPropName, readonly [string | number, string, string]>;

/** The props of a 24px swatch. */
export const boxSwatch = (color: BoxColorToken): BoxTestProps => ({
  width: 24,
  height: 24,
  bgcolor: color,
  borderRadius: 1,
});

/** The layout the viewport-breakpoint tests resize the window around: `md` switches it. */
export const BOX_RESPONSIVE_LAYOUT: BoxTestProps = {
  display: "flex",
  flexDirection: { base: "column", md: "row" },
  p: { base: 1, md: 4 },
};

/**
 * A container Box of `width`, around a Box whose layout answers to it: stacked
 * until `@md` (640px), and a padding that `md` (the viewport) and `@sm` (the
 * container) both set — so the container's winning is visible.
 */
export const boxInContainer = (width: number): BoxTree => ({
  outer: { container: true, width },
  inner: {
    display: "flex",
    flexDirection: { base: "column", "@md": "row" },
    p: { base: 1, md: 2, "@sm": 3 },
  },
  swatches: [],
});

const THREE_SWATCHES: BoxColorToken[] = ["accent.primary", "accent.secondary", "accent.dante"];

const SPACING_STEPS = ["0", "1", "2", "4", "8"] as const;

const COLOR_TOKENS = [
  "accent.primary",
  "accent.dante",
  "bg.surface-raised",
  "border.strong",
  "feedback.success",
] as const satisfies readonly BoxColorToken[];

const spacing: BoxMatrix<(typeof SPACING_STEPS)[number], "padding" | "margin" | "gap"> = {
  name: "Box (spacing)",
  columns: SPACING_STEPS,
  rows: ["padding", "margin", "gap"],
  cell: (column, row) => {
    const step = Number(column);
    if (row === "padding")
      return {
        outer: { bgcolor: "bg.surface-raised", border: 1, borderColor: "border.strong", p: step },
        swatches: ["accent.primary"],
      };
    if (row === "margin")
      return {
        outer: { display: "flex", bgcolor: "bg.inset", border: 1, borderColor: "border.strong" },
        inner: { m: step },
        swatches: ["accent.secondary"],
      };
    return { outer: { display: "flex", gap: step }, swatches: THREE_SWATCHES };
  },
};

const colors: BoxMatrix<(typeof COLOR_TOKENS)[number], "bgcolor" | "borderColor"> = {
  name: "Box (colors)",
  columns: COLOR_TOKENS,
  rows: ["bgcolor", "borderColor"],
  cell: (column, row) => ({
    outer:
      row === "bgcolor"
        ? { width: 48, height: 32, bgcolor: column, borderRadius: 2 }
        : { width: 48, height: 32, border: 2, borderColor: column, borderRadius: 2 },
    swatches: [],
  }),
};

// One layout in three container widths, in one viewport: the layout follows
// its container — stacked, then a row from `@md` (640px).
const containerQueries: BoxMatrix<"320" | "560" | "720", "card"> = {
  name: "Box (container queries)",
  columns: ["320", "560", "720"],
  rows: ["card"],
  cell: (column) => ({
    outer: { container: true, width: Number(column), bgcolor: "bg.inset" },
    inner: {
      display: "flex",
      flexDirection: { base: "column", "@md": "row" },
      gap: { base: 1, "@sm": 3 },
      p: { base: 2, "@md": 4 },
      bgcolor: "bg.surface-raised",
    },
    swatches: THREE_SWATCHES,
  }),
};

// The same responsive layout below and above `md` (993px): stacked, then a row.
const responsive = (width: number): BoxMatrix<"layout", "default"> => ({
  name: `Box (responsive, ${width}px)`,
  columns: ["layout"],
  rows: ["default"],
  viewport: { width, height: 480 },
  cell: () => ({
    outer: {
      display: "flex",
      flexDirection: { base: "column", md: "row" },
      gap: { base: 1, md: 4 },
      p: { base: 2, md: 6 },
      bgcolor: "bg.surface-raised",
    },
    swatches: THREE_SWATCHES,
  }),
});

/** Every Box screenshot matrix. */
export const BOX_MATRICES = [
  spacing,
  colors,
  containerQueries,
  responsive(480),
  responsive(1024),
] as BoxMatrix[];
