import type { HTMLAttributes, ReactNode } from "react";

export interface BreadcrumbItem {
  /** Crumb text. */
  label: ReactNode;
  /** Renders this crumb as a link. The last item ignores it — it's always the current page. */
  href?: string;
  /** Leading icon (e.g. a home glyph on the first crumb). */
  icon?: ReactNode;
}

/**
 * Props follow MUI's Breadcrumbs API (https://mui.com/material-ui/api/breadcrumbs/)
 * as closely as this design allows: `separator`/`maxItems`/`itemsBeforeCollapse`/
 * `itemsAfterCollapse` match name-for-name. Deliberate gaps/renames: crumbs
 * come from a plain `items` array (`{label,href,icon}`) instead of `children`
 * (no `Link`/`Typography` composition here), and there's no
 * `expandText`/custom collapse render prop — the "…" is a fixed built-in button.
 */
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Path segments, in order. The last one renders as the current page, not a link.
   *
   * @default undefined
   * @type {BreadcrumbItem[]}
   */
  items: BreadcrumbItem[];
  /**
   * Rendered between crumbs.
   *
   * @default <ChevronRightIcon />
   * @type {ReactNode}
   */
  separator?: ReactNode;
  /**
   * Collapses the middle crumbs behind a "…" once `items.length` exceeds this.
   *
   * @default 8
   * @type {number}
   */
  maxItems?: number;
  /**
   * Crumbs kept visible before the collapsed "…".
   *
   * @default 1
   * @type {number}
   */
  itemsBeforeCollapse?: number;
  /**
   * Crumbs kept visible after the collapsed "…".
   *
   * @default 1
   * @type {number}
   */
  itemsAfterCollapse?: number;
  /**
   * Accessible name for the "…" expand button.
   *
   * @default "Show all crumbs"
   * @type {string}
   */
  expandAriaLabel?: string;
}
