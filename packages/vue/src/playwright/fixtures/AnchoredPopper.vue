<!--
  Test fixture for Popper: a button that toggles a Popper anchored to itself.

  `anchor-el` wants a live DOM element, and a Playwright component test cannot
  hand one across from Node — props are serialized. This fixture owns the
  anchor itself, so the anchoring happens entirely inside the browser while the
  test still drives everything through ordinary serializable props.
-->
<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Popper from "../../components/Popper/Popper.vue";
import type { PopperPlacement } from "../../components/Popper/Popper.types";

const props = withDefaults(
  defineProps<{
    triggerLabel?: string;
    defaultOpen?: boolean;
    placement?: PopperPlacement;
    keepMounted?: boolean;
  }>(),
  {
    triggerLabel: "Toggle",
    defaultOpen: false,
    placement: "bottom",
    keepMounted: false,
  },
);

const open = ref(props.defaultOpen);
const anchor = useTemplateRef<HTMLButtonElement>("anchor");
</script>

<template>
  <div class="fixture-root">
    <button ref="anchor" type="button" @click="open = !open">{{ triggerLabel }}</button>
    <Popper :open="open" :anchor-el="anchor" :placement="placement" :keep-mounted="keepMounted">
      <div class="fixture-panel"><slot>Popper content</slot></div>
    </Popper>
  </div>
</template>
