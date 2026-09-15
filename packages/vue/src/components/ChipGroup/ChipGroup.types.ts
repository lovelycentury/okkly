export type ChipGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface ChipGroupItem {
  /** Chip label. */
  label: string;
  /** Selection value — defaults to the item index as a string. */
  value?: string;
  /** Selected state when the group's `v-model` is unset. */
  selected?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent | KeyboardEvent, item: ChipGroupItem) => void;
  onRemove?: (event: MouseEvent, item: ChipGroupItem) => void;
}

/**
 * Composes `Chip` children into a wrapping row for tags, filters, and
 * multi-value fields. Mirrors `@okkly/react`'s `<ChipGroup>` name-for-name.
 * Deliberate gaps vs MUI, carried over from React: no single MUI equivalent
 * — closest is a hand-built `ToggleButtonGroup` or free-form `Chip` list;
 * selection is driven by an `items` array + `v-model`, `exclusive` maps to
 * single-select filter mode.
 *
 * Vue-forced differences: `children` becomes the default slot — the escape
 * hatch for a fully custom chip tree, used when `items` is omitted. The
 * controlled `value` + `onChange` pair becomes an unnamed
 * `defineModel<string | string[]>()`, so consumers can `v-model` it —
 * `ChipGroupItem.label` is a plain `string` rather than `ReactNode`, since a
 * data array has no natural place for slot content. `ChipGroupItem.onClick`/
 * `onRemove` stay plain callback props exactly as in React, since they live
 * inside a data object rather than being props of a component instance.
 * Deliberate simplification: `role="group"` and each item's interactivity
 * are approximated from `exclusive`/whether the model is set/`item.onClick`
 * rather than React's `!!onChange` — Vue has no clean way for a component to
 * ask "did my caller attach a `v-model` listener," unlike checking a plain
 * prop in React.
 */
export interface ChipGroupProps {
  /**
   * Structured chips — preferred for controlled selection.
   *
   * @default undefined
   */
  items?: ChipGroupItem[];
  /**
   * Single-select mode. Default `false` for multi-filter usage.
   *
   * @default false
   */
  exclusive?: boolean;
  /**
   * Tone applied to selected chips.
   *
   * @default "primary"
   */
  color?: ChipGroupColor;
  /**
   * Disables every chip in the group.
   *
   * @default false
   */
  disabled?: boolean;
}
