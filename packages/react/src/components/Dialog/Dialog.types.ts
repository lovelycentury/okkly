import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { ModalProps } from "../Modal/Modal.types";
import type { TransitionTimeoutWithAuto } from "../../types";

/** `false` removes the cap entirely, as in MUI. */
export type DialogMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | false;

/**
 * Built on `Modal`, which owns the portal, backdrop, focus trap and scroll
 * lock — exactly the split MUI draws. Dialog adds only the centred container
 * and the sized paper on top, and opens the paper with Grow (MUI's own
 * Dialog transition, and the same one `Tooltip`/`Popover` use) while the
 * backdrop fades in alongside it.
 *
 * Props follow MUI's Dialog API (https://mui.com/material-ui/api/dialog/) as closely as
 * this design allows: `open`/`onClose`/`fullWidth`/`maxWidth`/`fullScreen`/`children`
 * match name-for-name, the `Modal` pass-throughs (`keepMounted`, `container`,
 * `disableEscapeKeyDown`, …) are forwarded, and `onClose` receives `(event, reason)`
 * so a caller can tell a stray backdrop click from a deliberate Escape. Deliberate
 * gaps: no `sx`/`classes`, composition uses `DialogTitle`/`DialogContent`/
 * `DialogActions`/`DialogClose` subcomponents, simple focus trap (first focusable
 * only wraps Tab).
 */
export interface DialogProps extends Omit<ModalProps, "children"> {
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Max Width.
   *
   * @default "sm"
   * @type {DialogMaxWidth}
   */
  maxWidth?: DialogMaxWidth;
  /**
   * Full Screen.
   *
   * @default false
   * @type {boolean}
   */
  fullScreen?: boolean;
  /**
   * Grow timeout; `'auto'` like MUI.
   *
   * @default "auto"
   * @type {TransitionTimeoutWithAuto}
   */
  transitionDuration?: TransitionTimeoutWithAuto;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
