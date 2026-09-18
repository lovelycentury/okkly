import type { FieldColor, FieldSize } from "../Field/Field.types";

export type DateFieldSize = FieldSize;
export type DateFieldColor = FieldColor;

/**
 * Closest MUI counterpart is MUI X's `DateField` /
 * `DatePicker` (https://mui.com/x/react-date-pickers/date-field/): masked
 * text input with a calendar popover. Deliberate gaps: no `sx`/`slots`,
 * fixed `dd.mm.yyyy` mask (no locale adapters), and the picker uses okkly
 * `Calendar` rather than MUI's `DateCalendar`.
 *
 * Props mirror `@okkly/react`'s `<DateField>` name-for-name. Deliberate
 * differences, because Vue has no `ReactNode`: `label` and `helperText`
 * arrive as the `label` and `helper-text` slots. The controlled `value` +
 * `onChange` pair becomes an unnamed `defineModel<Date | null>()`; the
 * controlled `open` + `onOpenChange` pair becomes the named
 * `defineModel<boolean>("open")`. `className` is dropped — Vue merges a
 * consumer's `class` onto the root on its own.
 */
export interface DateFieldProps {
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
  size?: DateFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: DateFieldColor;
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
   * Initial date when uncontrolled.
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
   * @default "dd.mm.yyyy"
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
