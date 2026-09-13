import type { UseRippleReturn } from "../../composables/useRipple";

export interface RippleProps {
  /** Ripples currently painted, keyed by id. */
  ripples: UseRippleReturn["ripples"]["value"];
  /** Called with a ripple's id once its animation finishes. */
  onRippleEnd: UseRippleReturn["hideRipple"];
}
