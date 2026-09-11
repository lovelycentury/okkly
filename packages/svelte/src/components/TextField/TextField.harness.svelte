<script lang="ts">
  import TextField from "./TextField.svelte";
  import type { TextFieldProps } from "./TextField.svelte";

  type HarnessProps = Omit<
    TextFieldProps,
    "label" | "helperText" | "startAdornment" | "endAdornment"
  > & {
    label?: string;
    helperText?: string;
    withAdornments?: boolean;
  };

  let { label, helperText, withAdornments = false, ...rest }: HarnessProps = $props();
</script>

{#snippet labelSnippet()}{label}{/snippet}
{#snippet helperSnippet()}{helperText}{/snippet}
{#snippet start()}<span data-testid="start-adornment"></span>{/snippet}
{#snippet end()}<span data-testid="end-adornment"></span>{/snippet}

<TextField
  label={label ? labelSnippet : undefined}
  helperText={helperText ? helperSnippet : undefined}
  startAdornment={withAdornments ? start : undefined}
  endAdornment={withAdornments ? end : undefined}
  {...rest}
/>
