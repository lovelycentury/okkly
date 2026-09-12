"use client";

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { iconX } from "@okkly/icons";
import "@okkly/design-system/components/Dialog/Dialog.scss";
import { Modal, type ModalProps } from "../Modal/Modal";
import { Grow } from "../Grow/Grow";
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

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    fullWidth = false,
    maxWidth = "sm",
    fullScreen = false,
    transitionDuration = "auto",
    keepMounted = false,
    children,
    className,
    ...rest
  },
  forwardedRef,
) {
  // Whether the paper's exit Grow has finished. Starts `true` unless the
  // dialog opens on first render, so a `Dialog` that never opens renders
  // nothing rather than a hidden one.
  const [exited, setExited] = useState(!open);

  const classes = [
    "okkly-dialog",
    !exited && "okkly-dialog--visible",
    fullWidth && "okkly-dialog--full-width",
    fullScreen && "okkly-dialog--full-screen",
    maxWidth !== false && `okkly-dialog--max-width-${maxWidth}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // The container stretches across the viewport *above* Modal's backdrop, so
  // it — not the backdrop — is what a click beside the paper actually lands
  // on. MUI resolves this the same way, by dismissing from the container.
  const handleContainerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    onClose?.(event, "backdropClick");
  };

  // Modal has no built-in transition and unmounts the instant `open` goes
  // false, which would cut the paper's shrink short. So Modal is always told
  // to stay mounted here, and this only lets go once the Grow has actually
  // finished — the caller's own `keepMounted` still decides what happens after.
  if (exited && !open && !keepMounted) return null;

  return (
    <Modal
      ref={forwardedRef}
      open={open}
      onClose={onClose}
      className={classes}
      keepMounted
      {...rest}
    >
      <div className="okkly-dialog__container" onClick={handleContainerClick}>
        <Grow
          in={open}
          appear
          timeout={transitionDuration}
          onEnter={() => setExited(false)}
          onExited={() => setExited(true)}
        >
          <div className="okkly-dialog__paper" role="dialog" aria-modal="true">
            {children}
          </div>
        </Grow>
      </div>
    </Modal>
  );
});

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { children, className, ...rest },
  forwardedRef,
) {
  const classes = ["okkly-dialog__title", className].filter(Boolean).join(" ");
  return (
    <h2 ref={forwardedRef} className={classes} {...rest}>
      {children}
    </h2>
  );
});

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { children, className, ...rest },
  forwardedRef,
) {
  const classes = ["okkly-dialog__content", className].filter(Boolean).join(" ");
  return (
    <div ref={forwardedRef} className={classes} {...rest}>
      {children}
    </div>
  );
});

export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(function DialogActions(
  { children, className, ...rest },
  forwardedRef,
) {
  const classes = ["okkly-dialog__actions", className].filter(Boolean).join(" ");
  return (
    <div ref={forwardedRef} className={classes} {...rest}>
      {children}
    </div>
  );
});

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { className, onClick, "aria-label": ariaLabel = "Close", ...rest },
  forwardedRef,
) {
  const classes = ["okkly-dialog__close", className].filter(Boolean).join(" ");

  return (
    <button
      ref={forwardedRef}
      type="button"
      className={classes}
      aria-label={ariaLabel}
      onClick={onClick}
      {...rest}
    >
      <span dangerouslySetInnerHTML={{ __html: iconX }} />
    </button>
  );
});
