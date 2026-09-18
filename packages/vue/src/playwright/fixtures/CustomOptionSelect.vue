<!--
  Test fixture for Select's `#option` slot, built from the Option primitives —
  mirrors the React fixture of the same name.
-->
<script setup lang="ts">
import Select from "../../components/Select/Select.vue";
import OptionRow from "../../components/Option/OptionRow.vue";
import OptionLabel from "../../components/Option/OptionLabel.vue";
import OptionDescription from "../../components/Option/OptionDescription.vue";
import OptionBody from "../../components/Option/OptionBody.vue";
import OptionCheck from "../../components/Option/OptionCheck.vue";
import type {
  SelectionChangeDetails,
  SelectionChangeReason,
  SelectOption,
  SelectOptionState,
  SelectSize,
} from "../../components/Select/Select.types";
import type { City } from "./selectData";

withDefaults(
  defineProps<{
    options: SelectOption[];
    open?: boolean;
    size?: SelectSize;
    multiple?: boolean;
    /** Render a two-line row using the option primitives. */
    twoLine?: boolean;
  }>(),
  {
    open: undefined,
    size: "medium",
    multiple: false,
    twoLine: false,
  },
);

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: string | string[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<SelectOption<string>>,
  ];
  "option-state": [state: SelectOptionState];
}>();

/** Reports the state a row was drawn with — invoked from a hidden marker in the row's markup, since a template slot has no other side-effect hook. */
function reportState(state: SelectOptionState): string {
  emit("option-state", state);
  return "";
}
</script>

<template>
  <Select
    :open="open"
    :size="size"
    :multiple="multiple"
    :options="options"
    @change="(...args) => emit('change', ...args)"
  >
    <template #label>Team</template>
    <template #option="{ optionAttrs, optionEvents, option, state }">
      <OptionRow v-bind="optionAttrs" v-on="optionEvents">
        <span style="display: none" aria-hidden="true">{{ reportState(state) }}</span>
        <template v-if="twoLine">
          <OptionBody>
            <OptionLabel>{{ option.label }}</OptionLabel>
            <OptionDescription>{{ (option as City).region }}</OptionDescription>
          </OptionBody>
        </template>
        <template v-else>
          <OptionLabel>{{ option.label }}</OptionLabel>
          <OptionCheck :checked="state.selected" />
        </template>
      </OptionRow>
    </template>
  </Select>
</template>
