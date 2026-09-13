import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type SwitchSize = "small" | "medium" | "large";
export type SwitchColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Props follow MUI's Switch API (https://mui.com/material-ui/api/switch/)
 * as closely as this design allows: `checked`/`defaultChecked`/`size`/
 * `disabled`/`onChange` match name-for-name. Deliberate gaps: no `sx`/
 * `classes`/`icon`/`checkedIcon` (no CSS-in-JS system). `label` is built
 * into this component (unlike MUI, which pairs Switch with a separate
 * FormControlLabel) — same decision as Checkbox's built-in label.
 */
export interface SwitchProps extends Omit<
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
   * Initial on/off value (uncontrolled).
   *
   * @default undefined
   * @type {boolean}
   */
  defaultChecked?: boolean;
  /**
   * Track + thumb size.
   *
   * @default "medium"
   * @type {SwitchSize}
   */
  size?: SwitchSize;
  /**
   * Track fill when on (dante-ready).
   *
   * @default "primary"
   * @type {SwitchColor}
   */
  color?: SwitchColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Text beside the control.
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
