import type { InputHTMLAttributes, ReactNode } from "react";

export type NumberInputSize = "small" | "medium" | "large";
export type NumberInputColor = "primary" | "dante";
export type NumberInputControls = "stepper" | "chevrons";

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * where applicable: `label`/`size`/`error`/`helperText`/`disabled`/`fullWidth`/
 * `color`/`min`/`max`/`step` all match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `variant`, and
 * `onChange` is value-focused — `(value: number | null) => void` instead of
 * MUI's `(event) => void` (native `type="number"` fields still emit events;
 * this component parses the numeric value for you).
 */
export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
> {
  /**
   * Current numeric value. `null` renders an empty field.
   *
   * @default undefined
   * @type {number | null}
   */
  value?: number | null;
  /**
   * Uncontrolled initial value.
   *
   * @default null
   * @type {number | null}
   */
  defaultValue?: number | null;
  /**
   * Called with the parsed numeric value (`null` when empty).
   *
   * @default undefined
   * @type {(value: number | null) => void}
   */
  onChange?: (value: number | null) => void;
  /**
   * Field label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Field height & text.
   *
   * @default "medium"
   * @type {NumberInputSize}
   */
  size?: NumberInputSize;
  /**
   * Tints the focus ring/glow.
   *
   * @default "primary"
   * @type {NumberInputColor}
   */
  color?: NumberInputColor;
  /**
   * Marks invalid + red border.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Text below field.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * If `true`, the field takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Trailing +/- layout (`stepper`) or up/down chevrons (`chevrons`).
   *
   * @default "stepper"
   * @type {NumberInputControls}
   */
  controls?: NumberInputControls;
  /**
   * Lower bound for stepping and clamping.
   *
   * @default undefined
   * @type {number}
   */
  min?: number;
  /**
   * Upper bound for stepping and clamping.
   *
   * @default undefined
   * @type {number}
   */
  max?: number;
  /**
   * Increment amount for steppers and arrow keys.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
}
