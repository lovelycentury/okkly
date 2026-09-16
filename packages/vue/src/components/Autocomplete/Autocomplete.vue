<script setup lang="ts" generic="T = AutocompleteOption">
import { computed, useId, useTemplateRef, type ComponentPublicInstance } from "vue";
import { iconCheck, iconChevronDown, iconChevronUp, iconX } from "@okkly/icons";
import {
  useAutocomplete,
  type AutocompleteOption,
  type SelectionChangeDetails,
  type SelectionChangeReason,
} from "@okkly/vue-composables";
import "@okkly/design-system/components/Autocomplete/Autocomplete.scss";
import Popper from "../Popper/Popper.vue";
import Chip from "../Chip/Chip.vue";
import Spinner from "../Spinner/Spinner.vue";
import Field, { getFieldIds } from "../Field/Field.vue";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import OptionScope from "../Option/OptionScope.vue";
import type {
  AutocompleteGroupSlotScope,
  AutocompleteOptionState,
  AutocompleteProps,
} from "./Autocomplete.types";

// No `inheritAttrs: false` here: the root is `<Field>`, a single-root
// component, so Vue's automatic fallthrough already carries a consumer's
// `class` and other native attrs onto it (and, from there, onto Field's own
// single root div) with no manual re-forwarding needed.

const props = withDefaults(defineProps<AutocompleteProps<T>>(), {
  defaultValue: null,
  defaultInputValue: "",
  getOptionLabel: undefined,
  getOptionDescription: undefined,
  isOptionEqualToValue: undefined,
  filterOptions: undefined,
  groupBy: undefined,
  multiple: false,
  freeSolo: false,
  disabled: false,
  required: false,
  openOnFocus: false,
  autoHighlight: false,
  autoSelect: false,
  blurOnSelect: false,
  clearOnEscape: false,
  clearOnBlur: undefined,
  filterSelectedOptions: false,
  disableCloseOnSelect: undefined,
  disableClearable: false,
  limitTags: -1,
  hideLabel: false,
  placeholder: "Search…",
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  loading: false,
  name: undefined,
  noOptionsText: "No results",
  loadingText: "Loading…",
  clearText: "Clear",
  openText: "Open options",
  closeText: "Close options",
  popupWidth: undefined,
  id: undefined,
});

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: T | T[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<T>,
  ];
}>();

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below field. */
  "helper-text"?: () => unknown;
  /**
   * A single row. Spread `optionAttrs` with `v-bind` and `optionEvents` with
   * `v-on` on a single `<li>` (or `OptionRow`) — they carry the option role,
   * the id `aria-activedescendant` points at, and the pointer handlers.
   */
  option?: (scope: {
    optionAttrs: Record<string, unknown>;
    optionEvents: Record<string, (event: Event) => void>;
    option: T;
    state: AutocompleteOptionState;
  }) => unknown;
  /**
   * Rebuilds the `<input>` itself. `inputAttrs`/`inputEvents` must be bound
   * on it, and `inputRef` passed to its `:ref`, or the field stops typing,
   * filtering and reporting itself to assistive tech.
   */
  input?: (scope: {
    inputAttrs: Record<string, unknown>;
    inputEvents: Record<string, (event: Event) => void>;
    inputRef: (el: Element | ComponentPublicInstance | null) => void;
    state: {
      open: boolean;
      disabled: boolean;
      error: boolean;
      multiple: boolean;
      inputValue: string;
      value: T | T[] | null;
    };
  }) => unknown;
  /** A `groupBy` header. The row list underneath stays fixed. */
  group?: (scope: AutocompleteGroupSlotScope<T>) => unknown;
  /** The empty state. */
  "no-options"?: (scope: { inputValue: string }) => unknown;
  /** The pending state. */
  loading?: (scope: { inputValue: string }) => unknown;
  /** Replaces the whole tag row for `multiple`. */
  tags?: (scope: {
    value: T[];
    getTagProps: (index: number) => Record<string, unknown>;
    removeTag: (index: number) => void;
  }) => unknown;
}>();

const model = defineModel<T | T[] | null>();
const inputValueModel = defineModel<string>("inputValue");
const openModel = defineModel<boolean>("open", { default: false });

const generatedId = useId();
const fieldId = computed(() => props.id ?? generatedId);
const describedBy = computed(
  () => getFieldIds(fieldId.value, false, !!slots["helper-text"]).helperId,
);

