import type { HTMLAttributes, ReactNode, SyntheticEvent } from "react";

export type TabsColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TabsVariant = "standard" | "scrollable";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabItem {
  /** Tab label. */
  label: ReactNode;
  /** Stable tab identifier passed to `value` / `onChange`. */
  value: string;
  /** Leading icon. */
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Props follow MUI's Tabs API (https://mui.com/material-ui/api/tabs/) closely:
 * `value`/`onChange`/`variant`/`orientation` match name-for-name. Deliberate
 * gaps: tabs come from an `items` array (not `Tab` children composition),
 * `color` uses okkly tone names, and tab panels are left to the consumer in v1.
 */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /**
   * Tab options.
   *
   * @default undefined
   * @type {TabItem[]}
   */
  items: TabItem[];
  /**
   * Selected tab value.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Initial selection (uncontrolled).
   *
   * @default undefined
   * @type {string}
   */
  defaultValue?: string;
  /**
   * Fires when the active tab changes.
   *
   * @default undefined
   * @type {(event: SyntheticEvent, value: string) => void}
   */
  onChange?: (event: SyntheticEvent, value: string) => void;
  /**
   * Accent tone for the active indicator.
   *
   * @default "primary"
   * @type {TabsColor}
   */
  color?: TabsColor;
  /**
   * `standard` shows an underline indicator; `scrollable` adds horizontal overflow.
   *
   * @default "standard"
   * @type {TabsVariant}
   */
  variant?: TabsVariant;
  /**
   * Orientation.
   *
   * @default "horizontal"
   * @type {TabsOrientation}
   */
  orientation?: TabsOrientation;
}
