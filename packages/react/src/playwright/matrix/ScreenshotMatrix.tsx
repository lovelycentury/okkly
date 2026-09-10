import type { ReactNode } from "react";

/** Makes a label safe to use as a CSS `grid-area` name. */
export const escapeGridAreaName = (name: string): string =>
  name.replace(/\W/g, (character) => character.codePointAt(0)?.toString() ?? "-");

export const getCellId = (row: string, column: string): string =>
  `${escapeGridAreaName(row)}-${escapeGridAreaName(column)}`;

export type ScreenshotMatrixProps = {
  /** Shown above the matrix and used as the snapshot filename. */
  name: string;
  columns: readonly string[];
  rows: readonly string[];
  /** The browser the matrix was captured in, printed into the image. */
  browserName: string;
  /** One cell per column/row combination, each placed by its `grid-area`. */
  children: ReactNode[];
};

/**
 * The grid the captured cells are laid out on. It is itself mounted and
 * photographed, so the labels end up inside the committed baseline and a
 * failing diff says which variant broke.
 *
 * Note this and `GridLabel` are called as plain functions rather than rendered
 * as JSX. Playwright rewrites JSX-used imports into component references that
 * only resolve inside the browser bundle, so a Node-side helper that builds an
 * element tree has to invoke them directly.
 */
export const ScreenshotMatrix = (props: ScreenshotMatrixProps) => {
  /**
   * Every cell sets `grid-area` to `{row}-{column}`, so the template places it
   * without the children needing to know their own order.
   */
  const getGridTemplateAreas = () => {
    const lines = [
      `"blank ${props.columns.map((column) => `column-${escapeGridAreaName(column)}`).join(" ")}"`,
    ];

    props.rows.forEach((row) => {
      const cells = props.columns.map((column) => getCellId(row, column)).join(" ");
      lines.push(`"row-${escapeGridAreaName(row)} ${cells}"`);
    });

    return lines.join("\n");
  };

  const rowLabels = props.rows.map((row) => GridLabel({ name: row, type: "row" }));
  const columnLabels = props.columns.map((column) => GridLabel({ name: column, type: "column" }));

  return (
    <div style={{ width: "max-content", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.25rem", lineHeight: "1.75rem", margin: 0 }}>
          Screenshot test: {props.name}
        </h1>
        <div>Browser: {props.browserName}</div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "2rem",
          gridTemplateRows: "auto",
          width: "max-content",
          alignItems: "center",
          justifyContent: "center",
          gridTemplateColumns: `auto repeat(${props.columns.length}, 1fr)`,
          gridTemplateAreas: getGridTemplateAreas(),
        }}
      >
        <div style={{ gridArea: "blank" }} />
        {props.children}
        {rowLabels}
        {columnLabels}
      </div>
    </div>
  );
};

export const GridLabel = (props: { type: "column" | "row"; name: string }) => (
  <div style={{ textAlign: "center", gridArea: `${props.type}-${escapeGridAreaName(props.name)}` }}>
    {props.name}
  </div>
);