// `defaultValue`/`defaultInputValue` are read here rather than written into
// the model on mount: writing always emits `update:modelValue`, which would
// fire a spurious event before any user interaction — see Slider.vue.
const resolvedValue = computed<T | T[] | null>(() =>
  model.value !== undefined ? model.value : (props.defaultValue ?? null),
);
const resolvedInputValue = computed<string>(() =>
  inputValueModel.value !== undefined ? inputValueModel.value : props.defaultInputValue,
);

const fieldRef = useTemplateRef<InstanceType<typeof Field>>("field");
const panelRef = useTemplateRef<HTMLDivElement>("panel");
// Unlike a plain React ref, a Vue template ref is itself reactive — Popper's
// `anchorEl` sees it update the moment Field's `controlRef` is populated, with
// no extra state needed for the controlled-open-on-first-render case.
const controlNode = computed(() => fieldRef.value?.controlRef ?? null);

const autocomplete = useAutocomplete<T>(() => ({
  options: props.options,
  value: resolvedValue.value,
  inputValue: resolvedInputValue.value,
  open: openModel.value,
  onChange: (event, value, reason, details) => {
    model.value = value;
    emit("change", event, value, reason, details);
  },
  onInputValueChange: (value) => {
    inputValueModel.value = value;
  },
  onOpenChange: (open) => {
    openModel.value = open;
  },
  getOptionLabel: props.getOptionLabel,
  filterOptions: props.filterOptions,
  isOptionEqualToValue: props.isOptionEqualToValue,
  groupBy: props.groupBy,
  multiple: props.multiple,
  freeSolo: props.freeSolo,
  disabled: props.disabled,
  openOnFocus: props.openOnFocus,
  disableCloseOnSelect: props.disableCloseOnSelect,
  autoHighlight: props.autoHighlight,
  autoSelect: props.autoSelect,
  blurOnSelect: props.blurOnSelect,
  clearOnEscape: props.clearOnEscape,
  clearOnBlur: props.clearOnBlur,
  filterSelectedOptions: props.filterSelectedOptions,
  disableClearable: props.disableClearable,
}));

defineExpose({ inputRef: autocomplete.inputRef });

// Popper, unlike Popover, has no backdrop and no dismissal of its own.
useOutsideDismiss(
  [controlNode, panelRef],
  () => autocomplete.isOpen.value,
  () => autocomplete.setOpen(false),
);

/**
 * The chevron, the clear button and the field's own padding all sit outside
 * the input, so without this the only live target in the control is the
 * input itself. A click anywhere in the box puts the caret in the input and
 * opens the list, as MUI's Autocomplete does. Vue's native DOM events (unlike
 * React's synthetic tree) never bubble up from the portaled listbox through
 * the control at all, so — unlike the React port — no containment check
 * against a click landing in the popup is needed here.
 */
function handleControlClick(event: MouseEvent) {
  if (props.disabled) return;
  if ((event.target as HTMLElement).closest("button, input")) return;
  autocomplete.inputRef.value?.focus();
  autocomplete.setOpen(true);
}

function setInputRef(el: Element | ComponentPublicInstance | null) {
  autocomplete.inputRef.value = el as HTMLInputElement | null;
}

