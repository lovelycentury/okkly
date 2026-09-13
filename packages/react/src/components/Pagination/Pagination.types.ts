import type { HTMLAttributes, MouseEvent } from "react";

export type PaginationColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type PaginationSize = "small" | "medium" | "large";
export type PaginationShape = "circular" | "rounded";

/**
 * Props follow MUI's Pagination API (https://mui.com/material-ui/api/pagination/)
 * closely: `count`/`page`/`onChange`/`siblingCount`/`boundaryCount`/
 * `showFirstButton`/`showLastButton`/`size`/`color`/`disabled`/`shape` match
 * name-for-name. Deliberate gaps: no `renderItem` override and no compact
 * mobile variant in v1.
 */
export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> {
  /**
   * Total number of pages.
   *
   * @default undefined
   * @type {number}
   */
  count: number;
  /**
   * Current page (1-based).
   *
   * @default 1
   * @type {number}
   */
  page?: number;
  /**
   * Fires when the page changes.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLButtonElement>, page: number) => void}
   */
  onChange?: (event: MouseEvent<HTMLButtonElement>, page: number) => void;
  /**
   * Pages shown on each side of the current page.
   *
   * @default 1
   * @type {number}
   */
  siblingCount?: number;
  /**
   * Pages always shown at the start and end.
   *
   * @default 1
   * @type {number}
   */
  boundaryCount?: number;
  /**
   * Show First Button.
   *
   * @default false
   * @type {boolean}
   */
  showFirstButton?: boolean;
  /**
   * Show Last Button.
   *
   * @default false
   * @type {boolean}
   */
  showLastButton?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   * @type {PaginationSize}
   */
  size?: PaginationSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {PaginationColor}
   */
  color?: PaginationColor;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Shape.
   *
   * @default "rounded"
   * @type {PaginationShape}
   */
  shape?: PaginationShape;
}
