export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Why a selection changed. Mirrors MUI's Autocomplete `reason` values, and is
 * the argument that makes "user cleared the field" distinguishable from "user
 * deselected the last option" — two events that produce an identical value.
 */
export type SelectionChangeReason =
  | "selectOption"
  | "removeOption"
  | "clear"
  | "blur"
  /**
   * Free text the user committed rather than an option they picked. There is
   * no "Add …" row to click — this is what `freeSolo` reports when Enter
   * commits whatever was typed, and it is the reason a handler needs in order
   * to tell a new value apart from one that came out of the list.
   */
  | "createOption";

export interface SelectionChangeDetails<T> {
  /** The option the interaction acted on. Absent for `clear`. */
  option?: T;
}

/**
 * `(event, value, reason, details)` — MUI's Autocomplete signature. `event`
 * is `null` for changes not driven by a DOM event.
 */
export type SelectionChangeHandler<TOption, TValue> = (
  event: Event | null,
  value: TValue,
  reason: SelectionChangeReason,
  details?: SelectionChangeDetails<TOption>,
) => void;

/** One rendered group when `groupBy` is supplied. */
export interface OptionGroup<T> {
  key: string;
  label: string;
  /** Options in this group, each carrying its index into the flat option list. */
  options: { option: T; index: number }[];
}

/**
 * Reorders options so each group's members are contiguous, and returns both
 * the flat list (whose indices drive keyboard navigation and
 * `aria-activedescendant`) and the grouped view used for rendering.
 *
 * Group order follows first appearance in `options`, so callers control it by
 * sorting their own data — same as MUI.
 */
export function groupOptions<T>(
  options: T[],
  groupBy: (option: T) => string,
): { flat: T[]; groups: OptionGroup<T>[] } {
  const buckets = new Map<string, T[]>();

  for (const option of options) {
    const key = groupBy(option);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(option);
    else buckets.set(key, [option]);
  }

  const flat: T[] = [];
  const groups: OptionGroup<T>[] = [];

  for (const [key, bucketOptions] of buckets) {
    groups.push({
      key,
      label: key,
      options: bucketOptions.map((option) => {
        const index = flat.length;
        flat.push(option);
        return { option, index };
      }),
    });
  }

  return { flat, groups };
}

export function defaultGetOptionLabel<T>(option: T): string {
  if (option == null) return "";
  if (typeof option === "string") return option;
  if (typeof option === "object" && "label" in option) {
    return String((option as { label: unknown }).label);
  }
  return String(option);
}

export function defaultFilterOptions<T>(
  options: T[],
  state: { inputValue: string; getOptionLabel: (option: T) => string },
): T[] {
  const query = state.inputValue.trim().toLowerCase();
  if (!query) return options;
  return options.filter((option) => state.getOptionLabel(option).toLowerCase().includes(query));
}

export function normalizeMultipleValue<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeSingleValue<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function findNextEnabledIndex<T>(
  options: T[],
  start: number,
  direction: 1 | -1,
  isDisabled: (option: T) => boolean,
): number {
  const len = options.length;
  if (len === 0) return -1;
  let index = start;
  for (let i = 0; i < len; i += 1) {
    index = (index + direction + len) % len;
    if (!isDisabled(options[index])) return index;
  }
  return -1;
}
