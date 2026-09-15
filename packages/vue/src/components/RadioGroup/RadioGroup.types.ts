import type { RadioColor, RadioSize } from "../Radio/Radio.types";

/**
 * Groups `Radio` children via `provide`/`inject` — nest them directly rather
 * than passing an options array, matching MUI's RadioGroup composition
 * pattern (https://mui.com/material-ui/react-radio-button/#radio-group) and
 * `@okkly/react`'s own `<RadioGroup>`.
 *
 * Props mirror React's name-for-name. Deliberate differences: the controlled
 * `value` + `onChange` pair becomes an unnamed `defineModel<string>()`, so
 * consumers can `v-model` it — `defaultValue` still seeds it on first mount
 * when nothing is bound, same as React's uncontrolled mode. `children`
 * becomes the default slot and `label` becomes the `label` slot, since Vue
 * has no `ReactNode`. `className` falls through to the root `<div>` on its
 * own. Deliberate gap: no automatic `aria-label` derived from the `label`
 * slot's content (Vue cannot introspect whether a slot rendered plain text
 * the way React inspects `typeof label === "string"`) — pass your own
 * `aria-label` when the visible label isn't enough on its own.
 */
export interface RadioGroupProps {
  /**
   * Groups radios together. Auto-generated if omitted.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Initial selected value (uncontrolled). Ignored once `v-model` is bound.
   *
   * @default undefined
   */
  defaultValue?: string;
  /**
   * Disables every nested Radio.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "medium"
   */
  size?: RadioSize;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "primary"
   */
  color?: RadioColor;
}
