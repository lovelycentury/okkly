"use client";

import { forwardRef, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import "@okkly/design-system/components/Modal/Modal.scss";
import { useBodyScrollLock, useEscapeKey, useFocusTrap, useForkRef } from "@okkly/react-hooks";

import type { ModalProps } from "./Modal.types";

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    children,
    container,
    disablePortal = false,
    disableEscapeKeyDown = false,
    disableAutoFocus = false,
    disableEnforceFocus = false,
    disableRestoreFocus = false,
    disableScrollLock = false,
    hideBackdrop = false,
    keepMounted = false,
    slotProps,
    className,
    ...rest
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(rootRef, forwardedRef);
  // Captured on the way in rather than read on the way out: by the time the
  // modal closes, focus lives inside the subtree that is about to disappear.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Declared ahead of `useFocusTrap` on purpose: effects run in declaration
  // order, so capturing any later would record the element the trap just
  // focused *inside* the modal instead of the trigger that opened it.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    return () => {
      if (disableRestoreFocus) return;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, disableRestoreFocus]);

  useEscapeKey(
    (event) => onClose?.(event, "escapeKeyDown"),
    open && !disableEscapeKeyDown && Boolean(onClose),
  );
  useFocusTrap(rootRef, open && !disableEnforceFocus, { autoFocus: !disableAutoFocus });
  useBodyScrollLock(open && !disableScrollLock);

  const classes = ["okkly-component", "okkly-modal", !open && "okkly-modal--hidden", className]
    .filter(Boolean)
    .join(" ");

  const {
    className: backdropClassName,
    onClick: backdropOnClick,
    ...backdropRest
  } = slotProps?.backdrop ?? {};

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    backdropOnClick?.(event);
    // A press that began inside the surface and merely *ended* on the backdrop
    // (drag-selecting text, releasing a slider) is not a dismissal gesture.
    if (event.target !== event.currentTarget) return;
    onClose?.(event, "backdropClick");
  };

  if (typeof document === "undefined") return null;
  if (!open && !keepMounted) return null;

  const content = (
    <div
      ref={handleRef}
      className={classes}
      role="presentation"
      aria-hidden={!open || undefined}
      {...rest}
    >
      {!hideBackdrop && (
        <div
          className={["okkly-modal__backdrop", backdropClassName].filter(Boolean).join(" ")}
          aria-hidden="true"
          onClick={handleBackdropClick}
          {...backdropRest}
        />
      )}
      {children}
    </div>
  );

  if (disablePortal) return content;
  return createPortal(content, container ?? document.body);
});
