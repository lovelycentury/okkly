<!--
  Test fixture for Autocomplete's `#option` slot, built from the Option
  primitives — mirrors the React fixture of the same name.
-->
<script setup lang="ts">
import Autocomplete from "../../components/Autocomplete/Autocomplete.vue";
import OptionRow from "../../components/Option/OptionRow.vue";
import OptionLabel from "../../components/Option/OptionLabel.vue";
import OptionDescription from "../../components/Option/OptionDescription.vue";
import OptionCheck from "../../components/Option/OptionCheck.vue";
import HighlightMatch from "../../components/Option/HighlightMatch.vue";
import type {
  AutocompleteOption,
  AutocompleteOptionState,
  AutocompleteSize,
  SelectionChangeDetails,
  SelectionChangeReason,
} from "../../components/Autocomplete/Autocomplete.types";

withDefaults(
  defineProps<{
    options: AutocompleteOption[];
    open?: boolean;
    openOnFocus?: boolean;
    size?: AutocompleteSize;
    multiple?: boolean;
    defaultInputValue?: string;
    /** Render the row with a highlighted run plus a description line. */
    highlight?: boolean;
  }>(),
  {
    open: undefined,
    openOnFocus: false,
    size: "medium",
    multiple: false,
    defaultInputValue: undefined,
    highlight: false,
  },
);

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: AutocompleteOption | AutocompleteOption[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<AutocompleteOption>,
  ];
  "option-state": [state: AutocompleteOptionState];
}>();

/** Reports the state a row was drawn with — invoked from a hidden marker in the row's markup, since a template slot has no other side-effect hook. */
function reportState(state: AutocompleteOptionState): string {
  emit("option-state", state);
  return "";
}
</script>

<template>
  <Autocomplete
    :open="open"
    :open-on-focus="openOnFocus"
    :size="size"
    :multiple="multiple"
    :default-input-value="defaultInputValue"
    :options="options"
    @change="(...args) => emit('change', ...args)"
  >
    <template #label>People</template>
    <template #option="{ optionAttrs, optionEvents, option, state }">
      <OptionRow v-bind="optionAttrs" v-on="optionEvents">
        <span style="display: none" aria-hidden="true">{{ reportState(state) }}</span>
        <OptionLabel>
          <HighlightMatch v-if="highlight" :text="option.label" query="mik" />
          <template v-else>{{ option.label }}</template>
        </OptionLabel>
        <OptionDescription v-if="highlight">Design</OptionDescription>
        <OptionCheck v-else :checked="state.selected" />
      </OptionRow>
    </template>
  </Autocomplete>
</template>
