<script lang="ts">
  import Field from "../Field/Field.svelte";
  import type { TextFieldProps } from "./TextField.types";

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
