"use client";

import { forwardRef, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { VirtualElement } from "@popperjs/core";
import { useClickOutside, useEscapeKey } from "@okkly/react-hooks";
import "@okkly/design-system/components/Popover/Popover.scss";
import { mergeClassNames } from "../../helpers";

import { Grow } from "../Grow/Grow";
import { Popper } from "../Popper/Popper";
import type { PopperAnchorEl } from "../Popper/Popper.types";
import type { PopoverAnchorPosition, PopoverProps } from "./Popover.types";

function createVirtualAnchor(position: PopoverAnchorPosition): VirtualElement {
  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: position.top,
      left: position.left,
      bottom: position.top,
      right: position.left,
      x: position.left,
      y: position.top,
      toJSON: () => ({}),
    }),
  };
}

const OFFSET_MODIFIER = {
  name: "offset" as const,
  options: { offset: [0, 8] },
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    open,
    onClose,
    anchorEl,
    anchorPosition,
    placement = "bottom",
    transitionDuration = "auto",
    disablePortal = false,
    hideBackdrop = true,
    matchAnchorWidth = false,
    minWidth,
    children,
    className,
    paperClassName,
    ...rest
  },
  forwardedRef,
) {
  const paperRef = useRef<HTMLDivElement | null>(null);

  const resolvedAnchor = useMemo<PopperAnchorEl | undefined>(() => {
    if (anchorEl) return anchorEl;
    if (anchorPosition) return createVirtualAnchor(anchorPosition);
    return undefined;
  }, [anchorEl, anchorPosition]);

  useEscapeKey((event) => onClose?.(event, "escapeKeyDown"), open && Boolean(onClose));

  useClickOutside(
    paperRef,
    (event) => {
      // The anchor is not "outside". Click-outside listens on mousedown, which
      // fires before the anchor's own click, so without this a click on an open
      // popover's trigger closes it and the trigger's onClick immediately
      // toggles it back open — the popover appears frozen open. Letting the
      // anchor own its click makes the trigger a plain toggle again.
      if (anchorEl?.contains(event.target as Node)) return;
      onClose?.(event, "backdropClick");
    },
    open && Boolean(onClose) && hideBackdrop,
  );

  // In backdrop mode nothing under the popover is clickable, so the anchor
  // needs no special-casing: the click lands on the backdrop and dismisses.
  const backdrop =
    !hideBackdrop && open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="okkly-popover__backdrop"
            role="presentation"
            onClick={(event) => onClose?.(event, "backdropClick")}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {backdrop}
      <Popper
        ref={forwardedRef}
        open={open}
        anchorEl={resolvedAnchor}
        placement={placement}
        transition
        disablePortal={disablePortal}
        matchAnchorWidth={matchAnchorWidth}
        minWidth={minWidth}
        modifiers={[OFFSET_MODIFIER]}
        className={mergeClassNames("okkly-popover", open && "okkly-popover--open", className)}
        role="presentation"
        {...rest}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            timeout={transitionDuration}
            style={{ transformOrigin: "center top" }}
          >
            <div ref={paperRef} className={mergeClassNames("okkly-popover__paper", paperClassName)}>
              {children}
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
});
