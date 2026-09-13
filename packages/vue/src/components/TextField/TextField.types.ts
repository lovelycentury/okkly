import type { FieldAccentColor, FieldSize } from "../Field/Field.types";

export type TextFieldSize = FieldSize;
export type TextFieldColor = FieldAccentColor;

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<TextField>`
 * name-for-name. Deliberate differences, because Vue has no `ReactNode`:
 * `label`, `helperText`, `startAdornment` and `endAdornment` arrive as the
 * `label`, `helper-text`, `start-adornment` and `end-adornment` slots. The
 * controlled `value` becomes `defineModel`, so consumers can `v-model` it;
 * every other native input attribute (`type`, `placeholder`, `name`,
 * `maxlength`, `@input`, `@change`…) falls through to the rendered `<input>`
 * on its own — `class` is the one exception, which lands on the outer field
 * wrapper instead, matching React's `className`.
 * Deliberate gaps: no `variant` (the design has one visual treatment, not
 * filled/outlined/standard), no `multiline`/`rows`/`select` (not in this
 * component's Figma spec — would be new, undesigned surface).
 */
export interface TextFieldProps {
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Field height & text.
   *
   * @default "medium"
   */
  size?: TextFieldSize;
  /**
   * Tints the focus ring/glow. One of the design system's accent colors —
   * `dante` is a rare, deliberate accent moment; the rest are for matching
   * a field to surrounding brand/section color.
   *
   * @default "primary"
   */
  color?: TextFieldColor;
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
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Disables the input.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Id of the rendered `<input>`; also what the label's `for` and the helper
   * text's id derive from. Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
