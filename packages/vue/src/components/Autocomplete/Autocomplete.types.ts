import type { AutocompleteOption, OptionGroup } from "@okkly/vue-composables";
import type { FieldColor, FieldSize } from "../Field/Field.types";

export type AutocompleteSize = FieldSize;
export type AutocompleteColor = FieldColor;

export type {
  AutocompleteOption,
  OptionGroup,
  SelectionChangeDetails,
  SelectionChangeHandler,
  SelectionChangeReason,
} from "@okkly/vue-composables";

/** What a custom `#option` slot is told about the row it is drawing. */
export interface AutocompleteOptionState {
  /** Whether this option is part of the current value. */
  selected: boolean;
  /**
   * Whether this is the row the keyboard is on. Pointer hover sets it too, so
   * exactly one row is ever emphasised.
   */
  highlighted: boolean;
  /**
   * Index into the filtered option list — the same index space the keyboard
   * navigation uses.
   */
  index: number;
  /**
   * What is typed in the field right now. Pass it to `HighlightMatch` to
   * emphasise the matching run.
   */
  inputValue: string;
  /** Whether the field is in multiple mode. */
  multiple: boolean;
  /**
   * The field's size, so a custom row can scale with it. The popup is
   * portaled and inherits nothing, which is why this is handed over
   * explicitly.
   */
  size: AutocompleteSize;
}

/** What a custom `#group` slot is told about the group header it is drawing. */
export interface AutocompleteGroupSlotScope<T = AutocompleteOption> {
  /** Stable key for the group. */
  key: string;
  /** The group's label, as returned by `groupBy`. */
  label: string;
  /** The group as the composable computed it, each option carrying its index into the flat list. */
  group: OptionGroup<T>;
}

/**
 * Props follow MUI's Autocomplete API (https://mui.com/material-ui/api/autocomplete/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<Autocomplete>`
 * name-for-name where Vue lets it: `options`/`getOptionLabel`/
 * `isOptionEqualToValue`/`filterOptions`/`groupBy`/`multiple`/`freeSolo`/
 * `disabled`/`openOnFocus`/`loading`/`loadingText`/`noOptionsText`/`clearText`/
 * `limitTags`/`autoHighlight`/`autoSelect`/`blurOnSelect`/`clearOnEscape`/
 * `clearOnBlur`/`filterSelectedOptions`/`disableCloseOnSelect`/
 * `disableClearable` all match name-for-name.
 *
 * Vue-forced differences:
 * - The controlled `value`/`onChange` pair becomes the primary `defineModel`
 *   (plain `v-model`); `inputValue`/`onInputChange` and `open`/`onOpenChange`
 *   become the named models `v-model:input-value` and `v-model:open`.
 *   `defaultValue` and `defaultInputValue` stay real props — they seed the
 *   model only while it is unbound, read in a computed fallback rather than
 *   written into the model on mount (writing would emit `update:modelValue`
 *   on mount, which React's lazy `useState` initializer never does). A
 *   `change` emit carries the full `(event, value, reason, details)` MUI
 *   signature for callers that need the reason a plain `v-model` drops.
 * - `label`/`helperText` become the `label`/`helper-text` slots (mirroring
 *   `TextField`), since Vue has no `ReactNode`. `getOptionDescription`'s
 *   return type narrows from `ReactNode` to `string`.
 * - `renderOption` becomes the `#option` slot, scoped with `{ optionAttrs,
 *   optionEvents, option, state }` — bind `optionAttrs` with `v-bind` and
 *   `optionEvents` with `v-on` on a single `<li>` (or `OptionRow`) the same
 *   way React's `props` is spread.
 * - `renderGroup` becomes the `#group` slot, scoped with `{ key, label,
 *   group }` — narrower than React's version, which also hands over the
 *   group's already-rendered rows as `children`. Vue's template model has no
 *   render-prop equivalent for "pre-rendered content to reposition" without
 *   dropping to manual render functions, so `#group` customizes only the
 *   header; the row list and its `<ul role="group">` wrapper (itself
 *   customizable per-row through `#option`) stay fixed.
 * - `renderInput` becomes the `#input` slot, scoped with `{ inputAttrs,
 *   inputEvents, inputRef, state }`, for the same reason narrower than
 *   React's: it rebuilds the `<input>` itself (wrap it, add a leading glyph
 *   inside the slot), but the tag row and the clear/toggle buttons stay in
 *   their normal position rather than being handed over for full relayout.
 * - `renderNoOptions`/`renderLoading` become the `#no-options`/`#loading`
 *   slots, scoped with `{ inputValue }`.
 * - `renderTags` becomes the `#tags` slot, scoped with `{ value, getTagProps,
 *   removeTag }` — `getTagProps(index)` returns `v-bind`-able attrs
 *   (listeners included), so a custom row still gets the Backspace/Delete
 *   keyboard removal for free.
 * - `className` is dropped — a consumer's `class` merges onto the root
 *   automatically.
 *
 * Deliberate gaps carried over from React: no `sx`/`classes`/`slots`/
 * `slotProps`, no virtualization, no built-in "Add «text»" row (`freeSolo`
 * alone commits typed text on Enter, reporting reason `"createOption"`).
 */
