import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox.types";

/**
 * Groups `Checkbox` children via `provide`/`inject` — nest them directly
 * rather than passing an options array, mirroring `RadioGroup`'s composition
 * pattern (multi-select instead of single) and `@okkly/react`'s own
 * `<CheckboxGroup>`. Deliberate gaps vs a hypothetical MUI FormGroup: owns
 * `value`/`onChange` as `string[]`, propagates size/color.
 *
 * Props mirror React's name-for-name. Deliberate differences: the controlled
 * `value` + `onChange` pair becomes an unnamed `defineModel<string[]>()`, so
 * consumers can `v-model` it — `defaultValue` still seeds it (read in a
 * computed fallback, never written into the model on mount — the same
 * reasoning `Slider`'s `defaultValue` handling documents) when nothing is
 * bound, same as React's uncontrolled mode. `children` becomes the default
 * slot and `label` becomes the `label` slot, since Vue has no `ReactNode`.
 * `className` falls through to the root `<div>` on its own. Deliberate gap:
 * no automatic `aria-label` derived from the `label` slot's content (Vue
 * cannot introspect whether a slot rendered plain text the way React
 * inspects `typeof label === "string"`) — pass your own `aria-label` when
 * the visible label isn't enough on its own.
 */
export interface CheckboxGroupProps {
  /**
   * Groups checkboxes together. Auto-generated if omitted.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Initial selected values (uncontrolled). Ignored once `v-model` is bound.
   *
   * @default undefined
   */
  defaultValue?: string[];
  /**
   * Disables every nested Checkbox.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "medium"
   */
  size?: CheckboxSize;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "primary"
   */
  color?: CheckboxColor;
}
