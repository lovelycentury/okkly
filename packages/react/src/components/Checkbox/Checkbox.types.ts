import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's Checkbox API (https://mui.com/material-ui/api/checkbox/)
 * as closely as this design allows: `checked`/`indeterminate`/`size`/
 * `disabled`/`onChange` match name-for-name. Deliberate gap: no `sx`/
 * `classes`/`icon`/`checkedIcon` (no CSS-in-JS system, glyphs aren't
 * swappable in this design). `label` is built into this component (unlike
 * MUI, which pairs Checkbox with a separate FormControlLabel) — same
 * decision as TextField's built-in label.
 *
 * Nested inside a `CheckboxGroup`, it auto-wires `name`/`checked`/toggle via
 * context — `value` picks the option, the group's `value`/`onChange` own the
 * selection array.
 */
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "type" | "onChange"
> {
  /**
   * On/off value.
   *
   * @default undefined
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * This option's value — required when nested inside a CheckboxGroup.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Groups checkboxes together. Auto-filled by a parent CheckboxGroup.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Third, mixed state (parent).
   *
   * @default false
   * @type {boolean}
   */
  indeterminate?: boolean;
  /**
   * Box size.
   *
   * @default undefined
   * @type {CheckboxSize}
   */
  size?: CheckboxSize;
  /**
   * Fill colour (dante-ready).
   *
   * @default undefined
   * @type {CheckboxColor}
   */
  color?: CheckboxColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Text beside the box.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Fires on toggle.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}
