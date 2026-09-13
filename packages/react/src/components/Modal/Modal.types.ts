import type { HTMLAttributes, ReactNode } from "react";
import type { OverlayCloseHandler } from "../../types";

export interface ModalSlotProps {
  /**
   * Backdrop.
   *
   * @default undefined
   * @type {HTMLAttributes<HTMLDivElement>}
   */
  backdrop?: HTMLAttributes<HTMLDivElement>;
}

/**
 * The low-level primitive the modal overlays are built from — Dialog today,
 * and anything else that needs "portal + backdrop + trapped focus" tomorrow.
 * Modal owns only that plumbing; it renders no surface of its own, so the
 * child supplies all visual chrome (see `Dialog` for the canonical consumer).
 *
 * Props follow MUI's Modal API (https://mui.com/material-ui/api/modal/) as
 * closely as this design allows: `open`/`onClose`/`container`/`keepMounted`/
 * `hideBackdrop`/`disablePortal`/`disableEscapeKeyDown`/`disableAutoFocus`/
 * `disableEnforceFocus`/`disableRestoreFocus`/`disableScrollLock`/`slotProps`
 * match name-for-name, and `onClose` receives `(event, reason)`. Deliberate
 * gaps: no `sx`/`classes`, no `slots` component-substitution (only
 * `slotProps`), no `closeAfterTransition` — with no built-in transition to
 * wait on, a consumer that animates keeps itself mounted (as `Dialog` and
 * `Drawer` do).
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
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
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Node the portal mounts into. Defaults to `document.body`.
   *
   * @default undefined
   * @type {Element | null}
   */
  container?: Element | null;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * Disable Escape Key Down.
   *
   * @default false
   * @type {boolean}
   */
  disableEscapeKeyDown?: boolean;
  /**
   * Disable Auto Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableAutoFocus?: boolean;
  /**
   * Disable Enforce Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableEnforceFocus?: boolean;
  /**
   * Disable Restore Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableRestoreFocus?: boolean;
  /**
   * Disable Scroll Lock.
   *
   * @default false
   * @type {boolean}
   */
  disableScrollLock?: boolean;
  /**
   * Hide Backdrop.
   *
   * @default false
   * @type {boolean}
   */
  hideBackdrop?: boolean;
  /**
   * Keep Mounted.
   *
   * @default false
   * @type {boolean}
   */
  keepMounted?: boolean;
  /**
   * Slot Props.
   *
   * @default undefined
   * @type {ModalSlotProps}
   */
  slotProps?: ModalSlotProps;
}
