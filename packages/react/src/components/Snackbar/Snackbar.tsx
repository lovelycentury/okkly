"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import "@okkly/design-system/components/Snackbar/Snackbar.scss";
import { Alert } from "../Alert/Alert";
import { useEscapeKey } from "@okkly/react-hooks";
import type { SnackbarAnchorOrigin, SnackbarProps } from "./Snackbar.types";

const DEFAULT_ANCHOR: SnackbarAnchorOrigin = { vertical: "bottom", horizontal: "center" };

export function Snackbar({
  open,
  onClose,
  autoHideDuration = 4000,
  message,
  action,
  anchorOrigin = DEFAULT_ANCHOR,
  severity = "info",
  children,
  className,
}: SnackbarProps) {
  // Escape, the timer, and the dismiss button close it — but not a click
  // elsewhere on the page. A snackbar is non-modal: the user is meant to carry on
  // working, and tearing the message away on their next click takes the `action`
  // with it.
  useEscapeKey(() => onClose?.(), open && Boolean(onClose));

  useEffect(() => {
    if (!open || !onClose || autoHideDuration <= 0) return;
    const timer = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(timer);
  }, [autoHideDuration, onClose, open]);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  const classes = [
    "okkly-component",
    "okkly-snackbar",
    open && "okkly-snackbar--open",
    `okkly-snackbar--anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = children ?? message;

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={classes} role="presentation">
      <div className="okkly-snackbar__surface">
        {content ? (
          typeof content === "string" || typeof content === "number" ? (
            <Alert severity={severity} action={action} onClose={onClose ? handleClose : undefined}>
              {content}
            </Alert>
          ) : (
            content
          )
        ) : (
          action && <span className="okkly-snackbar__message">{action}</span>
        )}
      </div>
    </div>,
    document.body,
  );
}
