import type { ReactNode } from "react";
import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox.types";

export interface CheckboxGroupProps {
  /**
   * Groups checkboxes together. Auto-generated if omitted.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Selected values (controlled).
   *
   * @default undefined
   * @type {string[]}
   */
  value?: string[];
  /**
   * Initial values (uncontrolled).
   *
   * @default undefined
   * @type {string[]}
   */
  defaultValue?: string[];
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string[]) => void}
   */
  onChange?: (value: string[]) => void;
  /**
   * Disables every nested Checkbox.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "medium"
   * @type {CheckboxSize}
   */
  size?: CheckboxSize;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "primary"
   * @type {CheckboxColor}
   */
  color?: CheckboxColor;
  /**
   * Optional group label (renders above the options, also used as aria-label).
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Nested `<Checkbox value="..." label="..." />` elements.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
