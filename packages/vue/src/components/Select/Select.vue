<script setup lang="ts" generic="T = string">
import {
  computed,
  Fragment,
  h,
  useId,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from "vue";
import { iconCheck, iconChevronDown, iconX } from "@okkly/icons";
import {
  useSelect,
  type SelectionChangeDetails,
  type SelectionChangeReason,
  type SelectOption,
} from "@okkly/vue-composables";
import "@okkly/design-system/components/Select/Select.scss";
import Popper from "../Popper/Popper.vue";
import Checkbox from "../Checkbox/Checkbox.vue";
import Chip from "../Chip/Chip.vue";
import Spinner from "../Spinner/Spinner.vue";
import Field, { getFieldIds } from "../Field/Field.vue";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import OptionScope from "../Option/OptionScope.vue";
import type {
  SelectColor,
  SelectGroupSlotScope,
  SelectOptionState,
  SelectProps,
  SelectSize,
} from "./Select.types";

// No `inheritAttrs: false` here: the root is `<Field>`, a single-root
// component, so Vue's automatic fallthrough already carries a consumer's
// `class` and other native attrs onto it with no manual re-forwarding needed.

const props = withDefaults(defineProps<SelectProps<T>>(), {
  defaultValue: undefined,
  multiple: false,
  disabled: false,
  required: false,
  placeholder: "Select…",
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  loading: false,
  name: undefined,
  groupBy: undefined,
  isOptionEqualToValue: undefined,
  limitTags: 2,
  disableCloseOnSelect: undefined,
  disableClearable: false,
  noOptionsText: "No options",
  loadingText: "Loading…",
  clearText: "Clear",
  popupWidth: undefined,
  id: undefined,
});

const emit = defineEmits<{
  change: [
    event: Event | null,
    value: T | T[] | null,
    reason: SelectionChangeReason,
    details?: SelectionChangeDetails<SelectOption<T>>,
  ];
}>();

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below field. */
  "helper-text"?: () => unknown;
  /** Replaces the whole trigger content. */
  value?: (scope: { selected: SelectOption<T>[] }) => unknown;
  /**
   * A single row. Spread `optionAttrs` with `v-bind` and `optionEvents` with
   * `v-on` on a single `<li>` — they carry the option role, the id
   * `aria-activedescendant` points at, and the pointer handlers.
   */
  option?: (scope: {
    optionAttrs: Record<string, unknown>;
    optionEvents: Record<string, (event: Event) => void>;
    option: SelectOption<T>;
    state: SelectOptionState;
  }) => unknown;
  /**
   * Rebuilds the trigger itself — the `div[role="combobox"]`, not a text
   * input; unlike `Autocomplete`'s own `#input` slot. `triggerAttrs`/
   * `triggerEvents` must be bound on it, and `triggerRef` passed to its
   * `:ref`, or the field stops opening, navigating and reporting itself to
   * assistive tech. `endAdornment` — the clear button and chevron — is
   * handed over here instead of staying on the field, so a custom trigger
   * decides where, or whether, they sit.
   */
  trigger?: (scope: {
    triggerAttrs: Record<string, unknown>;
    triggerEvents: Record<string, (event: Event) => void>;
    triggerRef: (el: Element | ComponentPublicInstance | null) => void;
    value: () => unknown;
    endAdornment: () => unknown;
    selected: SelectOption<T>[];
    state: {
      open: boolean;
      disabled: boolean;
      error: boolean;
      multiple: boolean;
      size: SelectSize;
      color: SelectColor;
    };
  }) => unknown;
  /** A `groupBy` header. The row list underneath stays fixed. */
  group?: (scope: SelectGroupSlotScope<T>) => unknown;
  /** The empty state. */
  "no-options"?: () => unknown;
  /** The pending state. */
  loading?: () => unknown;
}>();

const model = defineModel<T | T[] | null>();
const openModel = defineModel<boolean>("open", { default: false });

const generatedId = useId();
const fieldId = computed(() => props.id ?? generatedId);
const idsFor = computed(() => getFieldIds(fieldId.value, !!slots.label, !!slots["helper-text"]));

// `defaultValue` is read here rather than written into the model on mount:
// writing always emits `update:modelValue`, which would fire a spurious
// event before any user interaction — see Slider.vue.
const resolvedValue = computed<T | T[] | null>(() =>
  model.value !== undefined ? model.value : (props.defaultValue ?? null),
);

const fieldRef = useTemplateRef<InstanceType<typeof Field>>("field");
const panelRef = useTemplateRef<HTMLDivElement>("panel");
const controlNode = computed(() => fieldRef.value?.controlRef ?? null);

const select = useSelect<T>(() => ({
  options: props.options,
  value: resolvedValue.value,
  multiple: props.multiple,
  onChange: (event, value, reason, details) => {
    model.value = value;
    emit("change", event, value, reason, details);
  },
  disabled: props.disabled,
  open: openModel.value,
  onOpenChange: (open) => {
    openModel.value = open;
  },
  isOptionEqualToValue: props.isOptionEqualToValue,
  groupBy: props.groupBy,
  disableCloseOnSelect: props.disableCloseOnSelect,
  disableClearable: props.disableClearable,
}));

