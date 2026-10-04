import type { HTMLAttributes } from "react";

export type KnobSize = "small" | "medium" | "large";

/** How the knob maps its rotation onto `min`–`max`. */
export type KnobScale = "linear" | "log";

/**
 * A rotary knob for one continuous value. Drag up/down to turn it (hold Shift
 * for fine steps), use the arrow keys, Page Up/Down for big steps, Home/End
 * for the ends, and double-click to reset to `defaultValue`.
 */
export interface KnobProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /**
   * The current value.
   * @type {number}
   */
  value: number;
  /**
   * Called with the next value while the knob turns.
   * @type {(value: number) => void}
   */
  onChange?: (value: number) => void;
  /**
   * Smallest value.
   * @default 0
   * @type {number}
   */
  min?: number;
  /**
   * Largest value.
   * @default 1
   * @type {number}
   */
  max?: number;
  /**
   * Value a double-click resets to. Without it, double-click does nothing.
   * @type {number}
   */
  defaultValue?: number;
  /**
   * `log` for values that span decades, like frequency or Q. `min` must be > 0.
   * @default "linear"
   * @type {KnobScale}
   */
  scale?: KnobScale;
  /**
   * Caption under the dial, also its accessible name.
   * @type {string}
   */
  label?: string;
  /**
   * Formats the value for assistive technology (`aria-valuetext`).
   * @type {(value: number) => string}
   */
  formatValue?: (value: number) => string;
  /**
   * Dial size.
   * @default "medium"
   * @type {KnobSize}
   */
  size?: KnobSize;
  /**
   * Disables the knob.
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
}
