export type RadioSize = "small" | "medium" | "large";
export type RadioColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Bare radio control — no built-in label prop beyond the `label` slot,
 * matching this design's own spec (unlike `Checkbox`/`TextField`, whose
 * props mirror this the same way). Nested inside a `RadioGroup`, it
 * auto-wires `name`/`checked`/selection through `provide`/`inject` (the Vue
 * equivalent of React's context, and the "MUI RadioGroup" composition
 * pattern from the design brief) — `value` picks the option, `RadioGroup`'s
 * own `v-model` owns the selection. Standalone (no group), it's a plain
 * controlled checkbox-shaped input via `checked` + the `change` emit.
 *
 * Props mirror `@okkly/react`'s `<Radio>` name-for-name. Deliberate
 * difference: `checked` stays a plain prop paired with the `change` emit
 * rather than `defineModel`, since a grouped Radio's checked state is
 * derived from `RadioGroup`'s context rather than owned locally — `label`
 * becomes the `label` slot, since Vue has no `ReactNode`. Everything else
 * the `<input>` itself understands (`value`, `name`, `required`, `aria-*`,
 * `data-*`…) falls through to it — `class` is the one exception, which
 * lands on the outer `<label>` instead, matching React's `className`.
 */
export interface RadioProps {
  /**
   * Selected in its group.
   *
   * @default undefined
   */
  checked?: boolean;
  /**
   * This option's value — required when nested inside a RadioGroup.
   *
   * @default undefined
   */
  value?: string;
  /**
   * Groups radios together. Auto-filled by a parent RadioGroup.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Control size.
   *
   * @default undefined
   */
  size?: RadioSize;
  /**
   * Fill colour (dante-ready).
   *
   * @default undefined
   */
  color?: RadioColor;
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
