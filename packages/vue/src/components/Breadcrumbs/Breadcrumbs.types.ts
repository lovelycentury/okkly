/**
 * Vue-forced difference from React's `BreadcrumbItem`: `label` and `icon`
 * narrow from `ReactNode` to `string` — `icon` is raw SVG markup (e.g. an
 * `@okkly/icons` export), rendered the same way `Icon`'s own `icon` prop is.
 * There is no slot equivalent here since this whole object, not just one
 * field of it, is a plain data prop.
 */
export interface BreadcrumbItem {
  /** Crumb text. */
  label: string;
  /** Renders this crumb as a link. The last item ignores it — it's always the current page. */
  href?: string;
  /** Leading icon (e.g. a home glyph on the first crumb) — raw SVG markup. */
  icon?: string;
}

/**
 * Props follow MUI's Breadcrumbs API (https://mui.com/material-ui/api/breadcrumbs/)
 * as closely as this design allows, mirroring `@okkly/react`'s
 * `<Breadcrumbs>` name-for-name: `items`/`maxItems`/`itemsBeforeCollapse`/
 * `itemsAfterCollapse`/`expandAriaLabel` match name-for-name. Deliberate
 * gaps carried over from React: crumbs come from a plain `items` array
 * instead of `children` composition, and there's no
 * `expandText`/custom collapse render prop — the "…" is a fixed built-in
 * button.
 *
 * Vue-forced difference: `separator` (a `ReactNode` defaulting to a built-in
 * chevron) becomes the `separator` slot — leave it empty for the default
 * chevron. `className` is dropped — a consumer's `class` merges onto the
 * root automatically.
 */
export interface BreadcrumbsProps {
  /**
   * Path segments, in order. The last one renders as the current page, not a link.
   *
   * @default undefined
   */
  items: BreadcrumbItem[];
  /**
   * Collapses the middle crumbs behind a "…" once `items.length` exceeds this.
   *
   * @default 8
   */
  maxItems?: number;
  /**
   * Crumbs kept visible before the collapsed "…".
   *
   * @default 1
   */
  itemsBeforeCollapse?: number;
  /**
   * Crumbs kept visible after the collapsed "…".
   *
   * @default 1
   */
  itemsAfterCollapse?: number;
  /**
   * Accessible name for the "…" expand button.
   *
   * @default "Show all crumbs"
   */
  expandAriaLabel?: string;
}
