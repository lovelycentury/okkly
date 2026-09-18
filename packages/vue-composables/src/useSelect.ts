import { computed, ref, useId, watch, type ComputedRef, type Ref } from "vue";
import { useControllableState } from "./useControllableState";
import {
  findNextEnabledIndex,
  groupOptions,
  normalizeMultipleValue,
  normalizeSingleValue,
  type OptionGroup,
  type SelectionChangeHandler,
} from "./useAutocomplete.utils";

export type {
  OptionGroup,
  SelectionChangeDetails,
  SelectionChangeHandler,
  SelectionChangeReason,
} from "./useAutocomplete.utils";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface UseSelectOptions<T = string> {
  options: SelectOption<T>[];
  value?: T | T[] | null;
  defaultValue?: T | T[] | null;
  multiple?: boolean;
  onChange?: SelectionChangeHandler<SelectOption<T>, T | T[] | null>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Decides whether an option corresponds to a selected value. The default
   * compares with `Object.is`, which is wrong the moment values are objects
   * rebuilt on each render — pass a comparator keyed on an id in that case.
   */
  isOptionEqualToValue?: (option: SelectOption<T>, value: T) => boolean;
  /** Splits options into labelled groups. Reorders them so groups are contiguous. */
  groupBy?: (option: SelectOption<T>) => string;
  /** Keeps the popup open after picking. Defaults to `true` for `multiple`. */
  disableCloseOnSelect?: boolean;
  /** Removes the clear affordance; `clearAttrs` reports itself disabled. */
  disableClearable?: boolean;
}

export interface UseSelectReturn<T = string> {
  isOpen: ComputedRef<boolean>;
  setOpen: (open: boolean) => void;
  value: ComputedRef<T | T[] | null>;
  setValue: (value: T | T[]) => void;
  /** Options in render order — reordered when `groupBy` is set. */
  flatOptions: ComputedRef<SelectOption<T>[]>;
  /** `null` unless `groupBy` is set. Carries indices into `flatOptions`. */
  groupedOptions: ComputedRef<OptionGroup<SelectOption<T>>[] | null>;
  /** Currently selected options, in the order they appear in `options`. */
  selectedOptions: ComputedRef<SelectOption<T>[]>;
  highlightedIndex: Ref<number>;
  isSelected: (option: SelectOption<T>) => boolean;
  removeValue: (event: Event | null, option: SelectOption<T>) => void;
  clear: (event: Event | null) => void;
  /** Bind with `ref="…"` on the trigger element. */
  triggerRef: Ref<HTMLElement | null>;
  triggerAttrs: ComputedRef<Record<string, unknown>>;
  triggerEvents: Record<string, (event: Event) => void>;
  listboxAttrs: ComputedRef<Record<string, unknown>>;
  optionAttrs: (index: number) => Record<string, unknown>;
  optionEvents: (index: number) => Record<string, (event: Event) => void>;
  clearAttrs: ComputedRef<Record<string, unknown>>;
  clearEvents: Record<string, (event: MouseEvent) => void>;
}

/**
 * Headless select/combobox state — keyboard navigation, typeahead, grouping,
 * single & multi value. The Vue port of `@okkly/react-hooks`'s `useSelect`,
 * and what `Select` from `@okkly/vue` is built on.
 *
 * `options` is a getter, called fresh whenever the composable needs it, since
 * a `setup()` body — unlike a React hook's — runs only once rather than
 * every render.
 *
 * Unlike React's `getTriggerProps()`/`getOptionProps()`/… (JSX-spread
 * ergonomics templates don't need), this returns attrs — `v-bind`-able —
 * separately from event listeners — `v-on`-able, keyed by bare native event
 * name — mirroring `useAutocomplete`'s split.
 */
