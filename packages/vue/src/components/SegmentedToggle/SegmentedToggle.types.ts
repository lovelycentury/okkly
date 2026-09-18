export type SegmentedToggleColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Vue-forced difference from React's `SegmentedToggleItem`: `label` and
 * `icon` narrow from `ReactNode` to `string` — `icon` is raw SVG markup
 * (e.g. an `@okkly/icons` export), rendered the same way `Icon`'s own `icon`
 * prop is, rather than an arbitrary element. There is no slot equivalent
 * here since this whole object, not just one field of it, is a plain data
 * prop.
 */
export interface SegmentedToggleItem {
  /** Segment text. */
  label?: string;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: string;
  /** Stable segment identifier passed to `v-model`. */
  value: string;
  disabled?: boolean;
}

/**
 * Props follow MUI's ToggleButtonGroup API
 * (https://mui.com/material-ui/api/toggle-button-group/) loosely, mirroring
 * `@okkly/react`'s `<SegmentedToggle>` name-for-name: `exclusive`/`disabled`
 * match name-for-name (`exclusive` maps to MUI's `exclusive` prop).
 * Deliberate gaps/renames carried over from React: segments come from an
 * `items` array with explicit `value` keys (not `children` composition),
 * `color` replaces MUI's `color` with okkly tone names, and there is no
 * `orientation`/`size`/`fullWidth` in this design.
 *
 * Vue-forced difference: the controlled `value` + `onChange` pair becomes an
 * unnamed `defineModel<string | string[]>()`, so consumers can `v-model` it
 * — `v-model` is always typed that way regardless of `exclusive`: React
 * discriminates `onChange`'s signature on `exclusive` via a value that can
 * be either shape, which `defineProps` can't express either, so check
 * `exclusive` yourself if the branch matters. `defaultValue` still seeds it
 * once on mount when nothing is bound. `className` is dropped — a
 * consumer's `class` merges onto the root automatically.
 */
export interface SegmentedToggleProps {
  /**
   * Segment options.
   *
   * @default undefined
   */
  items: SegmentedToggleItem[];
  /**
   * Initial selection (uncontrolled).
   *
   * @default undefined
   */
  defaultValue?: string | string[];
  /**
   * When true (default), only one segment is active at a time.
   *
   * @default true
   */
  exclusive?: boolean;
  /**
   * Tone colour for the active segment (dante-ready).
   *
   * @default "primary"
   */
  color?: SegmentedToggleColor;
  /**
   * Disables every segment.
   *
   * @default false
   */
  disabled?: boolean;
}
