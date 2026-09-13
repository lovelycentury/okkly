import type { ReactNode } from "react";
import type { FieldColor, FieldSize } from "../Field/Field.types";

export type TimeFieldSize = FieldSize;
export type TimeFieldColor = FieldColor;

/**
 * Closest MUI counterpart is MUI X's `TimeField` /
 * `TimePicker` (https://mui.com/x/react-date-pickers/time-field/): masked
 * text input with a time popover. Deliberate gaps: no `sx`/`slots`, fixed
 * `HH:mm` mask, and the value API is `Date | null` (time-of-day on a
 * fixed base day) for consistency with `DateField` / `DateTimeField`.
 */
export interface TimeFieldProps {
  /**
   * Label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Hide Label.
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   * @type {TimeFieldSize}
   */
  size?: TimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {TimeFieldColor}
   */
  color?: TimeFieldColor;
  /**
   * Error.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Helper Text.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Value.
   *
   * @default undefined
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Default Value.
   *
   * @default null
   * @type {Date | null}
   */
  defaultValue?: Date | null;
  /**
   * On Change.
   *
   * @default undefined
   * @type {(value: Date | null) => void}
   */
  onChange?: (value: Date | null) => void;
  /**
   * Min.
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Max.
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * On Open Change.
   *
   * @default undefined
   * @type {(open: boolean) => void}
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Placeholder.
   *
   * @default "HH:mm"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
}
