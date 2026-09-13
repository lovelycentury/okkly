"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type Ref,
} from "react";
import "@okkly/design-system/components/Tooltip/Tooltip.scss";
import { useForkRef } from "@okkly/react-hooks";
import { mergeClassNames } from "../../helpers";
import { Grow } from "../Grow/Grow";
import { Popper } from "../Popper/Popper";

import type { TooltipProps } from "./Tooltip.types";

/** Keeps the arrow clear of a rounded corner. */
const ARROW_PADDING = 8;

/**
 * Grace period for reaching an interactive tooltip.
 *
 * The bubble is offset a few pixels off its anchor, and that gap belongs to
 * neither of them — leaving the trigger to walk into the tooltip still fires
 * `mouseleave`. With the default `leaveDelay` of 0 the close timer fires on the
 * next tick, long before a pointer can cross, so an interactive tooltip would
 * be unreachable. This is the floor that makes the trip possible; entering the
 * bubble cancels the timer.
 */
const INTERACTIVE_LEAVE_DELAY = 120;

export function Tooltip({
  title,
  children,
  placement = "top",
  open,
  defaultOpen = false,
  onOpen,
  onClose,
  enterDelay = 200,
  leaveDelay = 0,
  arrow = true,
  disableHoverListener = false,
  disableFocusListener = false,
  interactive = true,
  describeChild = false,
  transitionDuration = "auto",
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [arrowEl, setArrowEl] = useState<HTMLElement | null>(null);

  const isControlled = open !== undefined;
  const isOpen = (isControlled ? open : internalOpen) && Boolean(title);

  const childRef = (children as { ref?: Ref<HTMLElement> }).ref;
  const handleTriggerRef = useForkRef(setAnchorEl, childRef);

  const clearTimers = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      if (next) onOpen?.();
      else onClose?.();
    },
    [isControlled, onClose, onOpen],
  );

  const scheduleOpen = useCallback(() => {
    clearTimers();
    enterTimer.current = setTimeout(() => setOpen(true), enterDelay);
  }, [clearTimers, enterDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    const delay = interactive ? Math.max(leaveDelay, INTERACTIVE_LEAVE_DELAY) : leaveDelay;
    leaveTimer.current = setTimeout(() => setOpen(false), delay);
  }, [clearTimers, interactive, leaveDelay, setOpen]);

  useEffect(() => clearTimers, [clearTimers]);

  const childAriaLabel = (children.props as { "aria-label"?: string })["aria-label"];
  // A description is not a name. An icon button whose only label is its tooltip was
  // announced as a bare "button", because `aria-describedby` is all this used to
  // contribute — and only while open at that. So: when the trigger has a name of its
  // own, the tooltip stays a description; when it has none, the tooltip becomes the
  // name, permanently rather than on hover.
  //
  // MUI takes the blunter route and labels the child whenever `title` is a string,
  // overwriting whatever the button already said. That breaks "label in name" for
  // anyone driving the page by voice — they read the visible word and say it, and it
  // is not the accessible name. Hence the check rather than the blanket rule.
  //
  // `anchorEl` is null on the first render, so a text trigger is briefly treated as
  // nameless; the ref lands in the same commit and the tree is correct before
  // anything can read it.
  const triggerHasOwnName = Boolean(childAriaLabel) || Boolean(anchorEl?.textContent?.trim());
  const namingProps: Record<string, string | undefined> =
    describeChild || triggerHasOwnName
      ? { "aria-describedby": isOpen ? tooltipId : undefined }
      : typeof title === "string"
        ? { "aria-label": title }
        : { "aria-labelledby": isOpen ? tooltipId : undefined };

  const trigger = cloneElement(children, {
    ref: handleTriggerRef,
    className: mergeClassNames("okkly-tooltip__trigger", children.props.className),
    ...namingProps,
    onMouseEnter: (event: MouseEvent) => {
      if (!disableHoverListener) scheduleOpen();
      children.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: MouseEvent) => {
      if (!disableHoverListener) scheduleClose();
      children.props.onMouseLeave?.(event);
    },
    onFocus: (event: FocusEvent) => {
      if (!disableFocusListener) setOpen(true);
      children.props.onFocus?.(event);
    },
    onBlur: (event: FocusEvent) => {
      if (!disableFocusListener) setOpen(false);
      children.props.onBlur?.(event);
    },
  });

  return (
    <>
      {trigger}
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement={placement}
        transition
        role="presentation"
        className={mergeClassNames(
          "okkly-tooltip",
          interactive && "okkly-tooltip--interactive",
          className,
        )}
        modifiers={[
          { name: "offset", options: { offset: [0, arrow ? 10 : 6] } },
          ...(arrow && arrowEl
            ? [{ name: "arrow", options: { element: arrowEl, padding: ARROW_PADDING } }]
            : []),
        ]}
        // Arriving in the tooltip cancels the pending close; leaving it starts
        // a new one. Without the first of these, a tooltip you reach for
        // vanishes exactly as you get there.
        onMouseEnter={interactive ? clearTimers : undefined}
        onMouseLeave={interactive ? scheduleClose : undefined}
      >
        {({ TransitionProps, placement: resolvedPlacement }) => (
          <Grow {...TransitionProps} timeout={transitionDuration}>
            <div
              className={mergeClassNames(
                "okkly-tooltip__popup",
                `okkly-tooltip__popup--${resolvedPlacement.split("-")[0]}`,
                !arrow && "okkly-tooltip__popup--no-arrow",
              )}
              // `data-popper-placement` is what the arrow's CSS keys off, so it
              // follows the side the tooltip actually landed on after a flip,
              // not the side originally requested.
              data-popper-placement={resolvedPlacement}
            >
              <span className="okkly-tooltip__bubble" role="tooltip" id={tooltipId}>
                {title}
              </span>
              {arrow && (
                <span
                  className="okkly-tooltip__arrow"
                  ref={setArrowEl}
                  data-popper-arrow=""
                  aria-hidden="true"
                />
              )}
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
}