// Popper, unlike Popover, has no backdrop and no dismissal of its own. The
// whole control counts as "inside" — clicking its padding opens the popup, so
// it must not close it on the way down.
useOutsideDismiss(
  [controlNode, panelRef],
  () => select.isOpen.value,
  () => select.setOpen(false),
);

/**
 * The chevron and the field's own padding live outside the trigger div (they
 * are Field adornments), so without this they would be dead space. Clicks
 * that started on the trigger, a chip's × or the clear button are left to
 * their own handlers — otherwise every one of them would toggle twice. Vue's
 * native DOM events never bubble up from the portaled listbox through the
 * control at all, so — unlike the React port — no containment check against a
 * click landing in the popup is needed here.
 */
function handleControlClick(event: MouseEvent) {
  if (props.disabled) return;
  if ((event.target as HTMLElement).closest("button, [role='combobox']")) return;
  select.setOpen(!select.isOpen.value);
  select.triggerRef.value?.focus();
}

function setTriggerRef(el: Element | ComponentPublicInstance | null) {
  select.triggerRef.value = el as HTMLElement | null;
}

// `v-bind`/`h()` only treat `onXxx`-keyed props as listeners — unlike
// `v-on`, a bare event name spread through either is just a dead attribute.
// The composable hands back bare-keyed listener maps (meant for `v-on`), so
// anywhere they get merged into a single `v-bind`/`h()` prop bag needs this
// conversion first.
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

const hasValue = computed(() => select.selectedOptions.value.length > 0);

// A plain function invoked via `<component :is="…" />` — Vue's equivalent of
// React handing `renderTriggerContent()` to both the default trigger and
// `renderInput`'s `value` param. Must return a single root; the multi-select
// branch already does (one wrapping `<span>`), and the others get one from
// `h(Fragment, …)`.
function renderTriggerValue() {
  if (slots.value) {
    return h(Fragment, (slots.value({ selected: select.selectedOptions.value }) ?? []) as VNode[]);
  }

  if (!hasValue.value) {
    return h(
      "span",
      { class: "okkly-select__value okkly-select__value--placeholder" },
      props.placeholder,
    );
  }

  if (!props.multiple) {
    return h("span", { class: "okkly-select__value" }, select.selectedOptions.value[0]?.label);
  }

  const shown =
    props.limitTags < 0
      ? select.selectedOptions.value
      : select.selectedOptions.value.slice(0, props.limitTags);
  const overflow = select.selectedOptions.value.length - shown.length;

  const chipNodes = shown.map((option) =>
    h(
      Chip,
      {
        key: String(option.value),
        size: "small",
        variant: "solid",
        removable: !props.disabled,
        // The trigger is a div rather than a button precisely so these
        // remove buttons are legal here; stopping propagation keeps the
        // click from also toggling the popup.
        onRemove: (event: Event | null) => {
          event?.stopPropagation?.();
          select.removeValue(event ?? null, option);
        },
      },
      { default: () => option.label },
    ),
  );
  if (overflow > 0) chipNodes.push(h("span", { class: "okkly-select__overflow" }, `+${overflow}`));

  return h("span", { class: "okkly-select__chips" }, chipNodes);
}

// Same `<component :is>` technique as `renderTriggerValue`, for the clear
// button + chevron React hands `renderInput` as `endAdornment`.
function renderEndAdornment() {
  const nodes: VNode[] = [];
  if (!props.disableClearable && hasValue.value && !props.disabled) {
    nodes.push(
      h(
        "button",
        {
          type: "button",
          class: "okkly-select__clear",
          ...select.clearAttrs.value,
          ...toListeners(select.clearEvents),
          "aria-label": props.clearText,
        },
        [h("span", { innerHTML: iconX, "aria-hidden": "true" })],
      ),
    );
  }
  nodes.push(
    h("span", {
      class: "okkly-select__chevron",
      innerHTML: iconChevronDown,
      "aria-hidden": "true",
    }),
  );
  return h(Fragment, nodes);
}

function optionState(index: number): SelectOptionState {
  const option = select.flatOptions.value[index];
  return {
    selected: option != null && select.isSelected(option),
    highlighted: select.highlightedIndex.value === index,
    index,
    disabled: option?.disabled === true,
    multiple: props.multiple,
    size: props.size,
  };
}

function optionClasses(index: number) {
  const state = optionState(index);
  return [
    "okkly-select__option",
    state.highlighted && "okkly-select__option--highlighted",
    state.selected && "okkly-select__option--selected",
    state.disabled && "okkly-select__option--disabled",
  ]
    .filter(Boolean)
    .join(" ");
}

function optionAttrsForSlot(index: number): Record<string, unknown> {
  return { ...select.optionAttrs(index), class: optionClasses(index) };
}

function optionProps(index: number): Record<string, unknown> {
  return { ...optionAttrsForSlot(index), ...toListeners(select.optionEvents(index)) };
}

