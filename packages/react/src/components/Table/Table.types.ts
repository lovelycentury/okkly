import type { HTMLAttributes, ReactNode, TdHTMLAttributes } from "react";

export type TableDensity = "default" | "dense";

/**
 * Props follow MUI's Table API (https://mui.com/material-ui/api/table/) for
 * `size`/`stickyHeader` concepts via `density` and `TableContainer stickyHeader`.
 * Deliberate gaps: no sort/pagination/data-grid — semantic wrappers only.
 */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /**
   * Row padding preset.
   *
   * @default "default"
   * @type {TableDensity}
   */
  density?: TableDensity;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keeps the header visible while scrolling.
   *
   * @default false
   * @type {boolean}
   */
  stickyHeader?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * Hover.
   *
   * @default false
   * @type {boolean}
   */
  hover?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Renders `<th>` instead of `<td>`.
   *
   * @default false
   * @type {boolean}
   */
  head?: boolean;
  /**
   * Right-align numeric values.
   *
   * @default false
   * @type {boolean}
   */
  numeric?: boolean;
}

export type TableHeaderCellProps = TableCellProps;