export function useSelect<T = string>(options: () => UseSelectOptions<T>): UseSelectReturn<T> {
  const listboxId = useId();
  const triggerRef = ref<HTMLElement | null>(null);
  // Plain closure state, not a ref: neither field drives a render on its own,
  // only `highlightedIndex` (which it feeds into) does.
  let typeahead = { query: "", at: 0 };

  const { value: isOpen, setValue: setOpenState } = useControllableState<boolean>(() => ({
    value: options().open,
    defaultValue: false,
    onChange: options().onOpenChange,
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

  function matches(option: SelectOption<T>, candidate: T): boolean {
    const isOptionEqualToValue = options().isOptionEqualToValue;
    return isOptionEqualToValue
      ? isOptionEqualToValue(option, candidate)
      : Object.is(option.value, candidate);
  }

  const groupResult = computed(() => {
    const opts = options();
    if (!opts.groupBy) return { flatOptions: opts.options, groupedOptions: null };
    const { flat, groups } = groupOptions(opts.options, opts.groupBy);
    return { flatOptions: flat, groupedOptions: groups };
  });
  const flatOptions = computed(() => groupResult.value.flatOptions);
  const groupedOptions = computed(() => groupResult.value.groupedOptions);

  function isSelected(option: SelectOption<T>): boolean {
    const opts = options();
    if (opts.multiple)
      return normalizeMultipleValue(value.value).some((item) => matches(option, item));
    return singleValue.value != null && matches(option, singleValue.value);
  }

  const selectedOptions = computed(() => flatOptions.value.filter((option) => isSelected(option)));

  const highlightedIndex = ref(-1);

  watch(
    isOpen,
    (open) => {
      if (!open) {
        highlightedIndex.value = -1;
        return;
      }
      const firstSelected = flatOptions.value.findIndex((option) => isSelected(option));
      highlightedIndex.value =
        firstSelected >= 0
          ? firstSelected
          : findNextEnabledIndex(flatOptions.value, -1, 1, (option) => !!option.disabled);
    },
    { immediate: true },
  );

  function setOpen(open: boolean) {
    if (options().disabled) return;
    setOpenState(open);
  }

  function setValue(next: T | T[]) {
    if (options().multiple) setMultiValue(normalizeMultipleValue(next));
    else setSingleValue(normalizeSingleValue(next));
  }

  function selectOption(event: Event | null, index: number) {
    const opts = options();
    const option = flatOptions.value[index];
    if (!option || option.disabled) return;

    const keepOpenOnSelect = opts.disableCloseOnSelect ?? opts.multiple ?? false;

    if (opts.multiple) {
      const current = normalizeMultipleValue(value.value);
      const exists = current.some((item) => matches(option, item));
      const next = exists
        ? current.filter((item) => !matches(option, item))
        : [...current, option.value];
      setMultiValue(next);
      opts.onChange?.(event, next, exists ? "removeOption" : "selectOption", { option });
      if (!keepOpenOnSelect) setOpen(false);
      return;
    }

    setSingleValue(option.value);
    opts.onChange?.(event, option.value, "selectOption", { option });
    if (!keepOpenOnSelect) {
      setOpen(false);
      triggerRef.value?.focus();
    }
  }

  function removeValue(event: Event | null, option: SelectOption<T>) {
    const opts = options();
    if (!opts.multiple) {
      setSingleValue(null);
      opts.onChange?.(event, null, "removeOption", { option });
      return;
    }
    const next = normalizeMultipleValue(value.value).filter((item) => !matches(option, item));
    setMultiValue(next);
    opts.onChange?.(event, next, "removeOption", { option });
  }

  function clear(event: Event | null) {
    const opts = options();
    if (opts.disableClearable || opts.disabled) return;
    if (opts.multiple) {
      setMultiValue([]);
      opts.onChange?.(event, [], "clear");
      return;
    }
    setSingleValue(null);
    opts.onChange?.(event, null, "clear");
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    const opts = options();
    if (opts.disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen.value) {
        setOpen(true);
        return;
      }
      highlightedIndex.value = findNextEnabledIndex(
        flatOptions.value,
        highlightedIndex.value,
        1,
        (option) => !!option.disabled,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen.value) {
        setOpen(true);
        return;
      }
      highlightedIndex.value = findNextEnabledIndex(
        flatOptions.value,
        highlightedIndex.value,
        -1,
        (option) => !!option.disabled,
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen.value) {
        setOpen(true);
        return;
      }
      if (highlightedIndex.value >= 0) selectOption(event, highlightedIndex.value);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      highlightedIndex.value = findNextEnabledIndex(
        flatOptions.value,
        -1,
        1,
        (option) => !!option.disabled,
      );
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      highlightedIndex.value = findNextEnabledIndex(
        flatOptions.value,
        0,
        -1,
        (option) => !!option.disabled,
      );
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Native-select typeahead: keystrokes within 500ms accumulate into one
      // query ("pa" → Paris), and a pause starts a new one.
      const now = Date.now();
      const query = now - typeahead.at < 500 ? typeahead.query + event.key : event.key;
      typeahead = { query, at: now };

      if (!isOpen.value) setOpen(true);

      const needle = query.toLowerCase();
      const isMatch = (option: SelectOption<T>) =>
        !option.disabled && option.label.toLowerCase().startsWith(needle);

      // Search after the cursor first so repeating one letter cycles through
      // every option starting with it, then wrap to the top.
      const after = flatOptions.value.findIndex(
        (option, index) => index > highlightedIndex.value && isMatch(option),
      );
      const nextIndex = after >= 0 ? after : flatOptions.value.findIndex(isMatch);
      if (nextIndex >= 0) highlightedIndex.value = nextIndex;
    }
  }

  const triggerAttrs = computed(() => {
    const opts = options();
    return {
      role: "combobox",
      "aria-expanded": isOpen.value,
      "aria-haspopup": "listbox" as const,
      "aria-controls": listboxId,
      "aria-disabled": opts.disabled || undefined,
      "aria-activedescendant":
        isOpen.value && highlightedIndex.value >= 0
          ? `${listboxId}-option-${highlightedIndex.value}`
          : undefined,
      tabindex: opts.disabled ? -1 : 0,
    };
  });

  const triggerEvents: Record<string, (event: Event) => void> = {
    click: (event) => {
      if (options().disabled || event.defaultPrevented) return;
      setOpen(!isOpen.value);
    },
    keydown: (event) => {
      if (event.defaultPrevented) return;
      handleTriggerKeyDown(event as KeyboardEvent);
    },
  };

  const listboxAttrs = computed(() => ({
    id: listboxId,
    role: "listbox",
    "aria-multiselectable": options().multiple || undefined,
  }));

  function optionAttrs(index: number): Record<string, unknown> {
    const option = flatOptions.value[index];
    const selected = option ? isSelected(option) : false;
    return {
      "data-index": index,
      role: "option",
      id: `${listboxId}-option-${index}`,
      "aria-selected": selected,
      "aria-disabled": option?.disabled || undefined,
      tabindex: -1,
    };
  }

  function optionEvents(index: number): Record<string, (event: Event) => void> {
    return {
      mouseenter: () => {
        const option = flatOptions.value[index];
        if (!option?.disabled) highlightedIndex.value = index;
      },
      click: (event) => {
        const option = flatOptions.value[index];
        if (event.defaultPrevented || option?.disabled) return;
        selectOption(event, index);
      },
    };
  }

  const clearAttrs = computed(() => {
    const opts = options();
    const hasValue = opts.multiple
      ? normalizeMultipleValue(value.value).length > 0
      : singleValue.value != null;
    return {
      type: "button" as const,
      tabindex: -1,
      disabled: opts.disabled || opts.disableClearable || !hasValue,
    };
  });

  const clearEvents: Record<string, (event: MouseEvent) => void> = {
    // Without this the trigger's click handler also fires and reopens the
    // popup the clear button just closed over.
    mousedown: (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    click: (event) => {
      if (event.defaultPrevented) return;
      event.stopPropagation();
      clear(event);
    },
  };

  return {
    isOpen,
    setOpen,
    value,
    setValue,
    flatOptions,
    groupedOptions,
    selectedOptions,
    highlightedIndex,
    isSelected,
    removeValue,
    clear,
    triggerRef,
    triggerAttrs,
    triggerEvents,
    listboxAttrs,
    optionAttrs,
    optionEvents,
    clearAttrs,
    clearEvents,
  };
}
