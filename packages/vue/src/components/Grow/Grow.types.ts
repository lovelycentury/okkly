import type { SharedTransitionProps, TransitionTimeoutWithAuto } from "../../types";

export type GrowTimeout = TransitionTimeoutWithAuto;

/**
 * Props mirror `@okkly/react`'s `<Grow>` name-for-name, which in turn follows
 * MUI's Grow. See {@link SharedTransitionProps} for `in`/`appear`/`easing`/
 * `keepMounted` and the differences from React's transition family there.
 *
 * `timeout` defaults to `"auto"` here, unlike the rest of the family: the
 * duration is derived from the child's height, so a tall panel takes longer
 * than a short one and both feel like the same speed. The scale runs at
 * two-thirds of that duration and, on the way out, starts a third of the way
 * in — which is why the exit reads as fading first and shrinking after.
 */
export interface GrowProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default "auto"
   * @type {GrowTimeout}
   */
  timeout?: GrowTimeout;
}
