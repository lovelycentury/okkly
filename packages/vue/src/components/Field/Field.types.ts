export type FieldSize = "small" | "medium" | "large";
export type FieldColor = "primary" | "dante";
/**
 * Every accent tint a `Field`-shell control can take. Broader than
 * `FieldColor`, which is what Select/Autocomplete/DateField/TimeField/etc.
 * still expose publicly — TextField is the one consumer that opts into the
 * full accent set.
 */
export type FieldAccentColor = FieldColor | "secondary" | "violet" | "ember" | "ice" | "contrast";

/**
 * Props mirror `@okkly/react`'s internal `<Field>` name-for-name. Deliberate
 * differences, because Vue has no `ReactNode`: `label`, `helperText`,
 * `startAdornment` and `endAdornment` arrive as the `label`, `helper-text`,
 * `start-adornment` and `end-adornment` slots, and `children` is the default
 * slot. `className` is dropped — Vue merges a consumer's `class` onto the
 * root on its own. React's `controlProps={{ ref, onClick }}` becomes a
 * `control-click` emit plus a `controlRef` exposed via `defineExpose` — what
 * Autocomplete (and later Select) use to focus their input, anchor their
 * popup and open on a click anywhere in the control box.
 *
 * Internal on purpose — not exported from the package. It is the shared shell
 * TextField and Autocomplete (and, later, Select) render inside; its styling
 * counterpart is the `field.shell` SCSS mixin, included by each consumer's own
 * stylesheet under its own BEM block.
 */
export interface FieldProps {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okkly-text-field"`. Each consumer keeps its own block so its public class names stay exactly what they were.
   *
   * @default undefined
   */
  block: string;
  /**
   * Id of the control this field wraps; the label's `for` and the helper id derive from it.
   *
   * @default undefined
   */
  id: string;
  /**
   * Hide Label.
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: FieldSize;
  /**
   * Tints the focus ring/glow. `dante` is a rare, deliberate accent moment;
   * the rest are for matching a field to surrounding brand/section color.
   *
   * @default "primary"
   */
  color?: FieldAccentColor;
  /**
   * Error.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Full Width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * `<label for>` only works for real form controls, so a wrapper whose control is a `div[role="combobox"]` passes `false` and points at `${id}-label` with `aria-labelledby` instead.
   *
   * @default undefined
   */
  htmlFor?: string | false;
}
