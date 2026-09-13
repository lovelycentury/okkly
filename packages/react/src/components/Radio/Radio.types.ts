import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type RadioSize = "small" | "medium" | "large";
export type RadioColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Bare radio control — no built-in label prop, matching this design's own
 * spec (unlike Checkbox/TextField, whose prop tables do list `label`).
 * Nested inside a `RadioGroup`, it auto-wires `name`/`checked`/selection via
 * context (the "MUI RadioGroup" composition pattern from the design brief) —
 * `value` picks the option, `RadioGroup`'s `value`/`onChange` own the
 * selection. Standalone (no group), it's a normal controlled/uncontrolled
 * checkbox-shaped input via `checked`/`onChange`.
 */
export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "type" | "onChange"
> {
  /**
   * Selected in its group.
   *
   * @default undefined
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * This option's value — required when nested inside a RadioGroup.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Groups radios together. Auto-filled by a parent RadioGroup.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Control size.
   *
   * @default undefined
   * @type {RadioSize}
   */
  size?: RadioSize;
  /**
   * Fill colour (dante-ready).
   *
   * @default undefined
   * @type {RadioColor}
   */
  color?: RadioColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Optional label rendered beside the circle.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * On Change.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}
