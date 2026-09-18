<!--
  Test fixture for Select's `groupBy` plus the `#group`/`#no-options`/`#loading`
  slots, mirroring the React fixture of the same name — these need a real .vue
  file since a `.ct.ts` slot string cannot declare scoped slots.
-->
<script setup lang="ts">
import { computed } from "vue";
import Select from "../../components/Select/Select.vue";
import type {
  SelectionChangeDetails,
  SelectionChangeReason,
  SelectOption,
  SelectSize,
} from "../../components/Select/Select.types";
import { SELECT_CITIES, type City } from "./selectData";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    size?: SelectSize;
    multiple?: boolean;
    loading?: boolean;
    defaultValue?: string | string[] | null;
    /** Swap in a custom group header that also prints the group's size. */
    customGroups?: boolean;
    /** Render an empty list, to reach the no-options slot. */
    empty?: boolean;
    /** Replace the empty and loading slots with custom rows. */
    customSlots?: boolean;
  }>(),
  {
    open: undefined,
    size: "medium",
    multiple: false,
    loading: false,
    defaultValue: undefined,
    customGroups: false,
    empty: false,
    customSlots: false,
  },
);

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: string | string[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<SelectOption<string>>,
  ];
}>();

const options = computed<City[]>(() => (props.empty ? [] : SELECT_CITIES));
</script>

<template>
  <Select
    :open="open"
    :size="size"
    :multiple="multiple"
    :loading="loading"
    :default-value="defaultValue"
    :options="options"
    :group-by="empty ? undefined : (option) => (option as City).region"
    @change="(...args) => emit('change', ...args)"
  >
    <template #label>City</template>
    <template v-if="customGroups" #group="{ key, label, group }">
      <span role="presentation">{{ `${label} (${group.options.length})` }}</span>
    </template>
    <template v-if="customSlots" #no-options>
      <li>Nothing archived yet</li>
    </template>
    <template v-if="customSlots" #loading>
      <li>Fetching…</li>
    </template>
  </Select>
</template>
