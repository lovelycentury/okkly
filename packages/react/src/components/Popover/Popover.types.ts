import type { HTMLAttributes, ReactNode } from "react";
import type { OverlayCloseHandler, TransitionTimeoutWithAuto } from "../../types";
import type { PopperPlacement } from "../Popper/Popper.types";

export interface PopoverAnchorPosition {
  top: number;
  left: number;
}

/**
 * Props follow MUI's Popover API (https://mui.com/material-ui/api/popover/) as closely
 * as this design allows: `open`/`onClose`/`anchorEl`/`anchorPosition`/`placement`/
 * `children` match name-for-name, and `onClose` receives `(event, reason)`. Opens with
 * Grow (MUI Menu/Popover transition pattern). Deliberate gaps: no `sx`/`classes`/`slots`,
 * no Modal backdrop/scroll-lock, no `transformOrigin`/`marginThreshold` paper math
 * (Popper.js handles positioning).
 *
 * There is no backdrop to click, so a click anywhere outside the paper reports
 * `backdropClick` — from the caller's side it is the same "clicked away" gesture.
 */
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClose"> {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * On Close.
   *
   * @default undefined
   * @type {OverlayCloseHandler}
   */
  onClose?: OverlayCloseHandler;
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
   * @type {TransitionTimeoutWithAuto}
   */
  transitionDuration?: TransitionTimeoutWithAuto;
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
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Extra class on the paper surface.
   *
   * @default undefined
   * @type {string}
   */
  paperClassName?: string;
}
