export type TabsColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TabsVariant = "standard" | "scrollable";
export type TabsOrientation = "horizontal" | "vertical";

/**
 * Vue-forced difference from React's `TabItem`: `label` and `icon` narrow
 * from `ReactNode` to `string` — `icon` is raw SVG markup (e.g. an
 * `@okkly/icons` export), rendered the same way `Icon`'s own `icon` prop is.
 * There is no slot equivalent here since this whole object, not just one
 * field of it, is a plain data prop.
 */
export interface TabItem {
  /** Tab label. */
  label: string;
  /** Stable tab identifier passed to `v-model` / `change`. */
  value: string;
  /** Leading icon — raw SVG markup. */
  icon?: string;
  disabled?: boolean;
}

/**
 * Props follow MUI's Tabs API (https://mui.com/material-ui/api/tabs/) closely,
 * mirroring `@okkly/react`'s `<Tabs>` name-for-name: `variant`/`orientation`
 * match name-for-name. Deliberate gaps carried over from React: tabs come
 * from an `items` array (not `Tab` children composition), `color` uses
 * okkly tone names, and tab panels are left to the consumer in v1.
 *
 * Vue-forced difference: the controlled `value` + `onChange` pair becomes an
 * unnamed `defineModel<string>()`. `defaultValue` stays a real prop — it
 * seeds the model only while it is unbound, read in a computed fallback
 * (falling back further to the first tab's value) rather than written into
 * the model on mount. `className` is dropped — a consumer's `class` merges
 * onto the root automatically.
 */
export interface TabsProps {
  /**
   * Tab options.
   *
   * @default undefined
   */
  items: TabItem[];
  /**
   * Initial selection (uncontrolled).
   *
   * @default undefined
   */
  defaultValue?: string;
  /**
   * Accent tone for the active indicator.
   *
   * @default "primary"
   */
  color?: TabsColor;
  /**
   * `standard` shows an underline indicator; `scrollable` adds horizontal overflow.
   *
   * @default "standard"
   */
  variant?: TabsVariant;
  /**
   * Orientation.
   *
   * @default "horizontal"
   */
  orientation?: TabsOrientation;
}
