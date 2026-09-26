/**
 * Selection primitives shared by `OkklySelect` and `OkklyAutocomplete` — the
 * counterpart of `@okkly/react-hooks`' `Selection`/`Select`/`Autocomplete`
 * modules, folded together here since this package has no headless-hooks
 * package of its own and both components own their state directly.
 */

/** One item in a `Select`/`Autocomplete` option list. */
export interface SelectOption {
  /** Submitted value and identity — compared with `Object.is`. */
  value: string;
  /** Visible text. */
  label: string;
  /** Non-selectable, skipped by keyboard navigation and typeahead. */
  disabled?: boolean;
}

/**
 * Why a selection changed. Mirrors MUI's Autocomplete `reason` values —
 * "user cleared the field" and "user deselected the last option" produce an
 * identical value, and this is what tells them apart.
 */
export type SelectionChangeReason = "selectOption" | "removeOption" | "clear" | "createOption";

/** Emitted by `change` — the value already landed in `[(value)]`; this carries why. */
export interface SelectionChangeEvent {
  value: string | string[] | null;
  reason: SelectionChangeReason;
  /** The option the interaction acted on. Absent for `clear`. */
  option?: SelectOption;
}

/** One rendered group when `groupBy` is supplied. */
export interface OptionGroup {
  key: string;
  label: string;
  /** Options in this group, each carrying its index into the flat option list. */
  options: { option: SelectOption; index: number }[];
}

/**
 * Reorders options so each group's members are contiguous, and returns both
 * the flat list (whose indices drive keyboard navigation and
 * `aria-activedescendant`) and the grouped view used for rendering. Keeping
 * one index space for both is what prevents arrow keys from skipping rows
 * once headers are interleaved.
 */
export function groupOptions(
  options: readonly SelectOption[],
  groupBy: (option: SelectOption) => string,
): { flat: SelectOption[]; groups: OptionGroup[] } {
  const buckets = new Map<string, SelectOption[]>();

  for (const option of options) {
    const key = groupBy(option);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(option);
    else buckets.set(key, [option]);
  }

  const flat: SelectOption[] = [];
  const groups: OptionGroup[] = [];

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

export function normalizeMultipleValue(value: string | string[] | null | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeSingleValue(value: string | string[] | null | undefined): string | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Next enabled option index, wrapping around; `-1` when every option is disabled. */
export function findNextEnabledIndex(
  options: readonly SelectOption[],
  start: number,
  direction: 1 | -1,
): number {
  const len = options.length;
  if (len === 0) return -1;
  let index = start;
  for (let i = 0; i < len; i += 1) {
    index = (index + direction + len) % len;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}
