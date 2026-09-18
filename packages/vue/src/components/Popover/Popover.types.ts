import type { OverlayCloseReason } from "../../types";
import type { PopperPlacement } from "../Popper/Popper.types";

export interface PopoverAnchorPosition {
  top: number;
  left: number;
}

export type PopoverTransitionDuration = number | { enter?: number; exit?: number } | "auto";

/**
 * Props mirror `@okkly/react`'s `<Popover>` name-for-name, which in turn
 * follows MUI's Popover API (https://mui.com/material-ui/api/popover/) as
 * closely as this design allows: `open`/`anchorEl`/`anchorPosition`/
 * `placement`/`transitionDuration`/`disablePortal`/`hideBackdrop`/
 * `matchAnchorWidth`/`minWidth` match name-for-name, and closing reports
 * `(event, reason)`. Opens with the same scale+fade "Grow" animation MUI's
 * Menu/Popover use. Deliberate gaps: no `sx`/`classes`/`slots`, no Modal
 * backdrop/scroll-lock, no `transformOrigin`/`marginThreshold` paper math
 * (Popper.js handles positioning).
 *
 * There is no backdrop to click by default, so a click anywhere outside the
 * paper reports `backdropClick` — from the caller's side it is the same
 * "clicked away" gesture.
 *
 * Vue-forced differences:
 * - `children` becomes the default slot.
 * - `onClose` becomes the `close` emit, still carrying `(event, reason)`.
 * - `class` on the root falls through like any Vue component, but since this
 *   component has more than one root node (the optional backdrop sits beside
 *   the popper), it is applied explicitly rather than automatically — see
 *   `paperClassName` for the one that targets the surface instead.
 */
export interface PopoverProps {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * Anchor El.
   *
   * @default undefined
   * @type {HTMLElement | null}
   */
  anchorEl?: HTMLElement | null;
  /**
   * Anchor Position.
   *
   * @default undefined
   * @type {PopoverAnchorPosition}
   */
  anchorPosition?: PopoverAnchorPosition;
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {PopperPlacement}
   */
  placement?: PopperPlacement;
  /**
   * Grow timeout; defaults to `'auto'` like MUI.
   *
   * @default "auto"
   * @type {PopoverTransitionDuration}
   */
  transitionDuration?: PopoverTransitionDuration;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * MUI's Popover is a Modal: it always lays an invisible backdrop over the page, so a click anywhere dismisses it and never reaches what is beneath. Here that is opt-in, and the default is inverted from MUI's on purpose — this Popover is the surface behind Select, Autocomplete and the date fields, and a modal backdrop would swallow the very interactions those rely on. Pass `false` for the MUI behaviour on a standalone popover.
   *
   * @default true
   * @type {boolean}
   */
  hideBackdrop?: boolean;
  /**
   * Stretch the paper to the anchor's width — what a select-style panel wants.
   *
   * @default false
   * @type {boolean}
   */
  matchAnchorWidth?: boolean;
  /**
   * Floor for the paper's width. Useful with `matchAnchorWidth` on narrow anchors.
   *
   * @default undefined
   * @type {number | string}
   */
  minWidth?: number | string;
  /**
   * Extra class on the paper surface.
   *
   * @default undefined
   * @type {string}
   */
  paperClassName?: string;
}

export type { OverlayCloseReason };
