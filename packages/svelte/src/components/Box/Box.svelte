<script lang="ts">
  import { resolveBoxSystemProps } from "@okkly/shared";
  import type { BoxProps } from "./Box.types";

  let { as = "div", class: className, style, children, ...props }: BoxProps = $props();

  // Every system prop becomes a class plus the CSS variable it reads — the same
  // resolution @okkly/react's Box runs. `rest` is everything else: the
  // element's own attributes.
  const system = $derived(resolveBoxSystemProps(props));

  const classes = $derived(
    ["okkly-component", "okkly-box", system.className, className].filter(Boolean).join(" "),
  );
  // The system-prop variables first, so a consumer's own `style` can override them.
  const styles = $derived(
    [...Object.entries(system.style).map(([name, value]) => `${name}: ${value}`), style]
      .filter(Boolean)
      .join("; "),
  );
</script>

<svelte:element this={as} class={classes} style={styles || undefined} {...system.rest}>
  {@render children?.()}
</svelte:element>
