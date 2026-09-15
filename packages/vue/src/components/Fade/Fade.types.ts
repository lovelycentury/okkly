import type { SharedTransitionProps, TransitionTimeout } from "../../types";

export type FadeTimeout = TransitionTimeout;

/**
 * Props mirror `@okkly/react`'s `<Fade>` name-for-name, which in turn follows
 * MUI's Fade. See {@link SharedTransitionProps} for `in`/`appear`/`easing`/
 * `keepMounted` and the differences from React's transition family there.
 */
export interface FadeProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {FadeTimeout}
   */
  timeout?: FadeTimeout;
}
