import type { ReactNode } from "react";
import type { SharedTransitionProps, TransitionTimeoutWithAuto } from "../../types";

export type CollapseTimeout = TransitionTimeoutWithAuto;
export type CollapseOrientation = "vertical" | "horizontal";

export interface CollapseProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DURATION_STANDARD
   * @type {CollapseTimeout}
   */
  timeout?: CollapseTimeout;
  /**
   * Orientation.
   *
   * @default "vertical"
   * @type {CollapseOrientation}
   */
  orientation?: CollapseOrientation;
  /**
   * Width (horizontal) or height (vertical) when collapsed.
   *
   * @default "0px"
   * @type {number | string}
   */
  collapsedSize?: number | string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}
