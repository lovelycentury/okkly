export type ButtonGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonGroupVariant = "primary" | "secondary";

/**
 * Vue-forced difference from React's `ButtonGroupItem`: `label` and `icon`
 * narrow from `ReactNode` to `string` — `icon` is raw SVG markup (e.g. an
 * `@okkly/icons` export), rendered the same way `Icon`'s own `icon` prop is,
 * rather than an arbitrary element. There is no slot equivalent here since
 * this whole object, not just one field of it, is a plain data prop.
 */
export interface ButtonGroupItem {
  /** Segment text. */
  label?: string;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ButtonGroupMenuItem {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * MUI's own "split button" recipe (https://mui.com/material-ui/react-button-group/#split-button)
 * — `ButtonGroup` + `Button` + `Menu` composed by the consumer — is folded
 * into this single component via `action`/`menu` instead, mirroring
 * `@okkly/react`'s `<ButtonGroup>` name-for-name: `action`/`variant`/`menu`/
 * `color`/`disabled`/`menuAriaLabel` all match. For a plain row of
 * independent toggle buttons, use `SegmentedToggle` — that's the dedicated
 * selection control (this component only ever renders one action).
 *
 * Vue-forced difference: `className` is dropped — a consumer's `class`
 * merges onto the root automatically.
 */
export interface ButtonGroupProps {
  /**
   * The main action: a one-click default, always visible.
   *
   * @default undefined
   */
  action: ButtonGroupItem;
  /**
   * Fill treatment.
   *
   * @default "primary"
   */
  variant?: ButtonGroupVariant;
  /**
   * Dropdown opened by the chevron — variants of `action`, not unrelated commands.
   *
   * @default []
   */
  menu?: ButtonGroupMenuItem[];
  /**
   * Tone colour (dante-ready).
   *
   * @default "primary"
   */
  color?: ButtonGroupColor;
  /**
   * Disables the whole split button.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Accessible name for the chevron toggle.
   *
   * @default "Open menu"
   */
  menuAriaLabel?: string;
}
