"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import "@okkly/design-system/components/SwipeableDrawer/SwipeableDrawer.scss";
import { Drawer, type DrawerAnchor, type DrawerProps } from "../Drawer/Drawer";

export type SwipeableDrawerHandlePosition = "start" | "center" | "end";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Below this many pixels of travel, a press is a tap/click rather than a
// swipe — the gesture is dropped and the open state is left untouched, or a
// button under the user's thumb would "open"/"close" the drawer on every tap.
const MIN_DRAG_DISTANCE = 10;

// Discovery: the peek starts hidden, overshoots to this multiple of
// `peekSize` after a short delay, holds, then settles back to `peekSize`.
const DISCOVERY_DELAY_MS = 350;
const DISCOVERY_HOLD_MS = 400;
const DISCOVERY_OVERSHOOT = 1.6;

// Gap between the handle and the paper edge it sits on, and between the
// handle and the ends of that edge for `handlePosition` start/end.
const HANDLE_EDGE_INSET = 8;
const HANDLE_END_INSET = 16;

type DragAxis = "x" | "y";

const axisFor = (anchor: DrawerAnchor): DragAxis =>
  anchor === "left" || anchor === "right" ? "x" : "y";

/** +1 when dragging toward increasing screen coordinates opens the drawer. */
const openSignFor = (anchor: DrawerAnchor): 1 | -1 =>
  anchor === "left" || anchor === "top" ? 1 : -1;

function coordFromEvent(event: MouseEvent | TouchEvent, axis: DragAxis): number {
  const point = "changedTouches" in event ? (event.touches[0] ?? event.changedTouches[0]) : event;
  if (!point) return 0;
  return axis === "x" ? point.clientX : point.clientY;
}

/**
 * The handle sits on the paper edge *facing into* the screen — the one still
 * showing while the drawer peeks — so a bottom sheet's handle is at its top,
 * a left drawer's at its right. It runs along that edge.
 */
function handleStyle(
  anchor: DrawerAnchor,
  position: SwipeableDrawerHandlePosition,
  length: number,
  thickness: number,
  color: string | undefined,
): CSSProperties {
  const style: CSSProperties = color ? { background: color } : {};
  if (anchor === "top" || anchor === "bottom") {
    style.width = length;
    style.height = thickness;
    if (anchor === "bottom") style.top = HANDLE_EDGE_INSET;
    else style.bottom = HANDLE_EDGE_INSET;
    if (position === "start") style.left = HANDLE_END_INSET;
    else if (position === "end") style.right = HANDLE_END_INSET;
    else {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    }
  } else {
    style.width = thickness;
    style.height = length;
    if (anchor === "right") style.left = HANDLE_EDGE_INSET;
    else style.right = HANDLE_EDGE_INSET;
    if (position === "start") style.top = HANDLE_END_INSET;
    else if (position === "end") style.bottom = HANDLE_END_INSET;
    else {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    }
  }
  return style;
}

/**
 * `Drawer` plus an edge swipe to open it and a drag on the paper to close it,
 * both with the panel tracking the finger live rather than jumping once a
 * gesture completes. Optionally it peeks — a sliver stays on screen while
 * closed — and carries a grab handle.
 *
 * Props follow MUI's SwipeableDrawer API
 * (https://mui.com/material-ui/api/swipeable-drawer/) as closely as this
 * design allows: `open`/`onOpen`/`onClose`/`disableSwipeToOpen`/
 * `swipeAreaWidth`/`disableDiscovery` match name-for-name, and every other
 * `Drawer` prop is forwarded. Additions: `peekSize` and the `handle*` props.
 * Deliberate gaps: no `disableBackdropTransition`, and `variant` is fixed to
 * `"temporary"`, since `persistent`/`permanent` have nothing to swipe open
 * from (they are always in the layout).
 */
export interface SwipeableDrawerProps extends Omit<
  DrawerProps,
  "variant" | "dragProgress" | "peekSize" | "onClose" | "keepMounted"
