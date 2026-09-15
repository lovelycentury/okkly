<!--
  Test fixture for Box: renders one of @okkly/shared's test layouts — a Box, an
  optional Box inside it, and color swatches at the innermost level. A snippet
  passed as raw markup keeps only its first node and cannot name a component,
  so layouts that nest Boxes are mounted through this instead.
-->
<script lang="ts">
  import { boxSwatch, type BoxTree } from "@okkly/shared/testing";
  import Box from "../../components/Box/Box.svelte";

  let { outer, inner, swatches }: BoxTree = $props();
</script>

{#snippet swatchList()}
  {#each swatches as swatch, index (index)}
    <Box {...boxSwatch(swatch)} />
  {/each}
{/snippet}

<Box {...outer}>
  {#if inner}
    <Box {...inner}>{@render swatchList()}</Box>
  {:else}
    {@render swatchList()}
  {/if}
</Box>
