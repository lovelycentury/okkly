export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props mirror `@okkly/react`'s `<Checkbox>` name-for-name, which in turn
 * follows MUI's Checkbox API. Deliberate differences: Vue has no `ReactNode`,
 * so the `label` prop becomes the `label` slot; the controlled `checked` +
 * `onChange` pair becomes an unnamed `defineModel<boolean>()`, so consumers
 * can `v-model` it, same as `TextField`'s `value`. Every other native input
 * attribute (`value`, `name`, `required`, `readonly`, `aria-*`, `data-*`…)
 * falls through to the rendered `<input>` on its own — `class` is the one
 * exception, which lands on the outer `<label>` instead, matching React's
 * `className`.
 * Deliberate gap: no `CheckboxGroup` context wiring — `@okkly/vue` has no
 * `CheckboxGroup` component yet, so `size`/`color` default directly to their
 * standalone values instead of falling back through a group.
 */
export interface CheckboxProps {
  /**
   * Third, mixed state (parent).
   *
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Box size.
   *
   * @default "medium"
   */
  size?: CheckboxSize;
  /**
   * Fill colour.
   *
   * @default "primary"
   */
  color?: CheckboxColor;
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
