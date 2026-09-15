import type { ReactNode } from "react";

export type SegmentedToggleColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface SegmentedToggleItem {
  /** Segment text. */
  label?: ReactNode;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: ReactNode;
  /** Stable segment identifier passed to `value` / `onChange`. */
  value: string;
  disabled?: boolean;
}

/**
 * Props follow MUI's ToggleButtonGroup API
 * (https://mui.com/material-ui/api/toggle-button-group/) loosely:
 * `exclusive`/`disabled` match name-for-name (`exclusive` maps to MUI's
 * `exclusive` prop). Deliberate gaps/renames: segments come from an `items`
 * array with explicit `value` keys (not `children` composition), `color`
 * replaces MUI's `color` with okkly tone names, and there is no `orientation`
 * / `size` / `fullWidth` in this design.
 */
export interface SegmentedToggleProps {
  /**
   * Segment options.
   *
   * @default undefined
   * @type {SegmentedToggleItem[]}
   */
  items: SegmentedToggleItem[];
  /**
   * Selected value(s). `string` when `exclusive`, `string[]` when multi-select.
   *
   * @default undefined
   * @type {string | string[]}
   */
  value?: string | string[];
  /**
   * Initial selection (uncontrolled).
   *
   * @default undefined
   * @type {string | string[]}
   */
  defaultValue?: string | string[];
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string | string[]) => void}
   */
  onChange?: (value: string | string[]) => void;
  /**
   * When true (default), only one segment is active at a time.
   *
   * @default true
   * @type {boolean}
   */
  exclusive?: boolean;
  /**
   * Tone colour for the active segment (dante-ready).
   *
   * @default "primary"
   * @type {SegmentedToggleColor}
   */
  color?: SegmentedToggleColor;
  /**
   * Disables every segment.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