> {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * Fires once a swipe (or the normal dismiss triggers) closes the drawer.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose: () => void;
  /**
   * Fires once an edge swipe drags the drawer past the open threshold.
   *
   * @default undefined
   * @type {() => void}
   */
  onOpen: () => void;
  /**
   * Disables opening on a swipe — from the edge strip, the peeking sliver or
   * the handle. Swiping an already-open drawer closed is unaffected.
   *
   * @default false
   * @type {boolean}
   */
  disableSwipeToOpen?: boolean;
  /**
   * Width of the edge strip, in pixels, that starts an opening swipe.
   *
   * @default 20
   * @type {number}
   */
  swipeAreaWidth?: number;
  /**
   * Fraction of the drawer's own size a drag has to cross before release
   * commits to the gesture's direction instead of springing back.
   *
   * @default 0.5
   * @type {number}
   */
  hysteresis?: number;
  /**
   * A fast-enough flick commits regardless of `hysteresis`, in pixels per
   * millisecond.
   *
   * @default 0.6
   * @type {number}
   */
  minFlingVelocity?: number;
  /**
   * Pixels of the closed drawer left on screen as a hint that it can be
   * swiped open. While peeking, the visible sliver itself starts an opening
   * drag too. `0` hides it fully.
   *
   * @default 0
   * @type {number}
   */
  peekSize?: number;
  /**
   * Skips the one-time hint played on mount when `peekSize` is set: the peek
   * slides out a little further than `peekSize`, then settles back.
   *
   * @default false
   * @type {boolean}
   */
  disableDiscovery?: boolean;
  /**
   * Shows a grab handle on the paper edge facing into the screen — the edge
   * still visible while peeking.
   *
   * @default false
   * @type {boolean}
   */
  showHandle?: boolean;
  /**
   * Only the handle starts a drag: the edge strip, the peeking sliver and the
   * open panel stop reacting. Useful when the panel scrolls or holds its own
   * draggable content. With `peekSize` at 0 the handle is off-screen while
   * closed, so this leaves no way to swipe it open.
   *
   * @default false
   * @type {boolean}
   */
  handleDragOnly?: boolean;
  /**
   * Handle length along its edge, in pixels.
   *
   * @default 32
   * @type {number}
   */
  handleLength?: number;
  /**
   * Handle thickness, in pixels.
   *
   * @default 4
   * @type {number}
   */
  handleThickness?: number;
  /**
   * Where the handle sits along its edge.
   *
   * @default "center"
   * @type {SwipeableDrawerHandlePosition}
   */
  handlePosition?: SwipeableDrawerHandlePosition;
  /**
   * Handle colour, any CSS colour value. Falls back to the strong border token.
   *
   * @default undefined
   * @type {string}
   */
  handleColor?: string;
}

