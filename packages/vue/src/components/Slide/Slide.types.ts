import type { SharedTransitionProps, TransitionTimeout } from "../../types";

export type SlideTimeout = TransitionTimeout;
export type SlideDirection = "left" | "right" | "up" | "down";

/**
 * Props mirror `@okkly/react`'s `<Slide>` name-for-name, which in turn
 * follows MUI's Slide. See {@link SharedTransitionProps} for `in`/`appear`/
 * `easing`/`keepMounted` and the differences from React's transition family
 * there.
 */
export interface SlideProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {SlideTimeout}
   */
  timeout?: SlideTimeout;
  /**
   * Direction the child slides in from — it exits the same way it came.
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
}
