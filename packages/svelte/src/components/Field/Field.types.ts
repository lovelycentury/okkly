import type { ClassValue, HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export type FieldSize = "small" | "medium" | "large";
export type FieldColor = "primary" | "dante";
/**
 * Every accent tint a `Field`-shell control can take. Broader than
 * `FieldColor`, which is what Select/Autocomplete/DateField/TimeField/etc.
 * would still expose publicly if ported — TextField is the one consumer
 * that opts into the full accent set.
 */
export type FieldAccentColor = FieldColor | "secondary" | "violet" | "ember" | "ice" | "contrast";

/**
 * Props mirror `@okkly/react`'s internal `<Field>` name-for-name. `label`,
 * `helperText`, `startAdornment`, `endAdornment` and `children` are snippets
 * rather than `ReactNode`.
 */
export interface FieldProps {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okkly-select"`.
   * Each consumer keeps its own block so its public class names — the ones
   * apps target in overrides — stay exactly what they were.
   *
   * @default undefined
   */
  block: string;
  /**
   * Id of the control this field wraps; the label's `for` and the helper id
   * derive from it.
   *
   * @default undefined
   */
  id: string;
  /**
   * Label.
   *
   * @default undefined
   */
  label?: Snippet;
  /**
   * Hide label.
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
   * Color.
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
   * Helper text.
   *
   * @default undefined
   */
  helperText?: Snippet;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Full width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Start adornment.
   *
   * @default undefined
   */
  startAdornment?: Snippet;
  /**
   * End adornment.
   *
   * @default undefined
   */
  endAdornment?: Snippet;
  /**
   * `<label for>` only works for real form controls, so a wrapper whose
   * control is a `div[role="combobox"]` (Select) passes `false` and points at
   * `${id}-label` with `aria-labelledby` instead.
   *
   * @default undefined
   */
  htmlFor?: string | false;
  /**
   * Applied to the bordered control box — Autocomplete anchors its popup on
   * it.
   *
   * @default undefined
   */
  controlProps?: HTMLAttributes<HTMLDivElement>;
  /**
   * Class name.
   *
   * @default undefined
   */
  class?: ClassValue | null;
  /**
   * Children.
   *
   * @default undefined
   */
  children: Snippet;
}
