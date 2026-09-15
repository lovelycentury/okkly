import type { ReactNode, TextareaHTMLAttributes } from "react";

export type TextAreaSize = "small" | "medium" | "large";
export type TextAreaColor = "primary" | "dante";
export type TextAreaResize = "none" | "vertical" | "both";

/**
 * Props follow MUI's TextField multiline API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows: `label`/`size`/`error`/`helperText`/`disabled`/
 * `fullWidth`/`color`/`value`/`onChange`/`rows`/`maxRows`/`maxLength` all match
 * name-for-name. Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps` (no CSS-in-JS
 * system here), no `variant` (the design has one visual treatment), no `margin`/`select`
 * (not applicable).
 */
export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
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
   * Field text sizing.
   *
   * @default "medium"
   * @type {TextAreaSize}
   */
  size?: TextAreaSize;
  /**
   * Tints the focus ring/glow. `dante` is a rare, deliberate accent moment.
   *
   * @default "primary"
   * @type {TextAreaColor}
   */
  color?: TextAreaColor;
  /**
   * Marks invalid + red border.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Text below the field (footer row, left).
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
   * Minimum visible rows.
   *
   * @default 3
   * @type {number}
   */
  rows?: number;
  /**
   * Maximum rows when `autosize` is enabled.
   *
   * @default undefined
   * @type {number}
   */
  maxRows?: number;
  /**
   * Grow height with content.
   *
   * @default false
   * @type {boolean}
   */
  autosize?: boolean;
  /**
   * Character limit; shows an "n / max" counter in the footer.
   *
   * @default undefined
   * @type {number}
   */
  maxLength?: number;
  /**
   * Manual resize handle behavior. Ignored when `autosize` is true.
   *
   * @default "vertical"
   * @type {TextAreaResize}
   */
  resize?: TextAreaResize;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
}
