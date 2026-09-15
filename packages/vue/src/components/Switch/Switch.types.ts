export type SwitchSize = "small" | "medium" | "large";
export type SwitchColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Props mirror `@okkly/react`'s `<Switch>` name-for-name, which in turn
 * follows MUI's Switch API. Deliberate differences: Vue has no `ReactNode`,
 * so the `label` prop becomes the `label` slot; the controlled `checked` +
 * `onChange` pair becomes an unnamed `defineModel<boolean>()`, so consumers
 * can `v-model` it, same as `Checkbox`'s. Every other native input attribute
 * (`value`, `name`, `required`, `readonly`, `aria-*`, `data-*`…) falls
 * through to the rendered `<input>` on its own — `class` is the one
 * exception, which lands on the outer `<label>` instead, matching React's
 * `className`.
 */
export interface SwitchProps {
  /**
   * Track + thumb size.
   *
   * @default "medium"
   */
  size?: SwitchSize;
  /**
   * Track fill when on (dante-ready).
   *
   * @default "primary"
   */
  color?: SwitchColor;
  /**
   * Non-interactive.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Id of the rendered `<input>`; also what the label's `for` derives from.
   * Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