function toListeners<E extends Event>(
  events: Record<string, (event: E) => void>,
): Record<string, (event: E) => void> {
  return Object.fromEntries(
    Object.entries(events).map(([key, handler]) => [
      `on${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      handler,
    ]),
  );
}

function optionProps(index: number): Record<string, unknown> {
  return { ...autocomplete.optionAttrs(index), ...toListeners(autocomplete.optionEvents(index)) };
}

function optionState(index: number): AutocompleteOptionState {
  const option = autocomplete.filteredOptions.value[index];
  return {
    selected: option != null && autocomplete.isSelected(option),
    highlighted: autocomplete.highlightedIndex.value === index,
    index,
    inputValue: autocomplete.inputValue.value,
    multiple: props.multiple,
    size: props.size,
  };
}

function optionClasses(index: number) {
  const state = optionState(index);
  return [
    "okkly-autocomplete__option",
    state.highlighted && "okkly-autocomplete__option--highlighted",
    state.selected && "okkly-autocomplete__option--selected",
  ]
    .filter(Boolean)
    .join(" ");
}

const tags = computed<T[]>(() =>
  props.multiple && Array.isArray(autocomplete.value.value)
    ? (autocomplete.value.value as T[])
    : [],
);
const shownTags = computed(() =>
  props.limitTags < 0 ? tags.value : tags.value.slice(0, props.limitTags),
);
const tagOverflow = computed(() => tags.value.length - shownTags.value.length);

function getTagProps(index: number): Record<string, unknown> {
  return { ...autocomplete.tagAttrs(index), ...toListeners(autocomplete.tagEvents(index)) };
}

const selectedForForm = computed<T[]>(() => {
  if (props.multiple) return tags.value;
  const current = autocomplete.value.value;
  return current != null ? [current as T] : [];
});

// The composable's own `inputAttrs` knows nothing about the field shell
// around it, so the id/placeholder/required/error wiring that ties the
// `<input>` to its `<label>` and helper text is merged in here — for both the
// default input below and a consumer's `#input` slot, so replacing the
// element never means losing its accessible name.
const inputSlotAttrs = computed(() => ({
  ...autocomplete.inputAttrs.value,
  id: fieldId.value,
  placeholder: tags.value.length > 0 ? "Add…" : props.placeholder,
  required: props.required,
  "aria-invalid": props.error || undefined,
  "aria-describedby": describedBy.value,
}));

const inputSlotState = computed(() => ({
  open: autocomplete.isOpen.value,
  disabled: props.disabled,
  error: props.error,
  multiple: props.multiple,
  inputValue: autocomplete.inputValue.value,
  value: autocomplete.value.value,
}));

const panelClasses = computed(() =>
  props.size === "medium"
    ? "okkly-autocomplete-popover"
    : `okkly-autocomplete-popover okkly-autocomplete-popover--${props.size}`,
);

const popperModifiers = [{ name: "offset" as const, options: { offset: [0, 4] } }];

const popupStyle = computed(() =>
  props.popupWidth === undefined
    ? undefined
    : { width: typeof props.popupWidth === "number" ? `${props.popupWidth}px` : props.popupWidth },
);
</script>

<template>
  <Field
    ref="field"
    block="okkly-autocomplete"
    :id="fieldId"
    :hide-label="hideLabel"
    :required="required"
    :size="size"
    :color="color"
    :error="error"
    :disabled="disabled"
    :full-width="fullWidth"
    @control-click="handleControlClick"
  >
    <template v-if="slots.label" #label><slot name="label" /></template>
    <template v-if="slots['helper-text']" #helper-text><slot name="helper-text" /></template>

    <div class="okkly-autocomplete__body">
      <div v-if="tags.length > 0" class="okkly-autocomplete__tags">
        <slot
          name="tags"
          :value="tags"
          :get-tag-props="getTagProps"
          :remove-tag="autocomplete.removeTag"
        >
          <span
            v-for="(tag, index) in shownTags"
            :key="`${autocomplete.getOptionLabel(tag)}-${index}`"
            v-bind="getTagProps(index)"
          >
            <Chip
              size="small"
              variant="solid"
              :removable="!disabled"
              @remove="autocomplete.removeTag(index)"
            >
              {{ autocomplete.getOptionLabel(tag) }}
            </Chip>
          </span>
          <span v-if="tagOverflow > 0" class="okkly-autocomplete__overflow"
            >+{{ tagOverflow }}</span
          >
        </slot>
      </div>

      <slot
        name="input"
        :input-attrs="inputSlotAttrs"
        :input-events="autocomplete.inputEvents"
        :input-ref="setInputRef"
        :state="inputSlotState"
      >
        <input
          :ref="setInputRef"
          v-bind="inputSlotAttrs"
          v-on="autocomplete.inputEvents"
          class="okkly-autocomplete__input"
        />
      </slot>
    </div>

    <template v-if="name">
      <input
        v-for="(item, index) in selectedForForm"
        :key="`${autocomplete.getOptionLabel(item)}-${index}`"
        type="hidden"
        :name="name"
        :value="autocomplete.getOptionLabel(item)"
      />
    </template>

    <template #end-adornment>
      <button
        v-if="!disableClearable"
        type="button"
        class="okkly-autocomplete__clear"
        v-bind="autocomplete.clearAttrs.value"
        v-on="autocomplete.clearEvents"
        :aria-label="clearText"
      >
        <span v-html="iconX" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="okkly-autocomplete__toggle"
        tabindex="-1"
        :aria-label="autocomplete.isOpen.value ? closeText : openText"
        :disabled="disabled"
        @click="autocomplete.setOpen(!autocomplete.isOpen.value)"
      >
        <span
          v-html="autocomplete.isOpen.value ? iconChevronUp : iconChevronDown"
          aria-hidden="true"
        />
      </button>
    </template>

    <Popper
      :open="autocomplete.isOpen.value"
      :anchor-el="controlNode"
      placement="bottom-start"
      class="okkly-autocomplete-popper"
      :modifiers="popperModifiers"
      match-anchor-width="min"
      :style="popupStyle"
      role="presentation"
    >
      <!-- The panel is portaled to <body>, so the field's size modifier does
           not reach it by inheritance — it is copied on explicitly. -->
      <div ref="panel" :class="panelClasses">
        <!-- Names the BEM block for the option primitives, so a custom
             `#option` slot built from them picks up this listbox's styling. -->
        <OptionScope block="okkly-autocomplete">
          <ul v-bind="autocomplete.listboxAttrs.value" class="okkly-autocomplete__listbox">
            <template v-if="loading">
              <slot name="loading" :input-value="autocomplete.inputValue.value">
                <li class="okkly-autocomplete__loading">
                  <Spinner size="small" />{{ loadingText }}
                </li>
              </slot>
            </template>
            <template v-else-if="autocomplete.filteredOptions.value.length === 0">
              <slot name="no-options" :input-value="autocomplete.inputValue.value">
                <li class="okkly-autocomplete__empty">{{ noOptionsText }}</li>
              </slot>
            </template>
            <template v-else-if="autocomplete.groupedOptions.value">
              <li
                v-for="group in autocomplete.groupedOptions.value"
                :key="group.key"
                role="presentation"
              >
                <slot name="group" :key="group.key" :label="group.label" :group="group">
                  <span class="okkly-autocomplete__group-label" role="presentation">{{
                    group.label
                  }}</span>
                </slot>
                <ul
                  class="okkly-autocomplete__group-options"
                  role="group"
                  :aria-label="group.label"
                >
                  <template v-for="{ index } in group.options" :key="index">
                    <slot
                      name="option"
                      :option-attrs="autocomplete.optionAttrs(index)"
                      :option-events="autocomplete.optionEvents(index)"
                      :option="autocomplete.filteredOptions.value[index]"
                      :state="optionState(index)"
                    >
                      <li v-bind="optionProps(index)" :class="optionClasses(index)">
                        <span class="okkly-autocomplete__option-label">{{
                          autocomplete.getOptionLabel(autocomplete.filteredOptions.value[index])
                        }}</span>
                        <span
                          v-if="getOptionDescription?.(autocomplete.filteredOptions.value[index])"
                          class="okkly-autocomplete__option-meta"
                          >{{
                            getOptionDescription!(autocomplete.filteredOptions.value[index])
                          }}</span
                        >
                        <span
                          v-if="autocomplete.isSelected(autocomplete.filteredOptions.value[index])"
                          class="okkly-autocomplete__option-check"
                          aria-hidden="true"
                          v-html="iconCheck"
                        />
                      </li>
                    </slot>
                  </template>
                </ul>
              </li>
            </template>
            <template v-else>
              <template v-for="(option, index) in autocomplete.filteredOptions.value" :key="index">
                <slot
                  name="option"
                  :option-attrs="autocomplete.optionAttrs(index)"
                  :option-events="autocomplete.optionEvents(index)"
                  :option="option"
                  :state="optionState(index)"
                >
                  <li v-bind="optionProps(index)" :class="optionClasses(index)">
                    <span class="okkly-autocomplete__option-label">{{
                      autocomplete.getOptionLabel(option)
                    }}</span>
                    <span
                      v-if="getOptionDescription?.(option)"
                      class="okkly-autocomplete__option-meta"
                      >{{ getOptionDescription!(option) }}</span
                    >
                    <span
                      v-if="autocomplete.isSelected(option)"
                      class="okkly-autocomplete__option-check"
                      aria-hidden="true"
                      v-html="iconCheck"
                    />
                  </li>
                </slot>
              </template>
            </template>
          </ul>
        </OptionScope>
      </div>
    </Popper>
  </Field>
</template>
