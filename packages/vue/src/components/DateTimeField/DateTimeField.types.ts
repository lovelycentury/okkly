import type { FieldColor, FieldSize } from "../Field/Field.types";

export type DateTimeFieldSize = FieldSize;
export type DateTimeFieldColor = FieldColor;

/**
 * Closest MUI counterpart is MUI X's `DateTimeField` /
 * `DateTimePicker` (https://mui.com/x/react-date-pickers/date-time-field/):
 * masked text input with a combined date+time popover. Deliberate gaps: no
 * `sx`/`slots`, fixed `dd.mm.yyyy, HH:mm` mask, and the picker closes on
 * Confirm via okkly `DateTimePicker`.
 *
 * Props mirror `@okkly/react`'s `<DateTimeField>` name-for-name. Deliberate
 * differences, because Vue has no `ReactNode`: `label` and `helperText`
 * arrive as the `label` and `helper-text` slots. The controlled `value` +
 * `onChange` pair becomes an unnamed `defineModel<Date | null>()`; the
 * controlled `open` + `onOpenChange` pair becomes the named
 * `defineModel<boolean>("open")`. `className` is dropped — Vue merges a
 * consumer's `class` onto the root on its own.
 */
export interface DateTimeFieldProps {
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: DateTimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: DateTimeFieldColor;
  /**
   * Error.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Full Width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Initial date & time when uncontrolled.
   *
   * @default null
   */
  defaultValue?: Date | null;
  /**
   * Min.
   *
   * @default undefined
   */
  min?: Date;
  /**
   * Max.
   *
   * @default undefined
   */
  max?: Date;
  /**
   * Placeholder.
   *
   * @default "dd.mm.yyyy, HH:mm"
   */
  placeholder?: string;
  /**
   * Id of the rendered `<input>`; also what the label's `for` and the helper
   * text's id derive from. Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
}
