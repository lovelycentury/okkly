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
  type ReactNode,
  type TransitionEvent,
} from "react";
import "@okkly/design-system/components/Drawer/Drawer.scss";
import { Modal, type ModalProps } from "../Modal/Modal";
import { useForkRef } from "@okkly/react-hooks";

export type DrawerAnchor = "left" | "right" | "top" | "bottom";

/**
 * `temporary` overlays the page through `Modal` (portal, backdrop, focus trap,
 * scroll lock) and slides fully off-screen when closed, unmounting once the
 * exit transition finishes (unless `keepMounted` is set). `persistent` and
 * `permanent` render in the normal document flow instead — no portal, no
 * backdrop, no focus trap — so they read as part of the page's own layout (a
 * sidebar), not a surface floating above it:
 *
 * - `persistent` toggles through `open`/`onClose` like `temporary`, but stays
 *   mounted always and collapses its own width/height to 0 rather than
 *   sliding off-screen, so it reclaims the layout space it was taking. With
 *   `mini`, an open one narrows to a short view instead of its full size.
 * - `permanent` ignores `open`/`onClose`/`keepMounted` entirely and is always
 *   shown at full size — the caller decides whether to render it at all (e.g.
 *   behind a breakpoint).
 */
export type DrawerVariant = "temporary" | "persistent" | "permanent";

/** What a drawer's content can read about the drawer it sits in. */
export interface DrawerState {
  open: boolean;
  mini: boolean;
  variant: DrawerVariant;
  anchor: DrawerAnchor;
}

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

/**
 * Built on `Modal` for the `temporary` variant, which owns the portal, backdrop,
 * focus trap, scroll lock and focus restoration — the same split `Dialog` uses.
 * `persistent`/`permanent` skip `Modal` altogether and render the anchored
 * paper directly in the flow (see `DrawerVariant`).
 *
 * Props follow MUI's Drawer API (https://mui.com/material-ui/api/drawer/) as
 * closely as this design allows: `open`/`onClose`/`anchor`/`children`/`variant`
 * match name-for-name, the `Modal` pass-throughs (`container`,
 * `disableEscapeKeyDown`, `disableScrollLock`, `hideBackdrop`, `slotProps`, …)
 * are forwarded for `temporary`, and `onClose` receives `(event, reason)`.
 * For a version that also opens and closes on an edge swipe, see
 * `SwipeableDrawer`.
 *
 * `keepMounted` behaves as it does in MUI, and only means anything for
 * `temporary` — the subtree stays in the DOM while closed. Note that
 * `temporary` keeps *itself* mounted for the length of the exit animation
 * regardless, because there is no `closeAfterTransition`: unmounting on the
 * same tick `open` flips would cut the slide short.
 */
export interface DrawerProps extends Omit<ModalProps, "children" | "open"> {
  /**
   * Open. Ignored by `variant="permanent"`, which is always shown.
   *
   * @default false
   * @type {boolean}
   */
  open?: boolean;
  /**
   * Anchor.
   *
   * @default "right"
   * @type {DrawerAnchor}
   */
  anchor?: DrawerAnchor;
  /**
   * Variant.
   *
   * @default "temporary"
   * @type {DrawerVariant}
   */
  variant?: DrawerVariant;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Live open/close progress (0 closed → 1 open) while a gesture is dragging
   * the paper, bypassing the normal transition. Internal — `SwipeableDrawer`
   * is the only intended caller; a plain `Drawer` has no reason to set it.
   * Only meaningful for `variant="temporary"`.
   *
   * @default undefined
   * @type {number}
   */
  dragProgress?: number;
  /**
   * Pixels of the closed paper left on screen instead of sliding it fully
   * away. Internal — `SwipeableDrawer` exposes it as its own `peekSize`.
   * Only meaningful for `variant="temporary"`.
   *
   * @default 0
   * @type {number}
   */
  peekSize?: number;
  /**
   * Short view for `variant="persistent"`: while open, narrow to
   * `--okkly-drawer-mini-width` (`--okkly-drawer-mini-height` for top/bottom)
   * instead of the full size. Closed stays closed. The paper keeps its full
   * size and is clipped toward the anchored edge; content can react through
   * the `okkly-drawer--mini` class or `useDrawerState()`. Ignored by the
   * other variants.
   *
   * @default false
   * @type {boolean}
   */
  mini?: boolean;
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
