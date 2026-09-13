/** Makes a label safe to use as a CSS `grid-area` name. */
export const escapeGridAreaName = (name: string): string =>
  name.replace(/\W/g, (character) => character.codePointAt(0)?.toString() ?? "-");

export const getCellId = (row: string, column: string): string =>
  `${escapeGridAreaName(row)}-${escapeGridAreaName(column)}`;

/**
 * Escapes text for an Angular template: the HTML specials, plus `{`, `}` and
 * `@`, which interpolation and control-flow syntax would otherwise claim.
 */
export const escapeTemplateText = (value: string): string =>
  value.replace(/[&<>"'{}@]/g, (character) => `&#${character.codePointAt(0)};`);

export type ScreenshotMatrixProps = {
  /** Shown above the matrix and used as the snapshot filename. */
  name: string;
  columns: readonly string[];
  rows: readonly string[];
  /** The browser the matrix was captured in, printed into the image. */
  browserName: string;
  /** One cell per column/row combination, each placed by its `grid-area`. */
  children: readonly string[];
};

/**
 * The grid the captured cells are laid out on — `@okkly/react`'s
 * `ScreenshotMatrix`, returning an Angular template instead of JSX. It is
 * itself mounted and photographed, so the labels end up inside the committed
 * baseline and a failing diff says which variant broke.
 */
export const ScreenshotMatrix = (props: ScreenshotMatrixProps): string => {
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

    return lines.join(" ");
  };

  const rowLabels = props.rows.map((row) => GridLabel({ name: row, type: "row" }));
  const columnLabels = props.columns.map((column) => GridLabel({ name: column, type: "column" }));

  return [
    `<div style="width: max-content; font-family: Arial, sans-serif">`,
    `<div style="margin-bottom: 2rem">`,
    `<h1 style="font-size: 1.25rem; line-height: 1.75rem; margin: 0">Screenshot test: ${escapeTemplateText(props.name)}</h1>`,
    `<div>Browser: ${escapeTemplateText(props.browserName)}</div>`,
    `</div>`,
    `<div style="display: grid; gap: 2rem; grid-template-rows: auto; width: max-content; align-items: center; justify-content: center; grid-template-columns: auto repeat(${props.columns.length}, 1fr); grid-template-areas: ${escapeTemplateText(getGridTemplateAreas())}">`,
    `<div style="grid-area: blank"></div>`,
    ...props.children,
    ...rowLabels,
    ...columnLabels,
    `</div>`,
    `</div>`,
  ].join("");
};

export const GridLabel = (props: { type: "column" | "row"; name: string }): string =>
  `<div style="text-align: center; grid-area: ${props.type}-${escapeGridAreaName(props.name)}">${escapeTemplateText(props.name)}</div>`;
