import type { InputHTMLAttributes, ReactNode } from "react";
import type { FieldAccentColor, FieldSize } from "../Field/Field.types";

export type TextFieldSize = FieldSize;
export type TextFieldColor = FieldAccentColor;

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows: `label`/`size`/`error`/`helperText`/
 * `disabled`/`fullWidth`/`color`/`value`/`onChange`/`required` all match
 * name-for-name, and `startAdornment`/`endAdornment` are lifted to the top
 * level rather than living under `InputProps`.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps` (no CSS-in-JS system
 * here), no `variant` (the design has one visual treatment, not
 * filled/outlined/standard), no `multiline`/`rows`/`select`/`margin` (not in
 * this component's Figma spec — would be new, undesigned surface).
 */
export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
> {
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
   * @type {TextFieldSize}
   */
  size?: TextFieldSize;
  /**
   * Tints the focus ring/glow. One of the design system's accent colors —
   * `dante` is a rare, deliberate accent moment; the rest are for matching
   * a field to surrounding brand/section color.
   *
   * @default "primary"
   * @type {TextFieldColor}
   */
  color?: TextFieldColor;
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
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Content rendered inside the border, before the input.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startAdornment?: ReactNode;
  /**
   * Content rendered inside the border, after the input.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment?: ReactNode;
}
