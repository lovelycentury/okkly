export type PaginationColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type PaginationSize = "small" | "medium" | "large";
export type PaginationShape = "circular" | "rounded";

/**
 * Props follow MUI's Pagination API (https://mui.com/material-ui/api/pagination/)
 * closely, mirroring `@okkly/react`'s `<Pagination>` name-for-name:
 * `count`/`siblingCount`/`boundaryCount`/`showFirstButton`/`showLastButton`/
 * `size`/`color`/`disabled`/`shape` match name-for-name. Deliberate gaps
 * carried over from React: no `renderItem` override and no compact mobile
 * variant.
 *
 * Vue-forced difference: the controlled `page`/`onChange` pair (React has no
 * separate `defaultValue` — it is always controlled, defaulting to page 1
 * when unbound) becomes an unnamed `defineModel<number>({ default: 1 })`, so
 * consumers can `v-model` it. The click event `onChange` also carried is
 * dropped, matching `Rating`/`Checkbox`/`Switch` — nothing here needs it.
 * `className` is dropped — a consumer's `class` merges onto the root
 * automatically.
 */
export interface PaginationProps {
  /**
   * Total number of pages.
   *
   * @default undefined
   */
  count: number;
  /**
   * Pages shown on each side of the current page.
   *
   * @default 1
   */
  siblingCount?: number;
  /**
   * Pages always shown at the start and end.
   *
   * @default 1
   */
  boundaryCount?: number;
  /**
   * Show First Button.
   *
   * @default false
   */
  showFirstButton?: boolean;
  /**
   * Show Last Button.
   *
   * @default false
   */
  showLastButton?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: PaginationSize;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: PaginationColor;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Shape.
   *
   * @default "rounded"
   */
  shape?: PaginationShape;
}
