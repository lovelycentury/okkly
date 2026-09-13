"use client";

import { forwardRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { iconX } from "@okkly/icons";
import "@okkly/design-system/components/Dialog/Dialog.scss";
import { Modal } from "../Modal/Modal";
import { Grow } from "../Grow/Grow";

import type {
  DialogProps,
  DialogTitleProps,
  DialogContentProps,
  DialogActionsProps,
  DialogCloseProps,
} from "./Dialog.types";

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