export function SwipeableDrawer({
  open,
  onOpen,
  onClose,
  anchor = "right",
  disableSwipeToOpen = false,
  swipeAreaWidth = 20,
  hysteresis = 0.5,
  minFlingVelocity = 0.6,
  peekSize = 0,
  disableDiscovery = false,
  showHandle = false,
  handleDragOnly = false,
  handleLength = 32,
  handleThickness = 4,
  handlePosition = "center",
  handleColor,
  children,
  className,
  ...rest
}: SwipeableDrawerProps) {
  const axis = axisFor(anchor);
  const openSign = openSignFor(anchor);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dragProgress, setDragProgress] = useState<number | undefined>(undefined);

  // Discovery plays once, on mount, and only for a drawer that starts closed
  // and peeking. It is cut short by opening or by the user's own drag.
  const [discovering, setDiscovering] = useState(() => peekSize > 0 && !disableDiscovery && !open);
  const [overshooting, setOvershooting] = useState(false);

  useEffect(() => {
    if (!discovering) return;
    if (open) {
      setDiscovering(false);
      return;
    }
    const start = setTimeout(() => setOvershooting(true), DISCOVERY_DELAY_MS);
    const settle = setTimeout(() => {
      setOvershooting(false);
      setDiscovering(false);
    }, DISCOVERY_DELAY_MS + DISCOVERY_HOLD_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(settle);
    };
  }, [discovering, open]);

  const shownPeek = discovering ? (overshooting ? peekSize * DISCOVERY_OVERSHOOT : 0) : peekSize;

  // Whether the in-flight gesture opens (started closed) or closes (started
  // open) the drawer; the distance it travels and the point it started from;
  // and the touch identifier so a second finger landing mid-drag is ignored.
  const openingRef = useRef(false);
  const travelRef = useRef(0);
  const startCoordRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);
  // A fling is measured over the *last* leg of the drag, not the whole
  // gesture from its start — the average over the full distance would call a
  // slow drag that happened to begin with one quick flick a fling, and would
  // call a fling made after a slow drag a slow release. Updated on every move.
  const lastMoveCoordRef = useRef(0);
  const lastMoveTimeRef = useRef(0);

  // `Drawer` renders the paper directly, so its rendered size is read off the
  // DOM rather than threaded through as a prop. A peeking drawer travels only
  // what is not already showing, so the finger and the paper stay in step.
  const measureTravel = useCallback(() => {
    const paper = rootRef.current?.querySelector<HTMLElement>(".okkly-drawer__paper");
    if (!paper) return 1;
    const size = axis === "x" ? paper.offsetWidth : paper.offsetHeight;
    return Math.max(1, size - peekSize);
  }, [axis, peekSize]);

  const progressFromCoord = useCallback(
    (coord: number) => {
      const delta = ((coord - startCoordRef.current) * openSign) / travelRef.current;
      const base = openingRef.current ? 0 : 1;
      return clamp(base + delta, 0, 1);
    },
    [openSign],
  );

  // Refs holding the latest closures: `document` listeners are attached once
  // per gesture and must call into whichever render's `onOpen`/`onClose` is
  // current, not whatever they closed over when the listener was added.
  const handleMoveRef = useRef<(event: MouseEvent | TouchEvent) => void>(() => {});
  const handleEndRef = useRef<(event: MouseEvent | TouchEvent) => void>(() => {});

  const stopListening = useCallback(() => {
    document.removeEventListener("mousemove", handleMoveRef.current);
    document.removeEventListener("mouseup", handleEndRef.current);
    document.removeEventListener("touchmove", handleMoveRef.current);
    document.removeEventListener("touchend", handleEndRef.current);
    document.removeEventListener("touchcancel", handleEndRef.current);
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        const stillTracking = Array.from(event.touches).some(
          (touch) => touch.identifier === touchIdRef.current,
        );
        if (!stillTracking) return;
      }
      const coord = coordFromEvent(event, axis);
      setDragProgress(progressFromCoord(coord));
      lastMoveCoordRef.current = coord;
      lastMoveTimeRef.current = performance.now();
    },
    [axis, progressFromCoord],
  );

  const handleEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      stopListening();
      touchIdRef.current = null;
      setDragProgress(undefined);

      const coord = coordFromEvent(event, axis);
      const traveled = Math.abs(coord - startCoordRef.current);
      // A tap, not a swipe — leave the open state exactly as it was.
      if (traveled < MIN_DRAG_DISTANCE) return;

      const progress = progressFromCoord(coord);
      // Velocity of the release itself: from the last recorded move to this
      // release point, not averaged over the whole gesture from its start.
      const elapsedMs = Math.max(1, performance.now() - lastMoveTimeRef.current);
      const velocity = ((coord - lastMoveCoordRef.current) * openSign) / elapsedMs;

      const shouldOpen =
        velocity > minFlingVelocity
          ? true
          : velocity < -minFlingVelocity
            ? false
            : progress > hysteresis;

      if (shouldOpen) onOpen();
      else onClose();
    },
    [
      axis,
      hysteresis,
      minFlingVelocity,
      onClose,
      onOpen,
      openSign,
      progressFromCoord,
      stopListening,
    ],
  );

  handleMoveRef.current = handleMove;
  handleEndRef.current = handleEnd;

  useEffect(() => stopListening, [stopListening]);

  const beginDrag = useCallback(
    (event: ReactMouseEvent | ReactTouchEvent, opening: boolean) => {
      if ("button" in event && event.button !== 0) return;
      const nativeEvent = event.nativeEvent;
      let coord: number;
      if ("touches" in nativeEvent) {
        const touch = nativeEvent.touches[0];
        if (!touch) return;
        touchIdRef.current = touch.identifier;
        coord = axis === "x" ? touch.clientX : touch.clientY;
        document.addEventListener("touchmove", handleMoveRef.current, { passive: true });
        document.addEventListener("touchend", handleEndRef.current);
        document.addEventListener("touchcancel", handleEndRef.current);
      } else {
        coord = axis === "x" ? nativeEvent.clientX : nativeEvent.clientY;
        document.addEventListener("mousemove", handleMoveRef.current);
        document.addEventListener("mouseup", handleEndRef.current);
      }
      // The user has found the gesture on their own; no need to keep hinting.
      setDiscovering(false);
      setOvershooting(false);
      openingRef.current = opening;
      travelRef.current = measureTravel();
      startCoordRef.current = coord;
      lastMoveCoordRef.current = coord;
      lastMoveTimeRef.current = performance.now();
      setDragProgress(opening ? 0 : 1);
    },
    [axis, measureTravel],
  );

  // A mouse-only guard: left unprevented, a press-and-drag over the panel's
  // own text starts the browser's native text-selection drag. That selection
  // then swallows this gesture's own `mouseup` — even once it is released —
  // so a later drag from the same page never sees its release either. Touch
  // is unaffected; its default (scrolling) is handled by `touch-action` on
  // the edge/handle elements, and preventing it here on the panel would
  // block scrolling inside an open drawer's content instead.
  const suppressNativeDrag = (event: ReactMouseEvent | ReactTouchEvent) => {
    if ("button" in event) event.preventDefault();
  };

  // Three places can start a drag. The handle always can; the edge strip and
  // the panel (the peeking sliver while closed, all of it while open) step
  // aside when `handleDragOnly` is set.
  const startFromEdge = (event: ReactMouseEvent | ReactTouchEvent) => {
    suppressNativeDrag(event);
    if (handleDragOnly) return;
    beginDrag(event, true);
  };
  const startFromPanel = (event: ReactMouseEvent | ReactTouchEvent) => {
    suppressNativeDrag(event);
    if (handleDragOnly) return;
    if (open) beginDrag(event, false);
    else if (!disableSwipeToOpen) beginDrag(event, true);
  };
  const startFromHandle = (event: ReactMouseEvent | ReactTouchEvent) => {
    suppressNativeDrag(event);
    if (open) beginDrag(event, false);
    else if (!disableSwipeToOpen) beginDrag(event, true);
  };

  const classes = ["okkly-component", "okkly-swipeable-drawer", className]
    .filter(Boolean)
    .join(" ");
  const edgeStyle = {
    "--okkly-swipeable-drawer-edge-size": `${swipeAreaWidth}px`,
  } as CSSProperties;

  return (
    <>
      {!open && !disableSwipeToOpen && !handleDragOnly && (
        <div
          className={`okkly-swipeable-drawer__edge okkly-swipeable-drawer__edge--${anchor}`}
          style={edgeStyle}
          onMouseDown={startFromEdge}
          onTouchStart={startFromEdge}
          aria-hidden="true"
        />
      )}
      <Drawer
        {...rest}
        ref={rootRef}
        anchor={anchor}
        variant="temporary"
        open={open}
        onClose={onClose}
        dragProgress={dragProgress}
        peekSize={shownPeek}
        keepMounted
        className={classes}
      >
        {showHandle && (
          <div
            className="okkly-swipeable-drawer__handle"
            style={handleStyle(anchor, handlePosition, handleLength, handleThickness, handleColor)}
            onMouseDown={startFromHandle}
            onTouchStart={startFromHandle}
            aria-hidden="true"
          />
        )}
        <div style={{ height: "100%" }} onMouseDown={startFromPanel} onTouchStart={startFromPanel}>
          {children}
        </div>
      </Drawer>
    </>
  );
}
