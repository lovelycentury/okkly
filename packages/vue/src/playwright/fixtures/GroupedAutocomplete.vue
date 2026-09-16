<!--
  Test fixture for Autocomplete's `groupBy` plus the `#group`/`#no-options`/
  `#loading` slots, mirroring the React fixture of the same name — these need
  a real .vue file since a `.ct.ts` slot string cannot declare scoped slots.
-->
<script setup lang="ts">
import { computed } from "vue";
import Autocomplete from "../../components/Autocomplete/Autocomplete.vue";
import type {
  AutocompleteOption,
  AutocompleteSize,
  SelectionChangeDetails,
  SelectionChangeReason,
} from "../../components/Autocomplete/Autocomplete.types";
import { AUTOCOMPLETE_CITIES, type City } from "./autocompleteData";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    openOnFocus?: boolean;
    size?: AutocompleteSize;
    multiple?: boolean;
    loading?: boolean;
    inputValue?: string;
    defaultInputValue?: string;
    defaultValue?: AutocompleteOption | AutocompleteOption[] | null;
    limitTags?: number;
    /** Swap in a custom group header that also prints the group's size. */
    customGroups?: boolean;
    /** Render an empty list, to reach the no-options slot. */
    empty?: boolean;
    /** Replace the empty and loading slots with custom rows. */
    customSlots?: boolean;
  }>(),
  {
    open: undefined,
    openOnFocus: false,
    size: "medium",
    multiple: false,
    loading: false,
    inputValue: undefined,
    defaultInputValue: undefined,
    defaultValue: undefined,
    limitTags: -1,
    customGroups: false,
    empty: false,
    customSlots: false,
  },
);

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: AutocompleteOption | AutocompleteOption[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<AutocompleteOption>,
  ];
}>();

const options = computed<City[]>(() => (props.empty ? [] : AUTOCOMPLETE_CITIES));
</script>

<template>
  <Autocomplete
    :open="open"
    :open-on-focus="openOnFocus"
    :size="size"
    :multiple="multiple"
    :loading="loading"
    :input-value="inputValue"
    :default-input-value="defaultInputValue"
    :default-value="defaultValue"
    :limit-tags="limitTags"
    :options="options"
    :group-by="empty ? undefined : (option) => (option as City).region"
    @change="(...args) => emit('change', ...args)"
  >
    <template #label>City</template>
    <template v-if="customGroups" #group="{ key, label, group }">
      <span role="presentation">{{ `${label} (${group.options.length})` }}</span>
    </template>
    <template v-if="customSlots" #no-options="{ inputValue: typed }">
      <li>{{ `No match for ${typed}` }}</li>
    </template>
    <template v-if="customSlots" #loading>
      <li>Fetching…</li>
    </template>
  </Autocomplete>
</template>
