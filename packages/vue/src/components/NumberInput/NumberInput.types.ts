export type NumberInputSize = "small" | "medium" | "large";
export type NumberInputColor = "primary" | "dante";
export type NumberInputControls = "stepper" | "chevrons";

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * where applicable: `label`/`size`/`error`/`helperText`/`disabled`/`fullWidth`/
 * `color`/`min`/`max`/`step` all match name-for-name, mirroring `@okkly/react`'s
 * `<NumberInput>` name-for-name. Deliberate gaps carried over from React: no
 * `sx`/`classes`/`slots`/`slotProps`, no `variant`.
 *
 * Vue-forced differences, because Vue has no `ReactNode`: `label` and
 * `helperText` arrive as the `label` and `helper-text` slots. The controlled
 * `value` + `onChange` pair becomes an unnamed `defineModel<number | null>()`,
 * so consumers can `v-model` it — `defaultValue` still seeds it once on mount
 * when nothing is bound. `onChange` is value-focused either way — `(value:
 * number | null)` instead of MUI's `(event) => void` — same as React. `onBlur`/
 * `onKeyDown` are dropped from this list: Vue merges a consumer's `@blur`/
 * `@keydown` with the component's own internal listeners automatically (both
 * run), unlike React where the component has to manually call the prop back.
 * `className`/`id` are dropped — Vue's own fallthrough (`class`) and
 * `useId()` (`id`) handle them; every other native `<input>` attribute falls
 * through to the rendered `<input>` on its own.
 */
export interface NumberInputProps {
  /**
   * Uncontrolled initial value.
   *
   * @default null
   */
  defaultValue?: number | null;
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
  size?: NumberInputSize;
  /**
   * Tints the focus ring/glow.
   *
   * @default "primary"
   */
  color?: NumberInputColor;
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
   * Disables the input.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Trailing +/- layout (`stepper`) or up/down chevrons (`chevrons`).
   *
   * @default "stepper"
   */
  controls?: NumberInputControls;
  /**
   * Lower bound for stepping and clamping.
   *
   * @default undefined
   */
  min?: number;
  /**
   * Upper bound for stepping and clamping.
   *
   * @default undefined
   */
  max?: number;
  /**
   * Increment amount for steppers and arrow keys.
   *
   * @default 1
   */
  step?: number;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Id of the rendered `<input>`; also what the label's `for` and the helper
   * text's id derive from. Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
