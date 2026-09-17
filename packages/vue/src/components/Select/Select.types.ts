import type { OptionGroup, SelectOption } from "@okkly/vue-composables";
import type { FieldColor, FieldSize } from "../Field/Field.types";

export type SelectSize = FieldSize;
export type SelectColor = FieldColor;

export type { SelectOption } from "@okkly/vue-composables";
export type {
  OptionGroup,
  SelectionChangeDetails,
  SelectionChangeHandler,
  SelectionChangeReason,
} from "@okkly/vue-composables";

/** What a custom `#option` slot is told about the row it is drawing. */
export interface SelectOptionState {
  /** Whether this option is part of the current value. */
  selected: boolean;
  /**
   * Whether this is the row the keyboard is on. Pointer hover sets it too, so
   * exactly one row is ever emphasised.
   */
  highlighted: boolean;
  /**
   * Index into the flat option list — the same index space the keyboard
   * navigation uses.
   */
  index: number;
  /** Whether the option itself is disabled. */
  disabled: boolean;
  /**
   * Whether the field is in multiple mode — the default row draws a checkbox
   * instead of a tick when it is.
   */
  multiple: boolean;
  /**
   * The field's size, so a custom row can scale with it. The popup is
   * portaled and inherits nothing, which is why this is handed over
   * explicitly.
   */
  size: SelectSize;
}

/** What a custom `#group` slot is told about the group header it is drawing. */
export interface SelectGroupSlotScope<T = string> {
  /** Stable key for the group. */
  key: string;
  /** The group's label, as returned by `groupBy`. */
  label: string;
  /** The group as the composable computed it, each option carrying its index into the flat list. */
  group: OptionGroup<SelectOption<T>>;
}

/**
 * Props follow MUI's Select API (https://mui.com/material-ui/api/select/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Select>`
 * name-for-name: `multiple`/`disabled`/`size`/`required`/`name`/
 * `groupBy`/`isOptionEqualToValue`/`limitTags`/`disableCloseOnSelect`/
 * `disableClearable`/`noOptionsText`/`loadingText` match name-for-name — the
 * Autocomplete-family additions behave as they do there.
 *
 * One intentional divergence carried over from React: `change` carries
 * `(event, value, reason, details)`, matching `Autocomplete`, instead of MUI
 * Select's `(event, child)` with the value hidden on `event.target.value`.
 *
 * Vue-forced differences:
 * - The controlled `value` + `onChange` pair becomes an unnamed
 *   `defineModel<T | T[] | null>()`, so consumers can `v-model` it —
 *   `open`/`onOpenChange` becomes the named `defineModel<boolean>("open")`.
 *   `defaultValue` stays a real prop — it seeds the model only while it is
 *   unbound, read in a computed fallback rather than written into the model
 *   on mount (writing would emit `update:modelValue` on mount, which
 *   React's lazy `useState` initializer never does). A `change` emit
 *   carries the full `(event, value, reason, details)` MUI signature for
 *   callers that need the reason a plain `v-model` drops.
 * - `label`/`helperText` become the `label`/`helper-text` slots, since Vue
 *   has no `ReactNode`.
 * - `renderOption` becomes the `#option` slot, scoped with `{ optionAttrs,
 *   optionEvents, option, state }` — bind `optionAttrs` with `v-bind` and
 *   `optionEvents` with `v-on` on a single `<li>` the same way React's
 *   `props` is spread.
 * - `renderGroup` becomes the `#group` slot, scoped with `{ key, label,
 *   group }` — narrower than React's version, which also hands over the
 *   group's already-rendered rows as `children`. Vue's template model has no
 *   render-prop equivalent for "pre-rendered content to reposition" without
 *   dropping to manual render functions, so `#group` customizes only the
 *   header; the row list and its `<ul role="group">` wrapper (itself
 *   customizable per-row through `#option`) stay fixed.
 * - `renderInput` becomes the `#trigger` slot, scoped with `{ triggerAttrs,
 *   triggerEvents, triggerRef, value, selected, state }` — named `trigger`
 *   rather than `input` (unlike `Autocomplete`'s own `#input`) because what
 *   it rebuilds is the `div[role="combobox"]` trigger, not a text `<input>`.
 *   The clear button and chevron are handed over as the `end-adornment`
 *   slot instead of a plain prop, so a custom trigger can place — or drop —
 *   them itself.
 * - `renderValue` becomes the `#value` slot, scoped with `{ selected }`.
 * - `renderNoOptions`/`renderLoading` become the `#no-options`/`#loading`
 *   slots.
 * - `className` is dropped — a consumer's `class` merges onto the root
 *   automatically.
 *
 * Deliberate gaps carried over from React: no `sx`/`classes`/`slots`/
 * `slotProps`, no `native`/`MenuProps`, and options are passed via `options`
 * rather than `<MenuItem>` children.
 */
export interface SelectProps<T = string> {
  /**
   * Options.
   *
   * @default undefined
   */
  options: SelectOption<T>[];
  /**
   * Default Value.
   *
   * @default undefined
   */
  defaultValue?: T | T[] | null;
  /**
   * Multiple.
   *
   * @default false
   */
  multiple?: boolean;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Placeholder.
   *
   * @default "Select…"
   */
  placeholder?: string;
  /**
   * Size.
   *
   * @default "medium"
   */
  size?: SelectSize;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: SelectColor;
  /**
   * Error.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Full Width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Loading.
   *
   * @default false
   */
  loading?: boolean;
  /**
   * Emits hidden inputs so the value reaches a plain `<form>` submit.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Groups options under sticky headers; also reorders them so groups are contiguous.
   *
   * @default undefined
   */
  groupBy?: (option: SelectOption<T>) => string;
  /**
   * Required when values are objects — the default compares with `Object.is`.
   *
   * @default undefined
   */
  isOptionEqualToValue?: (option: SelectOption<T>, value: T) => boolean;
  /**
   * Chips shown before collapsing to "+N". `-1` shows all. Multi-select only.
   *
   * @default 2
   */
  limitTags?: number;
  /**
   * Disable Close On Select.
   *
   * @default undefined
   */
  disableCloseOnSelect?: boolean;
  /**
   * Disable Clearable.
   *
   * @default false
   */
  disableClearable?: boolean;
  /**
   * No Options Text.
   *
   * @default "No options"
   */
  noOptionsText?: string;
  /**
   * Loading Text.
   *
   * @default "Loading…"
   */
  loadingText?: string;
  /**
   * Clear Text.
   *
   * @default "Clear"
   */
  clearText?: string;
  /**
   * Width of the dropdown panel. It is never narrower than the field; this
   * is for the case where the options need more room than the trigger has.
   *
   * @default undefined
   */
  popupWidth?: number | string;
  /**
   * Id of the rendered trigger; also what the label's `aria-labelledby` and
   * the helper text's `aria-describedby` derive from. Auto-generated with
   * `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
