import { computed, ref, useId, watch, type ComputedRef, type Ref } from "vue";
import { useControllableState } from "./useControllableState";
import {
  defaultFilterOptions,
  defaultGetOptionLabel,
  findNextEnabledIndex,
  groupOptions,
  normalizeMultipleValue,
  normalizeSingleValue,
  type AutocompleteOption,
  type OptionGroup,
  type SelectionChangeHandler,
} from "./useAutocomplete.utils";

export type {
  AutocompleteOption,
  OptionGroup,
  SelectionChangeDetails,
  SelectionChangeHandler,
  SelectionChangeReason,
} from "./useAutocomplete.utils";

export interface UseAutocompleteOptions<T = AutocompleteOption> {
  options: T[];
  value?: T | T[] | null;
  defaultValue?: T | T[] | null;
  inputValue?: string;
  defaultInputValue?: string;
  onChange?: SelectionChangeHandler<T, T | T[] | null>;
  onInputValueChange?: (value: string) => void;
  getOptionLabel?: (option: T) => string;
  filterOptions?: (
    options: T[],
    state: { inputValue: string; getOptionLabel: (option: T) => string },
  ) => T[];
  /**
   * Decides whether an option is the selected value. Defaults to comparing
   * `option.value` when present, else the rendered label — which silently
   * mis-selects duplicate labels, so pass a real comparator for object options.
   */
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /** Splits options into labelled groups. Reorders them so groups are contiguous. */
  groupBy?: (option: T) => string;
  multiple?: boolean;
  freeSolo?: boolean;
  disabled?: boolean;
  openOnFocus?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keeps the popup open after picking. Defaults to `true` for `multiple`. */
  disableCloseOnSelect?: boolean;
  /** Highlights the first row as you type, so Enter commits without arrowing. */
  autoHighlight?: boolean;
  /** Commits the highlighted option on blur. */
  autoSelect?: boolean;
  /** Blurs the input after a selection. */
  blurOnSelect?: boolean;
  /** Escape clears the value when the popup is already closed. */
  clearOnEscape?: boolean;
  /** Resets the input text on blur. Defaults to `true` unless `freeSolo`. */
  clearOnBlur?: boolean;
  /** Hides options that are already selected. Most useful with `multiple`. */
  filterSelectedOptions?: boolean;
  /** Removes the clear affordance; `clearAttrs` reports itself disabled. */
  disableClearable?: boolean;
}

export interface UseAutocompleteReturn<T = AutocompleteOption> {
  isOpen: ComputedRef<boolean>;
  setOpen: (open: boolean) => void;
  value: ComputedRef<T | T[] | null>;
  inputValue: ComputedRef<string>;
  /**
   * Options surviving the filter, in render order — reordered when `groupBy`
   * is set. Its indices are the ones `optionAttrs`/`optionEvents` and the
   * keyboard navigation use, so rendering in this order is what keeps arrow
   * keys honest.
   */
  filteredOptions: ComputedRef<T[]>;
  /** `null` unless `groupBy` is set. Carries indices into `filteredOptions`. */
  groupedOptions: ComputedRef<OptionGroup<T>[] | null>;
  highlightedIndex: Ref<number>;
  isSelected: (option: T) => boolean;
  getOptionLabel: (option: T) => string;
  /** Bind with `ref="…"` on the `<input>`. */
  inputRef: Ref<HTMLInputElement | null>;
  inputAttrs: ComputedRef<Record<string, unknown>>;
  inputEvents: Record<string, (event: Event) => void>;
  listboxAttrs: ComputedRef<Record<string, unknown>>;
  optionAttrs: (index: number) => Record<string, unknown>;
  optionEvents: (index: number) => Record<string, (event: Event) => void>;
  clearAttrs: ComputedRef<Record<string, unknown>>;
  clearEvents: Record<string, (event: MouseEvent) => void>;
  tagAttrs: (index: number) => Record<string, unknown>;
  tagEvents: (index: number) => Record<string, (event: KeyboardEvent) => void>;
  removeTag: (index: number, event?: Event | null) => void;
}

