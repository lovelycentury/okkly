import type { ReactNode } from "react";
import type { FieldColor, FieldSize } from "../Field/Field.types";

export type DateTimeFieldSize = FieldSize;
export type DateTimeFieldColor = FieldColor;

/**
 * Closest MUI counterpart is MUI X's `DateTimeField` /
 * `DateTimePicker` (https://mui.com/x/react-date-pickers/date-time-field/):
 * masked text input with a combined date+time popover. Deliberate gaps: no
 * `sx`/`slots`, fixed `dd.mm.yyyy, HH:mm` mask, and the picker closes on
 * Confirm via okkly `DateTimePicker`.
 */
export interface DateTimeFieldProps {
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
   * @type {DateTimeFieldSize}
   */
  size?: DateTimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {DateTimeFieldColor}
   */
  color?: DateTimeFieldColor;
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
   * @default "dd.mm.yyyy, HH:mm"
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
