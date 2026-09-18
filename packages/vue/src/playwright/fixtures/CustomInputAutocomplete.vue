<!--
  Test fixture for Autocomplete's `#input` slot, which rebuilds just the
  `<input>` — narrower than React's `renderInput` (see Autocomplete.types.ts
  for why), so unlike the React fixture there is no "wrapper" variant that
  relocates the tag row or the clear/toggle buttons: those stay fixed.
-->
<script setup lang="ts">
import type { AutocompleteOption } from "../../components/Autocomplete/Autocomplete.types";
import Autocomplete from "../../components/Autocomplete/Autocomplete.vue";

withDefaults(
  defineProps<{
    options: AutocompleteOption[];
    openOnFocus?: boolean;
  }>(),
  { openOnFocus: false },
);
</script>

<template>
  <Autocomplete :open-on-focus="openOnFocus" :options="options">
    <template #label>People</template>
    <template #input="{ inputAttrs, inputEvents, inputRef }">
      <span data-testid="glyph" aria-hidden="true">⌕</span>
      <input
        :ref="inputRef"
        v-bind="inputAttrs"
        v-on="inputEvents"
        class="okkly-autocomplete__input"
      />
    </template>
  </Autocomplete>
</template>
