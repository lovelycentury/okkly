import type { ReactNode } from "react";
import type { OptionGroup, SelectOption, SelectionChangeHandler } from "@okkly/react-hooks";
import type { FieldColor, FieldSize } from "../Field/Field.types";

export type SelectSize = FieldSize;
export type SelectColor = FieldColor;

export type { SelectOption };

/** What a row's `renderOption` is told about the row it is drawing. */
export interface SelectOptionState {
  /**
   * Whether this option is part of the current value.
   *
   * @default undefined
   * @type {boolean}
   */
  selected: boolean;
  /**
   * Whether this is the row the keyboard is on. Pointer hover sets it too, so
   * exactly one row is ever emphasised.
   *
   * @default undefined
   * @type {boolean}
   */
  highlighted: boolean;
  /**
   * Index into the flat option list — the same index space the keyboard
   * navigation uses.
   *
   * @default undefined
   * @type {number}
   */
  index: number;
  /**
   * Whether the option itself is disabled.
   *
   * @default undefined
   * @type {boolean}
   */
  disabled: boolean;
  /**
   * Whether the field is in multiple mode — the default row draws a checkbox
   * instead of a tick when it is.
   *
   * @default undefined
   * @type {boolean}
   */
  multiple: boolean;
  /**
   * The field's size, so a custom row can scale with it. The popup is portaled
   * and inherits nothing, which is why this is handed over explicitly.
   *
   * @default undefined
   * @type {SelectSize}
   */
  size: SelectSize;
}

/** Everything needed to rebuild the trigger. */
export interface SelectRenderInputParams<T = string> {
  /**
   * Props for the element that acts as the combobox, `ref` included. Spread
   * them on a single element or the field loses its role, its keyboard
   * handling and its label association. It must not be a `<button>`: removable
   * chips render buttons inside it.
   *
   * @default undefined
   * @type {*}
   */
  triggerProps: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.Ref<HTMLDivElement>;
    id: string;
    role?: string;
  };
  /**
   * The default trigger content — placeholder, label or chips, already
   * `renderValue`-aware. Use it as a starting point, or ignore it.
   *
   * @default undefined
   * @type {ReactNode}
   */
  value: ReactNode;
  /**
   * The currently selected options.
   *
   * @default undefined
   * @type {SelectOption<T>[]}
   */
  selected: SelectOption<T>[];
  /**
   * The clear button and the chevron. They are handed over rather than kept
   * outside, so a custom trigger decides where — or whether — they sit.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment: ReactNode;
  /**
   * State a custom trigger usually needs to reflect.
   *
   * @default undefined
   * @type {*}
   */
  state: {
    open: boolean;
    disabled: boolean;
    error: boolean;
    multiple: boolean;
    size: SelectSize;
    color: SelectColor;
  };
}

