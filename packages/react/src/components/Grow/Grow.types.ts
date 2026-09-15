import type {
  SharedTransitionProps,
  TransitionChildren,
  TransitionTimeoutWithAuto,
} from "../../types";

export type GrowTimeout = TransitionTimeoutWithAuto;

export interface GrowProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default "auto"
   * @type {GrowTimeout}
   */
  timeout?: GrowTimeout;
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
