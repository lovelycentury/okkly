<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import type { FieldColor, FieldSize } from "../Field/Field.svelte";

  export type TextFieldSize = FieldSize;
  export type TextFieldColor = FieldColor;

  type SharedProps = {
    /**
     * Field label.
     *
     * @default undefined
     */
    label?: Snippet;
    /**
     * Visually hides the label (still present for assistive tech).
     *
     * @default false
     */
    hideLabel?: boolean;
    /**
     * Field height & text.
     *
     * @default "medium"
     */
    size?: TextFieldSize;
    /**
     * Tints the focus ring/glow with one of the design system's accent
     * tokens. Anything but `primary` is a rare, deliberate accent moment.
     *
     * @default "primary"
     */
    color?: TextFieldColor;
    /**
     * Marks invalid + red border.
     *
     * @default false
     */
    error?: boolean;
    /**
     * Text below field.
     *
     * @default undefined
     */
    helperText?: Snippet;
    /**
     * If `true`, the field takes the full width of its container.
     *
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Marks the field required and shows a dante asterisk after the label.
     *
     * @default false
     */
    required?: boolean;
    /**
     * Content rendered inside the border, before the input.
     *
     * @default undefined
     */
    startAdornment?: Snippet;
    /**
     * Content rendered inside the border, after the input.
     *
     * @default undefined
     */
    endAdornment?: Snippet;
    /**
     * The input's current value. A controlled pair with the native `oninput` —
     * bind to it (`bind:value`) for two-way binding, or pass `defaultValue` for
     * an uncontrolled field.
     *
     * @default undefined
     */
    value?: HTMLInputAttributes["value"];
  };

  /**
   * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
   * as closely as this design allows, mirroring `@okkly/react`'s `<TextField>`
   * name-for-name: `label`/`size`/`error`/`helperText`/`disabled`/`fullWidth`/
   * `color`/`value`/`required` all match, and `startAdornment`/`endAdornment`
   * are lifted to the top level rather than living under `InputProps`.
   * `label`/`helperText`/`startAdornment`/`endAdornment` are snippets rather
   * than `ReactNode`, and a controlled `value` + `onChange` pair becomes
   * `value = $bindable()` paired with the native `oninput`. `color` diverges
   * from React's `"primary" | "dante"`: it takes every accent token the
   * design system defines (`secondary`, `violet`, `ember`, `ice`, `contrast`
   * besides `primary`/`dante`), now that `field.shell` tints the focus
   * ring/glow with all of them.
   * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps` (no CSS-in-JS system
   * here), no `variant` (the design has one visual treatment, not
   * filled/outlined/standard), no `multiline`/`rows`/`select`/`margin` (not in
   * this component's Figma spec — would be new, undesigned surface).
   */
  export type TextFieldProps = SharedProps &
    Omit<HTMLInputAttributes, keyof SharedProps | "size" | "color">;
</script>

<script lang="ts">
  import Field from "../Field/Field.svelte";

  let {
    label,
    hideLabel = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    disabled = false,
    required = false,
    startAdornment,
    endAdornment,
    value = $bindable(),
    class: className,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: TextFieldProps = $props();

  const generatedId = $props.id();
  const inputId = $derived(id ?? generatedId);
  const helperId = $derived(helperText ? `${inputId}-helper` : undefined);
  const describedBy = $derived([helperId, ariaDescribedBy].filter(Boolean).join(" ") || undefined);
</script>

<Field
  block="okkly-text-field"
  id={inputId}
  {label}
  {hideLabel}
  {required}
  {size}
  {color}
  {error}
  {helperText}
  disabled={Boolean(disabled)}
  {fullWidth}
  {startAdornment}
  {endAdornment}
  class={className}
>
  <input
    id={inputId}
    class="okkly-text-field__input"
    {disabled}
    {required}
    aria-invalid={error || undefined}
    aria-describedby={describedBy}
    {...rest}
    bind:value
  />
</Field>
