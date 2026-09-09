<!--
  Stage wrapper applied to every story as a decorator. A wrapper element, not
  `#storybook-root`: that root only exists on the canvas, so styling it leaves
  the inline stories on a Docs page unpadded.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<div class="okkly-storybook-canvas">{@render children?.()}</div>
