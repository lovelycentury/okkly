import type { ReactNode } from "react";
import type { RadioColor, RadioSize } from "../Radio/Radio.types";

export interface RadioGroupProps {
  /**
   * Groups radios together. Auto-generated if omitted.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Selected value (controlled).
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Initial value (uncontrolled).
   *
   * @default undefined
   * @type {string}
   */
  defaultValue?: string;
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string) => void}
   */
  onChange?: (value: string) => void;
  /**
   * Disables every nested Radio.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "medium"
   * @type {RadioSize}
   */
  size?: RadioSize;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "primary"
   * @type {RadioColor}
   */
  color?: RadioColor;
  /**
   * Optional group label (renders above the options, also used as aria-label).
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Nested `<Radio value="..." label="..." />` elements.
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