export interface AutocompleteProps<T = AutocompleteOption> {
  /**
   * Options. List of options to display in the autocomplete.
   *
   * @default undefined
   */
  options: T[];
  /**
   * The default value of the autocomplete, for when `v-model` is left
   * unbound. Can be a single option or an array of options.
   *
   * @default null
   */
  defaultValue?: T | T[] | null;
  /**
   * The default input value of the autocomplete, for when `v-model:input-value`
   * is left unbound.
   *
   * @default ""
   */
  defaultInputValue?: string;
  /**
   * Get Option Label. Function to get the label of an option.
   * E.g. 100 -> `$ 100`.
   *
   * @default undefined
   */
  getOptionLabel?: (option: T) => string;
  /**
   * Get Option Description. Function to get the description of an option.
   * E.g. Apple -> Apple is a fruit.
   *
   * @default undefined
   */
  getOptionDescription?: (option: T) => string;
  /**
   * Is Option Equal To Value. Function to check if an option is equal to a value.
   *
   * @default undefined
   */
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /**
   * Filter Options. Function to filter the options.
   *
   * @default undefined
   */
  filterOptions?: (
    options: T[],
    state: { inputValue: string; getOptionLabel: (option: T) => string },
  ) => T[];
  /**
   * Group By. Function to group the options.
   *
   * @default undefined
   */
  groupBy?: (option: T) => string;
  /**
   * Multiple. Whether the autocomplete allows multiple selections.
   *
   * @default false
   */
  multiple?: boolean;
  /**
   * Free Solo. Whether the autocomplete allows free solo input.
   *
   * @default false
   */
  freeSolo?: boolean;
  /**
   * Disabled. Whether the autocomplete is disabled.
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
   * Open On Focus. Whether the autocomplete opens on focus.
   *
   * @default false
   */
  openOnFocus?: boolean;
  /**
   * Auto Highlight. Whether the autocomplete automatically highlights the first option.
   *
   * @default false
   */
  autoHighlight?: boolean;
  /**
   * Auto Select. Whether the autocomplete automatically selects the highlighted option on blur.
   *
   * @default false
   */
  autoSelect?: boolean;
  /**
   * Blur On Select. Whether the autocomplete blurs the input when an option is selected.
   *
   * @default false
   */
  blurOnSelect?: boolean;
  /**
   * Clear On Escape. Whether the autocomplete clears the value when Escape is pressed while closed.
   *
   * @default false
   */
  clearOnEscape?: boolean;
  /**
   * Clear On Blur. Whether the autocomplete clears the input when the blur event is triggered.
   *
   * @default undefined
   */
  clearOnBlur?: boolean;
  /**
   * Filter Selected Options. Whether the autocomplete filters selected options.
   *
   * @default false
   */
  filterSelectedOptions?: boolean;
  /**
   * Disable Close On Select. Whether the autocomplete closes the dropdown when an option is selected.
   *
   * @default undefined
   */
  disableCloseOnSelect?: boolean;
  /**
   * Disable Clearable. Whether the autocomplete is clearable.
   *
   * @default false
   */
  disableClearable?: boolean;
  /**
   * Limit Tags. The maximum number of tags to show before collapsing to "+N". `-1` shows all.
   *
   * @default -1
   */
  limitTags?: number;
  /**
   * Hide Label. Whether the label is hidden.
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Placeholder. The placeholder of the autocomplete.
   *
   * @default "Search…"
   */
  placeholder?: string;
  /**
   * Size. The size of the autocomplete.
   *
   * @default "medium"
   */
  size?: AutocompleteSize;
  /**
   * Color. The color of the autocomplete.
   *
   * @default "primary"
   */
  color?: AutocompleteColor;
  /**
   * Error. Whether the autocomplete has an error.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Full Width. Whether the autocomplete is full width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Loading. Whether the autocomplete is loading.
   *
   * @default false
   */
  loading?: boolean;
  /**
   * Name. Renders a hidden input per selected option for form submission.
   *
   * @default undefined
   */
  name?: string;
  /**
   * No Options Text. The text to display when there are no options.
   *
   * @default "No results"
   */
  noOptionsText?: string;
  /**
   * Loading Text. The text to display when the autocomplete is loading.
   *
   * @default "Loading…"
   */
  loadingText?: string;
  /**
   * Clear Text. The accessible name of the clear button.
   *
   * @default "Clear"
   */
  clearText?: string;
  /**
   * Open Text. The accessible name of the toggle button while closed.
   *
   * @default "Open options"
   */
  openText?: string;
  /**
   * Close Text. The accessible name of the toggle button while open.
   *
   * @default "Close options"
   */
  closeText?: string;
  /**
   * Width of the dropdown panel. It is never narrower than the field; this is for the case where the options need more room than the input has.
   *
   * @default undefined
   */
  popupWidth?: number | string;
  /**
   * Id. The id of the autocomplete's input; also derives the label/helper ids.
   *
   * @default undefined
   */
  id?: string;
}
