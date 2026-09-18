export type TextAreaSize = "small" | "medium" | "large";
export type TextAreaColor = "primary" | "dante";
export type TextAreaResize = "none" | "vertical" | "both";

/**
 * Props follow MUI's TextField multiline API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<TextArea>`
 * name-for-name. Deliberate differences, because Vue has no `ReactNode`:
 * `label` and `helperText` arrive as the `label` and `helper-text` slots. The
 * controlled `value` becomes `defineModel`, so consumers can `v-model` it;
 * every other native textarea attribute (`placeholder`, `name`, `@input`,
 * `@change`…) falls through to the rendered `<textarea>` on its own — `class`
 * is the one exception, which lands on the outer wrapper instead, matching
 * React's `className`.
 */
export interface TextAreaProps {
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Field text sizing.
   *
   * @default "medium"
   */
  size?: TextAreaSize;
  /**
   * Tints the focus ring/glow. `dante` is a rare, deliberate accent moment.
   *
   * @default "primary"
   */
  color?: TextAreaColor;
  /**
   * Marks invalid + red border.
   *
   * @default false
   */
  error?: boolean;
  /**
   * If `true`, the field takes the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Disables the textarea.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Minimum visible rows.
   *
   * @default 3
   */
  rows?: number;
  /**
   * Maximum rows when `autosize` is enabled.
   *
   * @default undefined
   */
  maxRows?: number;
  /**
   * Grow height with content.
   *
   * @default false
   */
  autosize?: boolean;
  /**
   * Character limit; shows an "n / max" counter in the footer.
   *
   * @default undefined
   */
  maxLength?: number;
  /**
   * Manual resize handle behavior. Ignored when `autosize` is true.
   *
   * @default "vertical"
   */
  resize?: TextAreaResize;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Id of the rendered `<textarea>`; also what the label's `for` and the
   * helper/counter ids derive from. Auto-generated with `useId()` when
   * omitted.
   *
   * @default undefined
   */
  id?: string;
}
