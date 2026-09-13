import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "fullWidth" | "inset" | "middle";
export type DividerTextAlign = "left" | "center" | "right";

/**
 * Props follow MUI's Divider API (https://mui.com/material-ui/api/divider/) as closely
 * as this design allows: `orientation`/`flexItem`/`children`/`textAlign`/`variant`
 * match name-for-name. Deliberate gaps: no `sx`/`classes`, no `absolute` positioning
 * (always in-flow), `variant` maps to inset spacing on the line segments.
 */
export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Line direction.
   *
   * @default "horizontal"
   * @type {DividerOrientation}
   */
  orientation?: DividerOrientation;
  /**
   * Stretch to fill a flex container's cross axis.
   *
   * @default false
   * @type {boolean}
   */
  flexItem?: boolean;
  /**
   * Optional centered label (e.g. "OR").
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Label alignment when `children` is set.
   *
   * @default "center"
   * @type {DividerTextAlign}
   */
  textAlign?: DividerTextAlign;
  /**
   * Inset spacing variant.
   *
   * @default "fullWidth"
   * @type {DividerVariant}
   */
  variant?: DividerVariant;
}
