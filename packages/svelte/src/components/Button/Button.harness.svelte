<script lang="ts">
  import Button from "./Button.svelte";
  import type { ButtonProps } from "./Button.svelte";

  let {
    label,
    withIcons = false,
    ...rest
  }: ButtonProps & { label: string; withIcons?: boolean } = $props();
</script>

{#snippet start()}<span data-testid="start-icon"></span>{/snippet}
{#snippet end()}<span data-testid="end-icon"></span>{/snippet}

<Button startIcon={withIcons ? start : undefined} endIcon={withIcons ? end : undefined} {...rest}>
  {label}
</Button>
