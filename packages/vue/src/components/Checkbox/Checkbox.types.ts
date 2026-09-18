export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Nested inside a `CheckboxGroup`, it auto-wires `name`/`checked`/toggling
 * through `provide`/`inject` (the Vue equivalent of React's context) —
 * `value` picks the option, `CheckboxGroup`'s own `v-model` owns the
 * selected set. Standalone (no group), it's a plain controlled boolean via
 * `v-model`.
 *
 * Props mirror `@okkly/react`'s `<Checkbox>` name-for-name, which in turn
 * follows MUI's Checkbox API. Deliberate differences: Vue has no `ReactNode`,
 * so the `label` prop becomes the `label` slot; the controlled `checked` +
 * `onChange` pair becomes an unnamed `defineModel<boolean>()` for the
 * standalone case, so consumers can `v-model` it, same as `TextField`'s
 * `value` — a grouped Checkbox's checked state is derived from
 * `CheckboxGroup`'s context instead, and toggling it calls back into the
 * group rather than writing the model (mirroring `Radio`'s own group/
 * standalone split). Every other native input attribute (`required`,
 * `readonly`, `aria-*`, `data-*`…) falls through to the rendered `<input>`
 * on its own — `class` is the one exception, which lands on the outer
 * `<label>` instead, matching React's `className`.
 */
export interface CheckboxProps {
  /**
   * This option's value — required when nested inside a CheckboxGroup.
   *
   * @default undefined
   */
  value?: string;
  /**
   * Groups checkboxes together. Auto-filled by a parent CheckboxGroup.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Third, mixed state (parent).
   *
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Box size. Resolves to the group's `size` when nested, else "medium".
   *
   * @default undefined
   */
  size?: CheckboxSize;
  /**
   * Fill colour. Resolves to the group's `color` when nested, else "primary".
   *
   * @default undefined
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
