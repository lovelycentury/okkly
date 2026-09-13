import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";

/**
 * Props follow MUI's List API (https://mui.com/material-ui/api/list/) where they
 * overlap: `dense`, `disablePadding`, `subheader`, `children`. Deliberate gaps: no
 * `component` polymorphism (always `ul`), no `disableListWrap`.
 */
export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * Reduces vertical padding between items.
   *
   * @default false
   * @type {boolean}
   */
  dense?: boolean;
  /**
   * Removes outer list padding.
   *
   * @default false
   * @type {boolean}
   */
  disablePadding?: boolean;
  /**
   * Section label above the items.
   *
   * @default undefined
   * @type {ReactNode}
   */
  subheader?: ReactNode;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * Props follow MUI's ListItem API (https://mui.com/material-ui/api/list-item/) for
 * `selected`, `disabled`, `button`, `secondaryAction`, and the click surface.
 * Deliberate gaps: `alignItems`/`divider`/`disableGutters` are omitted; use
 * `startIcon` instead of a separate `ListItemAvatar` in v1.
 */
export interface ListItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "onClick"> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Highlights the row as active.
   *
   * @default false
   * @type {boolean}
   */
  selected?: boolean;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Makes the row keyboard-focusable with hover feedback.
   *
   * @default false
   * @type {boolean}
   */
  button?: boolean;
  /**
   * Leading icon or avatar slot.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startIcon?: ReactNode;
  /**
   * Trailing control (switch, badge, chevron, etc.).
   *
   * @default undefined
   * @type {ReactNode}
   */
  secondaryAction?: ReactNode;
  /**
   * Dense row padding.
   *
   * @default false
   * @type {boolean}
   */
  dense?: boolean;
  /**
   * On Click.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void}
   */
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

/**
 * Props follow MUI's ListItemText (primary/secondary slots).
 *
 * Every element here is a `span`, not the `div`/`p` you would reach for: an
 * interactive `ListItem` puts this inside a `<button>`, which only accepts
 * phrasing content, so block elements would be invalid markup the browser is
 * free to reparent.
 */
export interface ListItemTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Primary.
   *
   * @default undefined
   * @type {ReactNode}
   */
  primary?: ReactNode;
  /**
   * Secondary.
   *
   * @default undefined
   * @type {ReactNode}
   */
  secondary?: ReactNode;
}

/** Leading icon slot sized for list rows. */
export interface ListItemIconProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}