const selectedForForm = computed<SelectOption<T>[]>(() =>
  props.multiple ? select.selectedOptions.value : select.selectedOptions.value.slice(0, 1),
);

const triggerSlotState = computed(() => ({
  open: select.isOpen.value,
  disabled: props.disabled,
  error: props.error,
  multiple: props.multiple,
  size: props.size,
  color: props.color,
}));

const triggerAttrsForField = computed(() => ({
  ...select.triggerAttrs.value,
  id: fieldId.value,
  class: "okkly-select__trigger okkly-select__input",
  "aria-invalid": props.error || undefined,
  "aria-required": props.required || undefined,
  "aria-labelledby": idsFor.value.labelId,
  "aria-describedby": idsFor.value.helperId,
}));

const panelClasses = computed(() =>
  props.size === "medium"
    ? "okkly-select-popover"
    : `okkly-select-popover okkly-select-popover--${props.size}`,
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
    block="okkly-select"
    :id="fieldId"
    :hide-label="false"
    :required="required"
    :size="size"
    :color="color"
    :error="error"
    :disabled="disabled"
    :full-width="fullWidth"
    :html-for="false"
    @control-click="handleControlClick"
  >
    <template v-if="slots.label" #label><slot name="label" /></template>
    <template v-if="slots['helper-text']" #helper-text><slot name="helper-text" /></template>

    <slot
      v-if="slots.trigger"
      name="trigger"
      :trigger-attrs="triggerAttrsForField"
      :trigger-events="select.triggerEvents"
      :trigger-ref="setTriggerRef"
      :value="renderTriggerValue"
      :end-adornment="renderEndAdornment"
      :selected="select.selectedOptions.value"
      :state="triggerSlotState"
    />
    <div v-else :ref="setTriggerRef" v-bind="triggerAttrsForField" v-on="select.triggerEvents">
      <component :is="renderTriggerValue" />
    </div>

    <template v-if="name">
      <input
        v-for="(option, index) in selectedForForm"
        :key="`${String(option.value)}-${index}`"
        type="hidden"
        :name="name"
        :value="String(option.value)"
      />
    </template>

    <template v-if="!slots.trigger" #end-adornment>
      <component :is="renderEndAdornment" />
    </template>

    <Popper
      :open="select.isOpen.value"
      :anchor-el="controlNode"
      placement="bottom-start"
      class="okkly-select-popper"
      :modifiers="popperModifiers"
      match-anchor-width="min"
      :style="popupStyle"
      role="presentation"
    >
      <!-- The panel is portaled to <body>, so the field's size modifier does
           not reach it by inheritance — it is copied on explicitly. -->
      <div ref="panel" :class="panelClasses">
        <!-- Names the BEM block for the option primitives, so a custom
             `#option` slot picks up this listbox's styling. -->
        <OptionScope block="okkly-select">
          <ul v-bind="select.listboxAttrs.value" class="okkly-select__listbox">
            <template v-if="loading">
              <slot name="loading">
                <li class="okkly-select__loading"><Spinner size="small" />{{ loadingText }}</li>
              </slot>
            </template>
            <template v-else-if="select.flatOptions.value.length === 0">
              <slot name="no-options">
                <li class="okkly-select__empty">{{ noOptionsText }}</li>
              </slot>
            </template>
            <template v-else-if="select.groupedOptions.value">
              <li v-for="group in select.groupedOptions.value" :key="group.key" role="presentation">
                <slot name="group" :key="group.key" :label="group.label" :group="group">
                  <span class="okkly-select__group-label" role="presentation">{{
                    group.label
                  }}</span>
                </slot>
                <ul class="okkly-select__group-options" role="group" :aria-label="group.label">
                  <template v-for="{ index } in group.options" :key="index">
                    <slot
                      name="option"
                      :option-attrs="optionAttrsForSlot(index)"
                      :option-events="select.optionEvents(index)"
                      :option="select.flatOptions.value[index]"
                      :state="optionState(index)"
                    >
                      <li v-bind="optionProps(index)">
                        <Checkbox
                          v-if="multiple"
                          :model-value="optionState(index).selected"
                          :disabled="select.flatOptions.value[index].disabled"
                          size="small"
                          readonly
                          tabindex="-1"
                        />
                        <span class="okkly-select__option-label">{{
                          select.flatOptions.value[index].label
                        }}</span>
                        <span
                          v-if="!multiple && optionState(index).selected"
                          class="okkly-select__option-check"
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
              <template v-for="(option, index) in select.flatOptions.value" :key="index">
                <slot
                  name="option"
                  :option-attrs="optionAttrsForSlot(index)"
                  :option-events="select.optionEvents(index)"
                  :option="option"
                  :state="optionState(index)"
                >
                  <li v-bind="optionProps(index)">
                    <Checkbox
                      v-if="multiple"
                      :model-value="optionState(index).selected"
                      :disabled="option.disabled"
                      size="small"
                      readonly
                      tabindex="-1"
                    />
                    <span class="okkly-select__option-label">{{ option.label }}</span>
                    <span
                      v-if="!multiple && optionState(index).selected"
                      class="okkly-select__option-check"
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
