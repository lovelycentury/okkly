"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import "@okkly/design-system/components/Drawer/Drawer.scss";
import { Modal } from "../Modal/Modal";
import { useForkRef } from "@okkly/react-hooks";
import type { DrawerAnchor, DrawerState, DrawerProps } from "./Drawer.types";

const DrawerStateContext = createContext<DrawerState | null>(null);

/**
 * The state of the enclosing `Drawer`, for content that renders differently
 * in the `mini` short view — icons with tooltips instead of labels, say. The
 * `okkly-drawer--mini` class on the drawer root covers the CSS-only case.
 */
export function useDrawerState(): DrawerState {
  const state = useContext(DrawerStateContext);
  if (!state) throw new Error("useDrawerState must be used within Drawer");
  return state;
}

/**
 * The paper's transform at a given point in an open/close drag, 0 (closed) → 1
 * (open). "Closed" is the peeking position when `peekSize` is set, so a drag
 * starts from — and springs back to — what is actually on screen.
 */
function dragTransform(anchor: DrawerAnchor, progress: number, peekSize: number): string {
  const closedFraction = 1 - Math.min(1, Math.max(0, progress));
  const percent = 100 * closedFraction;
  const pixels = peekSize * closedFraction;
  switch (anchor) {
    case "left":
      return `translateX(calc(${-percent}% + ${pixels}px))`;
    case "right":
      return `translateX(calc(${percent}% - ${pixels}px))`;
    case "top":
      return `translateY(calc(${-percent}% + ${pixels}px))`;
    case "bottom":
      return `translateY(calc(${percent}% - ${pixels}px))`;
  }
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open = false,
    onClose,
    anchor = "right",
    variant = "temporary",
    children,
    className,
    keepMounted = false,
    style,
    dragProgress,
    peekSize = 0,
    mini = false,
    container,
    disablePortal,
    disableEscapeKeyDown,
    disableAutoFocus,
    disableEnforceFocus,
    disableRestoreFocus,
    disableScrollLock,
    hideBackdrop,
    slotProps,
    ...rest
  },
  forwardedRef,
) {
  const isPermanent = variant === "permanent";
  const isTemporary = variant === "temporary";
  const isDragging = dragProgress !== undefined;

  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(rootRef, forwardedRef);
  const paperRef = useRef<HTMLDivElement>(null);

  // Only `temporary` needs mount choreography: `persistent`/`permanent` stay
  // in the flow (and in the DOM) the whole time, so a plain class toggle is
  // enough for their width/height transition to animate correctly. `temporary`
  // instead unmounts after closing, so opening it fresh has to commit the
  // off-screen position to a paint *before* the on-screen class lands, or the
  // transition has no starting point to animate from — the paper just snaps.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (!isTemporary || isDragging) return;
    if (open) {
      setMounted(true);
      let innerFrame = 0;
      const outerFrame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outerFrame);
        cancelAnimationFrame(innerFrame);
      };
    }
    setVisible(false);
  }, [open, isTemporary, isDragging]);

  const handleTemporaryTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!open) setMounted(false);
  };

  const isOpenClass = isPermanent || (isTemporary ? visible : open);
  const isMini = variant === "persistent" && open && mini;

  const drawerState = useMemo<DrawerState>(
    () => ({ open: isPermanent || open, mini: isMini, variant, anchor }),
    [isPermanent, open, isMini, variant, anchor],
  );

  const classes = [
    "okkly-drawer",
    isOpenClass && "okkly-drawer--open",
    isMini && "okkly-drawer--mini",
    `okkly-drawer--anchor-${anchor}`,
    `okkly-drawer--variant-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const paperStyle: CSSProperties | undefined = isDragging
    ? { transform: dragTransform(anchor, dragProgress, peekSize), transition: "none" }
    : undefined;
  // Read by the closed-state transform in Drawer.scss; unset keeps it at 0.
  const temporaryStyle: CSSProperties | undefined = peekSize
    ? ({ ...style, "--okkly-drawer-peek": `${peekSize}px` } as CSSProperties)
    : style;

  if (isPermanent) {
    return (
      <div
        ref={handleRef}
        className={["okkly-component", classes].join(" ")}
        style={style}
        {...rest}
      >
        <div className="okkly-drawer__paper">
          <DrawerStateContext.Provider value={drawerState}>{children}</DrawerStateContext.Provider>
        </div>
      </div>
    );
  }

  if (isTemporary) {
    if (!mounted && !keepMounted) return null;
    return (
      <Modal
        ref={handleRef}
        open={open || isDragging}
        onClose={onClose}
        container={container}
        disablePortal={disablePortal}
        disableEscapeKeyDown={disableEscapeKeyDown}
        disableAutoFocus={disableAutoFocus}
        disableEnforceFocus={disableEnforceFocus}
        disableRestoreFocus={disableRestoreFocus}
        disableScrollLock={disableScrollLock}
        hideBackdrop={hideBackdrop}
        slotProps={slotProps}
        // Always on, whatever the caller asked for: while the exit animation runs
        // `open` is already false, and without this Modal would return null and take
        // the sliding paper with it. The caller's own `keepMounted` is what decides
        // whether anything survives past the animation, above.
        keepMounted
        className={classes}
        style={temporaryStyle}
        {...rest}
      >
        <div
          ref={paperRef}
          className="okkly-drawer__paper"
          role="dialog"
          aria-modal="true"
          style={paperStyle}
          onTransitionEnd={handleTemporaryTransitionEnd}
        >
          <DrawerStateContext.Provider value={drawerState}>{children}</DrawerStateContext.Provider>
        </div>
      </Modal>
    );
  }

  // persistent — always mounted; its own width/height carries the animation.
  return (
    <div ref={handleRef} className={["okkly-component", classes].join(" ")} style={style} {...rest}>
      <div ref={paperRef} className="okkly-drawer__paper">
        <DrawerStateContext.Provider value={drawerState}>{children}</DrawerStateContext.Provider>
      </div>
    </div>
  );
});