/**
 * Headless autocomplete/combobox — filter-as-you-type, multi-select tags,
 * grouping and free solo. The Vue port of `@okkly/react-hooks`'s
 * `useAutocomplete`, and what `Autocomplete` from `@okkly/vue` is built on.
 *
 * `options` is a getter, called fresh whenever the composable needs it, since
 * a `setup()` body — unlike a React hook's — runs only once rather than
 * every render.
 *
 * Unlike React's `getInputProps()`/`getOptionProps()`/… (JSX-spread
 * ergonomics templates don't need), this returns styles/attrs — `v-bind`-able
 * — separately from event listeners — `v-on`-able, keyed by bare native event
 * name — mirroring `useSlider`'s split. The input's controlled value is wired
 * to the native `input` event, not `change`.
 */
export function useAutocomplete<T = AutocompleteOption>(
  options: () => UseAutocompleteOptions<T>,
): UseAutocompleteReturn<T> {
  const listboxId = useId();
  const inputRef = ref<HTMLInputElement | null>(null);

  const { value: isOpen, setValue: setOpenState } = useControllableState<boolean>(() => ({
    value: options().open,
    defaultValue: false,
    onChange: options().onOpenChange,
  }));

  const { value: inputValue, setValue: setInputValue } = useControllableState<string>(() => ({
    value: options().inputValue,
    defaultValue: options().defaultInputValue ?? "",
    onChange: options().onInputValueChange,
  }));

  const { value: singleValue, setValue: setSingleValue } = useControllableState<T | null>(() => {
    const opts = options();
    return {
      value: opts.multiple
        ? undefined
        : opts.value === undefined
          ? undefined
          : normalizeSingleValue(opts.value),
      defaultValue: opts.multiple ? undefined : normalizeSingleValue(opts.defaultValue ?? null),
    };
  });

  const { value: multiValue, setValue: setMultiValue } = useControllableState<T[]>(() => {
    const opts = options();
    return {
      value: opts.multiple
        ? opts.value === undefined
          ? undefined
          : normalizeMultipleValue(opts.value)
        : undefined,
      defaultValue: opts.multiple ? normalizeMultipleValue(opts.defaultValue) : undefined,
    };
  });

  const value = computed<T | T[] | null>(() =>
    options().multiple ? multiValue.value : singleValue.value,
  );

  function getOptionLabel(option: T): string {
    return (options().getOptionLabel ?? defaultGetOptionLabel)(option);
  }

  function matches(option: T, candidate: T): boolean {
    const isOptionEqualToValue = options().isOptionEqualToValue;
    if (isOptionEqualToValue) return isOptionEqualToValue(option, candidate);
    if (
      typeof option === "object" &&
      option != null &&
      typeof candidate === "object" &&
      candidate != null &&
      "value" in option &&
      "value" in candidate
    ) {
      return Object.is(
        (option as { value: unknown }).value,
        (candidate as { value: unknown }).value,
      );
    }
    return getOptionLabel(option) === getOptionLabel(candidate);
  }

  function isOptionDisabled(option: T): boolean {
    if (option == null) return true;
    if (typeof option === "object" && "disabled" in option) {
      return Boolean((option as { disabled?: boolean }).disabled);
    }
    return false;
  }

  function isSelected(option: T): boolean {
    const opts = options();
    if (opts.multiple)
      return normalizeMultipleValue(value.value).some((item) => matches(option, item));
    return singleValue.value != null && matches(option, singleValue.value);
  }

  const filterResult = computed(() => {
    const opts = options();
    const filterFn = opts.filterOptions ?? defaultFilterOptions;
    let result = filterFn(opts.options, { inputValue: inputValue.value, getOptionLabel });
    if (opts.filterSelectedOptions) result = result.filter((option) => !isSelected(option));

    let groups: OptionGroup<T>[] | null = null;
    if (opts.groupBy) {
      const grouped = groupOptions(result, opts.groupBy);
      result = grouped.flat;
      groups = grouped.groups;
    }

    return { filteredOptions: result, groupedOptions: groups };
  });
  const filteredOptions = computed(() => filterResult.value.filteredOptions);
  const groupedOptions = computed(() => filterResult.value.groupedOptions);

  const highlightedIndex = ref(-1);

  watch(
    [isOpen, filteredOptions, () => options().autoHighlight],
    ([open, opts, autoHighlight]) => {
      if (!open) {
        highlightedIndex.value = -1;
        return;
      }
      highlightedIndex.value = autoHighlight
        ? findNextEnabledIndex(opts, -1, 1, isOptionDisabled)
        : -1;
    },
    { immediate: true },
  );

  function setOpen(open: boolean) {
    if (options().disabled) return;
    setOpenState(open);
  }

  const applyInputValue = setInputValue;

  function selectOption(event: Event | null, index: number) {
    const opts = options();
    const option = filteredOptions.value[index];
    if (option == null || isOptionDisabled(option)) return;

    const keepOpenOnSelect = opts.disableCloseOnSelect ?? opts.multiple ?? false;

    if (opts.multiple) {
      const current = normalizeMultipleValue(value.value);
      const exists = current.some((item) => matches(option, item));
      const next = exists ? current.filter((item) => !matches(option, item)) : [...current, option];
      setMultiValue(next);
      opts.onChange?.(event, next, exists ? "removeOption" : "selectOption", { option });
      applyInputValue("");
      if (!keepOpenOnSelect) setOpen(false);
    } else {
      setSingleValue(option);
      opts.onChange?.(event, option, "selectOption", { option });
      applyInputValue(getOptionLabel(option));
      if (!keepOpenOnSelect) setOpen(false);
    }

    if (opts.blurOnSelect) inputRef.value?.blur();
    else inputRef.value?.focus();
  }

  function clearValue(event: Event | null) {
    const opts = options();
    if (opts.disableClearable || opts.disabled) return;
    if (opts.multiple) {
      setMultiValue([]);
      opts.onChange?.(event, [], "clear");
    } else {
      setSingleValue(null);
      opts.onChange?.(event, null, "clear");
    }
    applyInputValue("");
    inputRef.value?.focus();
  }

  function removeTag(index: number, event: Event | null = null) {
    const opts = options();
    if (!opts.multiple) return;
    const current = normalizeMultipleValue(value.value);
    const option = current[index];
    const next = current.filter((_, i) => i !== index);
    setMultiValue(next);
    opts.onChange?.(event, next, "removeOption", { option });
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    const opts = options();
    if (opts.disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen.value) setOpen(true);
      else {
        highlightedIndex.value = findNextEnabledIndex(
          filteredOptions.value,
          highlightedIndex.value,
          1,
          isOptionDisabled,
        );
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen.value) setOpen(true);
      else {
        highlightedIndex.value = findNextEnabledIndex(
          filteredOptions.value,
          highlightedIndex.value,
          -1,
          isOptionDisabled,
        );
      }
      return;
    }

    if (event.key === "Enter") {
      if (isOpen.value && highlightedIndex.value >= 0) {
        event.preventDefault();
        selectOption(event, highlightedIndex.value);
        return;
      }
      if (opts.freeSolo && inputValue.value.trim()) {
        event.preventDefault();
        const solo = inputValue.value.trim() as unknown as T;
        if (opts.multiple) {
          const next = [...normalizeMultipleValue(value.value), solo];
          setMultiValue(next);
          opts.onChange?.(event, next, "createOption", { option: solo });
          applyInputValue("");
        } else {
          setSingleValue(solo);
          opts.onChange?.(event, solo, "createOption", { option: solo });
          setOpen(false);
        }
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (isOpen.value) {
        setOpen(false);
        return;
      }
      if (opts.clearOnEscape) clearValue(event);
      return;
    }

    if (event.key === "Backspace" && opts.multiple && !inputValue.value) {
      const current = normalizeMultipleValue(value.value);
      if (current.length > 0) removeTag(current.length - 1, event);
    }
  }

  function handleInputBlur(event: FocusEvent) {
    const opts = options();
    const shouldClearOnBlur = opts.clearOnBlur ?? !opts.freeSolo;

    if (opts.autoSelect && isOpen.value && highlightedIndex.value >= 0) {
      selectOption(event, highlightedIndex.value);
      return;
    }
    if (opts.freeSolo && !opts.multiple && inputValue.value.trim() && singleValue.value == null) {
      const solo = inputValue.value.trim() as unknown as T;
      setSingleValue(solo);
      opts.onChange?.(event, solo, "blur", { option: solo });
      return;
    }
    if (shouldClearOnBlur) {
      // Text that matched nothing would otherwise linger beside a value it
      // does not describe. A committed single value re-asserts its own label.
      if (!opts.multiple && singleValue.value != null)
        applyInputValue(getOptionLabel(singleValue.value));
      else if (inputValue.value) applyInputValue("");
    }
  }

  const inputAttrs = computed(() => {
    const opts = options();
    return {
      role: "combobox",
      "aria-expanded": isOpen.value,
      "aria-autocomplete": "list" as const,
      "aria-controls": listboxId,
      "aria-disabled": opts.disabled || undefined,
      "aria-activedescendant":
        isOpen.value && highlightedIndex.value >= 0
          ? `${listboxId}-option-${highlightedIndex.value}`
          : undefined,
      disabled: opts.disabled ?? false,
      value: inputValue.value,
    };
  });

  const inputEvents: Record<string, (event: Event) => void> = {
    input: (event) => {
      applyInputValue((event.target as HTMLInputElement).value);
      if (!isOpen.value) setOpen(true);
    },
    focus: () => {
      if (options().openOnFocus) setOpen(true);
    },
    blur: (event) => handleInputBlur(event as FocusEvent),
    keydown: (event) => handleInputKeyDown(event as KeyboardEvent),
  };

  const listboxAttrs = computed(() => ({
    id: listboxId,
    role: "listbox",
    "aria-multiselectable": options().multiple || undefined,
  }));

  function optionAttrs(index: number): Record<string, unknown> {
    const option = filteredOptions.value[index];
    const selected = option != null && isSelected(option);
    const optionDisabled = option != null && isOptionDisabled(option);
    return {
      "data-index": index,
      role: "option",
      id: `${listboxId}-option-${index}`,
      "aria-selected": selected,
      "aria-disabled": optionDisabled || undefined,
      tabindex: -1,
    };
  }

  function optionEvents(index: number): Record<string, (event: Event) => void> {
    return {
      mouseenter: () => {
        const option = filteredOptions.value[index];
        if (option != null && !isOptionDisabled(option)) highlightedIndex.value = index;
      },
      click: (event) => {
        const option = filteredOptions.value[index];
        if (option != null && isOptionDisabled(option)) return;
        selectOption(event, index);
      },
    };
  }

  const clearAttrs = computed(() => {
    const opts = options();
    const hasValue = opts.multiple
      ? normalizeMultipleValue(value.value).length > 0
      : singleValue.value != null || inputValue.value.length > 0;
    return {
      type: "button" as const,
      tabindex: -1,
      "aria-label": "Clear",
      disabled: opts.disabled || opts.disableClearable || !hasValue,
    };
  });

  const clearEvents: Record<string, (event: MouseEvent) => void> = {
    click: (event) => {
      if (options().disabled) return;
      clearValue(event);
    },
  };

  function tagAttrs(index: number): Record<string, unknown> {
    const tags = normalizeMultipleValue(value.value);
    const tag = tags[index];
    return {
      "data-index": index,
      "aria-label": tag ? getOptionLabel(tag) : undefined,
    };
  }

  function tagEvents(index: number): Record<string, (event: KeyboardEvent) => void> {
    return {
      keydown: (event) => {
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          removeTag(index, event);
        }
      },
    };
  }

  return {
    isOpen,
    setOpen,
    value,
    inputValue,
    filteredOptions,
    groupedOptions,
    highlightedIndex,
    isSelected,
    getOptionLabel,
    inputRef,
    inputAttrs,
    inputEvents,
    listboxAttrs,
    optionAttrs,
    optionEvents,
    clearAttrs,
    clearEvents,
    tagAttrs,
    tagEvents,
    removeTag,
  };
}
