import type { SharedTransitionProps, TransitionChildren, TransitionTimeout } from "../../types";

export type FadeTimeout = TransitionTimeout;

export interface FadeProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {FadeTimeout}
   */
  timeout?: FadeTimeout;
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
