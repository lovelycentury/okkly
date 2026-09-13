import type { SharedTransitionProps, TransitionChildren, TransitionTimeout } from "../../types";

export type ZoomTimeout = TransitionTimeout;

export interface ZoomProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {ZoomTimeout}
   */
  timeout?: ZoomTimeout;
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
   * @type {TransitionChildren}
   */
  children: TransitionChildren;
}
