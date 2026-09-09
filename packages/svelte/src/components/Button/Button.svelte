<script lang="ts" module>
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
  export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
  export type ButtonShape = "pill" | "rounded";
  export type ButtonSize = "small" | "medium" | "large";
  export type ButtonLoadingPosition = "start" | "center" | "end";

  type SharedProps = {
    /**
     * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
     *
     * @default "primary"
     */
    variant?: ButtonVariant;
    /**
     * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
     *
     * @default "primary"
     */
    color?: ButtonColor;
    /**
     * Shape of the button. Can be `pill` or `rounded`.
     *
     * @default "pill"
     */
    shape?: ButtonShape;
    /**
     * Size of the button. Can be `small`, `medium`, or `large`.
     *
     * @default "medium"
     */
    size?: ButtonSize;
    /**
     * Whether the button takes the full width of its container.
     *
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Whether the ripple effect is disabled.
     *
     * @default false
     */
    disableRipple?: boolean;
    /**
     * Whether the loading indicator is visible and the button is disabled.
     *
     * @default false
     */
    loading?: boolean;
    /**
     * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
     *
     * @default "center"
     */
    loadingPosition?: ButtonLoadingPosition;
    /**
     * Icon before the label.
     *
     * @default undefined
     */
    startIcon?: Snippet;
    /**
     * Icon after the label.
     *
     * @default undefined
     */
    endIcon?: Snippet;
    /**
     * Label of the button.
     *
     * @default undefined
     */
    children?: Snippet;
  };

  /**
   * Props mirror `@okkly/react`'s `<Button>` name-for-name, which in turn follows
   * MUI's Button API. `startIcon`/`endIcon`/`children` are snippets rather than
   * `ReactNode`, and everything the element itself understands — `class`,
   * `onclick`, `aria-*` — spreads through to the rendered `<button>`/`<a>`.
   */
  export type ButtonProps = SharedProps &
    Omit<HTMLButtonAttributes & HTMLAnchorAttributes, keyof SharedProps>;
</script>

<script lang="ts">
  import { ripple } from "../../actions/ripple";
  import Spinner from "./Spinner.svelte";

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
