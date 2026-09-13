<script lang="ts">
  import { ripple } from "../../actions/ripple";
  import Spinner from "./Spinner.svelte";
  import type { ButtonProps } from "./Button.types";

  let {
    variant = "primary",
    color = "primary",
    shape = "pill",
    size = "medium",
    fullWidth = false,
    disableRipple = false,
    loading = false,
    loadingPosition = "center",
    disabled = false,
    startIcon,
    endIcon,
    children,
    href,
    class: className,
    ...rest
  }: ButtonProps = $props();

  const isDisabled = $derived(disabled || loading);
  /** Where the spinner renders, or `null` when not loading. */
  const spinnerPosition = $derived(loading ? loadingPosition : null);
  const showStartIcon = $derived(!!startIcon && spinnerPosition !== "start");
  const showEndIcon = $derived(!!endIcon && spinnerPosition !== "end");

  const classes = $derived(
    [
      "okkly-component",
      "okkly-button",
      `okkly-button--${variant}`,
      color !== "primary" && `okkly-button--color-${color}`,
      shape === "rounded" && "okkly-button--rounded",
      size !== "medium" && `okkly-button--${size}`,
      fullWidth && "okkly-button--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

{#snippet content()}
  {#if spinnerPosition === "start"}
    <Spinner />
  {/if}
  {#if showStartIcon}
    <span class="okkly-button__icon">{@render startIcon?.()}</span>
  {/if}
  <span
    class="okkly-button__label okkly-truncation-ellipsis"
    class:okkly-button__label--hidden={spinnerPosition === "center"}>{@render children?.()}</span
  >
  {#if showEndIcon}
    <span class="okkly-button__icon">{@render endIcon?.()}</span>
  {/if}
  {#if spinnerPosition === "end"}
    <Spinner />
  {/if}
  {#if spinnerPosition === "center"}
    <span class="okkly-button__loader"><Spinner /></span>
  {/if}
{/snippet}

<!--
  Two branches rather than `<svelte:element>`: an anchor and a button take
  genuinely different attributes here — an anchor cannot be natively disabled,
  so a disabled one drops its href and says so through `aria-disabled`.
-->
{#if href}
  <a
    class={classes}
    href={isDisabled ? undefined : href}
    aria-disabled={isDisabled ? "true" : undefined}
    tabindex={isDisabled ? -1 : undefined}
    use:ripple={{ disabled: disableRipple }}
    {...rest}
  >
    {@render content()}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    disabled={isDisabled}
    use:ripple={{ disabled: disableRipple }}
    {...rest}
  >
    {@render content()}
  </button>
{/if}

<style>
  /*
   * The one rule the design system does not provide, because this wrapper is
   * markup @okkly/svelte invents. `:global` because every other class here is a
   * global BEM class from @okkly/design-system, not a scoped one.
   */
  :global(.okkly-button__loader) {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
