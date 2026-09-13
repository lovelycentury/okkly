import type { UseRippleReturn } from "@okkly/react-hooks";

export interface RippleProps {
  /**
   * Ripples.
   *
   * @default undefined
   * @type {UseRippleReturn["ripples"]}
   */
  ripples: UseRippleReturn["ripples"];
  /**
   * On Ripple End.
   *
   * @default undefined
   * @type {UseRippleReturn["hideRipple"]}
   */
  onRippleEnd: UseRippleReturn["hideRipple"];
}
