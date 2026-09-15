import type { SharedTransitionProps, TransitionTimeout } from "../../types";

export type ZoomTimeout = TransitionTimeout;

/**
 * Props mirror `@okkly/react`'s `<Zoom>` name-for-name, which in turn follows
 * MUI's Zoom. See {@link SharedTransitionProps} for `in`/`appear`/`easing`/
 * `keepMounted` and the differences from React's transition family there.
 */
export interface ZoomProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {ZoomTimeout}
   */
  timeout?: ZoomTimeout;
}