/** A group header plus the rows underneath it. */
export interface SelectRenderGroupParams<T = string> {
  /**
   * Stable key for the group — put it on the returned element.
   *
   * @default undefined
   * @type {string}
   */
  key: string;
  /**
   * The group's label, as returned by `groupBy`.
   *
   * @default undefined
   * @type {string}
   */
  label: string;
  /**
   * The group as the hook computed it, each option carrying its index into the
   * flat list.
   *
   * @default undefined
   * @type {OptionGroup<SelectOption<T>>}
   */
  group: OptionGroup<SelectOption<T>>;
  /**
   * The already-rendered rows of this group.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * Props follow MUI's Select API (https://mui.com/material-ui/api/select/) as
 * closely as this design allows: `value`/`onChange`/`multiple`/`disabled`/
 * `label`/`error`/`helperText`/`fullWidth`/`size`/`required`/`name`/
 * `renderValue` match name-for-name, and the Autocomplete-family additions
 * `groupBy`/`isOptionEqualToValue`/`limitTags`/`disableCloseOnSelect`/
 * `disableClearable`/`noOptionsText`/`loadingText` behave as they do there.
 *
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `native`/
 * `MenuProps`, and options are passed via `options` rather than `<MenuItem>`
 * children — `renderValue`, `renderOption` and `groupBy` cover what children
 * would otherwise be needed for.
 *
 * One intentional divergence: `onChange` is `(event, value, reason, details)`,
 * matching Autocomplete, instead of MUI Select's `(event, child)` with the
 * value hidden on `event.target.value`.
 */
export interface SelectProps<T = string> {
  /**
   * Options.
   *
   * @default undefined
   * @type {SelectOption<T>[]}
   */
  options: SelectOption<T>[];
  /**
   * Value.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  value?: T | T[] | null;
  /**
   * Default Value.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  defaultValue?: T | T[] | null;
  /**
   * Multiple.
   *
   * @default false
   * @type {boolean}
   */
  multiple?: boolean;
  /**
   * On Change.
   *
   * @default undefined
   * @type {SelectionChangeHandler<SelectOption<T>, T | T[] | null>}
   */
  onChange?: SelectionChangeHandler<SelectOption<T>, T | T[] | null>;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * On Open Change.
   *
   * @default undefined
   * @type {(open: boolean) => void}
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Hide Label.
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Placeholder.
   *
   * @default "Select…"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Size.
   *
   * @default "medium"
   * @type {SelectSize}
   */
  size?: SelectSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {SelectColor}
   */
  color?: SelectColor;
  /**
   * Error.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Helper Text.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Loading.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Emits hidden inputs so the value reaches a plain `<form>` submit.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Groups options under sticky headers; also reorders them so groups are contiguous.
   *
   * @default undefined
   * @type {(option: SelectOption<T>) => string}
   */
  groupBy?: (option: SelectOption<T>) => string;
  /**
   * Required when values are objects — the default compares with `Object.is`.
   *
   * @default undefined
   * @type {(option: SelectOption<T>, value: T) => boolean}
   */
  isOptionEqualToValue?: (option: SelectOption<T>, value: T) => boolean;
  /**
   * Chips shown before collapsing to "+N". `-1` shows all. Multi-select only.
   *
   * @default 2
   * @type {number}
   */
  limitTags?: number;
  /**
   * Disable Close On Select.
   *
   * @default undefined
   * @type {boolean}
   */
  disableCloseOnSelect?: boolean;
  /**
   * Disable Clearable.
   *
   * @default false
   * @type {boolean}
   */
  disableClearable?: boolean;
  /**
   * Replaces the whole trigger content. Receives the selected options.
   *
   * @default undefined
   * @type {(selected: SelectOption<T>[]) => ReactNode}
   */
  renderValue?: (selected: SelectOption<T>[]) => ReactNode;
  /**
   * Replaces one option row. `props` must be spread on a single `<li>` — they
   * carry the option role, the id `aria-activedescendant` points at, the state
   * modifiers and the pointer handlers. The row's key is applied for you, so
   * the object can be spread as-is.
   *
   * @default undefined
   * @type {(props: React.HTMLAttributes<HTMLLIElement>, option: SelectOption<T>, state: SelectOptionState) => ReactNode}
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: SelectOption<T>,
    state: SelectOptionState,
  ) => ReactNode;
  /**
   * Render Input. Rebuilds the trigger — its content and the adornments beside
   * it. The field shell around it (label, helper text, error, size) stays with
   * the component. `params.triggerProps` must be spread on one element.
   *
   * Prefer `renderValue` when only the text inside the trigger changes.
   *
   * @default undefined
   * @type {(params: SelectRenderInputParams<T>) => ReactNode}
   */
  renderInput?: (params: SelectRenderInputParams<T>) => ReactNode;
  /**
   * Render Group. Replaces a `groupBy` header and the list wrapping its rows.
   * The returned element must keep `children` inside a list container, since
   * they are `<li>`s.
   *
   * @default undefined
   * @type {(params: SelectRenderGroupParams<T>) => ReactNode}
   */
  renderGroup?: (params: SelectRenderGroupParams<T>) => ReactNode;
  /**
   * Render No Options. Replaces the empty-state row. Return an `<li>` — it is
   * rendered inside the listbox.
   *
   * @default undefined
   * @type {() => ReactNode}
   */
  renderNoOptions?: () => ReactNode;
  /**
   * Render Loading. Replaces the loading row. Return an `<li>`.
   *
   * @default undefined
   * @type {() => ReactNode}
   */
  renderLoading?: () => ReactNode;
  /**
   * No Options Text.
   *
   * @default "No options"
   * @type {ReactNode}
   */
  noOptionsText?: ReactNode;
  /**
   * Loading Text.
   *
   * @default "Loading…"
   * @type {ReactNode}
   */
  loadingText?: ReactNode;
  /**
   * Clear Text.
   *
   * @default "Clear"
   * @type {string}
   */
  clearText?: string;
  /**
   * Width of the dropdown panel. It is never narrower than the field; this is for the case where the options need more room than the trigger has.
   *
   * @default undefined
   * @type {number | string}
   */
  popupWidth?: number | string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}
