import type { SharedTransitionProps, TransitionChildren, TransitionTimeout } from "../../types";

export type SlideTimeout = TransitionTimeout;
export type SlideDirection = "left" | "right" | "up" | "down";

export interface SlideProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {SlideTimeout}
   */
  timeout?: SlideTimeout;
  /**
   * Direction.
   *
   * @default "down"
   * @type {SlideDirection}
   */
  direction?: SlideDirection;
  /**
   * Element (or factory) that bounds the slide offset. Defaults to the viewport.
   *
   * @default undefined
   * @type {HTMLElement | (() => HTMLElement | null) | null}
   */
  container?: HTMLElement | (() => HTMLElement | null) | null;
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
