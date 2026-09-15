import type { HTMLAttributes, ReactNode, Ref } from "react";

export type FieldSize = "small" | "medium" | "large";
export type FieldColor = "primary" | "dante";
/**
 * Every accent tint a `Field`-shell control can take. Broader than
 * `FieldColor`, which is what Select/Autocomplete/DateField/TimeField/etc.
 * still expose publicly — TextField is the one consumer that opts into the
 * full accent set.
 */
export type FieldAccentColor = FieldColor | "secondary" | "violet" | "ember" | "ice" | "contrast";

export interface FieldProps {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okkly-select"`. Each consumer keeps its own block so its public class names — the ones apps target in overrides — stay exactly what they were.
   *
   * @default undefined
   * @type {string}
   */
  block: string;
  /**
   * Id of the control this field wraps; the label's `for` and the helper id derive from it.
   *
   * @default undefined
   * @type {string}
   */
  id: string;
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
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   * @type {FieldSize}
   */
  size?: FieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {FieldAccentColor}
   */
  color?: FieldAccentColor;
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
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Start Adornment.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startAdornment?: ReactNode;
  /**
   * End Adornment.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment?: ReactNode;
  /**
   * `<label for>` only works for real form controls, so a wrapper whose control is a `div[role="combobox"]` (Select) passes `false` and points at `${id}-label` with `aria-labelledby` instead.
   *
   * @default undefined
   * @type {string | false}
   */
  htmlFor?: string | false;
  /**
   * Applied to the bordered control box — Autocomplete anchors its popup on it.
   *
   * @default undefined
   * @type {*}
   */
  controlProps?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> };
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}
