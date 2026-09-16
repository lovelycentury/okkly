<!--
  Test fixture for Autocomplete's `#tags` slot, mirroring the React fixture
  of the same name.
-->
<script setup lang="ts">
import type { AutocompleteOption } from "../../components/Autocomplete/Autocomplete.types";
import Autocomplete from "../../components/Autocomplete/Autocomplete.vue";

withDefaults(
  defineProps<{
    options: AutocompleteOption[];
    defaultValue?: AutocompleteOption[];
  }>(),
  { defaultValue: undefined },
);
</script>

<template>
  <Autocomplete multiple :options="options" :default-value="defaultValue">
    <template #label>People</template>
    <template #tags="{ value }">
      <span>{{ value.length }} selected</span>
    </template>
  </Autocomplete>
</template>
