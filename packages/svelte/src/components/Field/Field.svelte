<script lang="ts">
  import type { FieldProps } from "./Field.types";

  /**
   * The shared shell behind TextField, Select and Autocomplete: label row,
   * bordered control box with optional adornments, and helper text.
   *
   * Internal on purpose — it is not exported from the package. It exists to
   * stop the three components from re-implementing (and slowly disagreeing
   * about) focus rings, error colours and label spacing, not to become a
   * public layout primitive. Its styling counterpart is the `field.shell` SCSS
   * mixin.
   */
  let {
    block,
    id,
    label,
    hideLabel = false,
    required = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    disabled = false,
    fullWidth = false,
    startAdornment,
    endAdornment,
    htmlFor,
    controlProps,
    class: className,
    children,
  }: FieldProps = $props();

  const helperId = $derived(helperText ? `${id}-helper` : undefined);
  const labelId = $derived(label ? `${id}-label` : undefined);
  const labelFor = $derived(htmlFor === false ? undefined : (htmlFor ?? id));

  const classes = $derived(
    [
      "okkly-component",
      block,
      color !== "primary" && `${block}--color-${color}`,
      size !== "medium" && `${block}--${size}`,
      error && `${block}--error`,
      disabled && `${block}--disabled`,
      fullWidth && `${block}--full-width`,
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const restControlProps = $derived.by(() => {
    const { class: _controlClassName, ...rest } = controlProps ?? {};
    return rest;
  });
  const controlClasses = $derived(
    [`${block}__control`, controlProps?.class].filter(Boolean).join(" "),
  );
</script>

<div class={classes}>
  {#if label}
    <label
      id={labelId}
      for={labelFor}
      class={`${block}__label${hideLabel ? ` ${block}__label--hidden` : ""}`}
    >
      {@render label()}
      {#if required}
        <span class={`${block}__required`} aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}

  <div class={controlClasses} {...restControlProps}>
    {#if startAdornment}
      <span class={`${block}__adornment`}>{@render startAdornment()}</span>
    {/if}
    {@render children()}
    {#if endAdornment}
      <span class={`${block}__adornment`}>{@render endAdornment()}</span>
    {/if}
  </div>

  {#if helperText}
    <span id={helperId} class={`${block}__helper`}>{@render helperText()}</span>
  {/if}
</div>
