import type { FieldColor, FieldSize } from "../Field/Field.types";

export type TimeFieldSize = FieldSize;
export type TimeFieldColor = FieldColor;

/**
 * Closest MUI counterpart is MUI X's `TimeField` /
 * `TimePicker` (https://mui.com/x/react-date-pickers/time-field/): masked
 * text input with a time popover. Deliberate gaps: no `sx`/`slots`, fixed
 * `HH:mm` mask, and the value API is `Date | null` (time-of-day on a fixed
 * base day) for consistency with `DateField`/`DateTimeField`. `min`/`max`
 * are declared but, same as `@okkly/react`'s own `<TimeField>`, not yet
 * wired into anything — carried over as-is rather than fixed during the port.
 *
 * Props mirror `@okkly/react`'s `<TimeField>` name-for-name. Deliberate
 * differences, because Vue has no `ReactNode`: `label` and `helperText`
 * arrive as the `label` and `helper-text` slots. The controlled `value` +
 * `onChange` pair becomes an unnamed `defineModel<Date | null>()`; the
 * controlled `open` + `onOpenChange` pair becomes the named
 * `defineModel<boolean>("open")`. `className` is dropped — Vue merges a
 * consumer's `class` onto the root on its own.
 */
export interface TimeFieldProps {
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
  size?: TimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: TimeFieldColor;
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
   * Initial time when uncontrolled.
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
   * @default "HH:mm"
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
