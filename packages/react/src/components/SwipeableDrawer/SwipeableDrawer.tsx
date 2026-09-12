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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Below this many pixels of travel, a press is a tap/click rather than a
// swipe — the gesture is dropped and the open state is left untouched, or a
// button under the user's thumb would "open"/"close" the drawer on every tap.
const MIN_DRAG_DISTANCE = 10;

type DragAxis = "x" | "y";

const axisFor = (anchor: DrawerAnchor): DragAxis =>
  anchor === "left" || anchor === "right" ? "x" : "y";

/** +1 when dragging toward increasing screen coordinates opens the drawer. */
const openSignFor = (anchor: DrawerAnchor): 1 | -1 => (anchor === "left" || anchor === "top" ? 1 : -1);

function coordFromEvent(event: MouseEvent | TouchEvent, axis: DragAxis): number {
  const point = "changedTouches" in event ? (event.touches[0] ?? event.changedTouches[0]) : event;
  if (!point) return 0;
  return axis === "x" ? point.clientX : point.clientY;
}

/**
 * `Drawer` plus an edge swipe to open it and a drag on the paper to close it,
 * both with the panel tracking the finger live rather than jumping once a
 * gesture completes.
 *
 * Props follow MUI's SwipeableDrawer API
 * (https://mui.com/material-ui/api/swipeable-drawer/) as closely as this
 * design allows: `open`/`onOpen`/`onClose`/`disableSwipeToOpen`/
 * `swipeAreaWidth` match name-for-name, and every other `Drawer` prop is
 * forwarded. Deliberate gaps: no `disableDiscovery`/`disableBackdropTransition`
 * — this has no discovery peek to begin with — and `variant` is fixed to
 * `"temporary"`, since `persistent`/`permanent` have nothing to swipe open
 * from (they are always in the layout).
 */
export interface SwipeableDrawerProps
  extends Omit<DrawerProps, "variant" | "dragProgress" | "onClose" | "keepMounted"> {
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
   * Disables the invisible edge strip that opens the drawer on a swipe from
   * the screen edge. Swiping an already-open drawer closed is unaffected.
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
  children,
  className,
  ...rest
}: SwipeableDrawerProps) {
  const axis = axisFor(anchor);
  const openSign = openSignFor(anchor);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dragProgress, setDragProgress] = useState<number | undefined>(undefined);

  // Whether the in-flight gesture opens (started closed) or closes (started
  // open) the drawer; the size and start point it is measured against; and
  // the touch identifier so a second finger landing mid-drag is ignored.
  const openingRef = useRef(false);
  const sizeRef = useRef(0);
  const startCoordRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);
  // A fling is measured over the *last* leg of the drag, not the whole
  // gesture from its start — the average over the full distance would call a
  // slow drag that happened to begin with one quick flick a fling, and would
  // call a fling made after a slow drag a slow release. Updated on every move.
  const lastMoveCoordRef = useRef(0);
  const lastMoveTimeRef = useRef(0);

  // `Drawer` renders the paper directly, so its rendered size — which is what
  // "fully open" means in pixels — is read off the DOM rather than threaded
  // through as a prop.
  const measurePaperSize = useCallback(() => {
    const paper = rootRef.current?.querySelector<HTMLElement>(".okkly-drawer__paper");
    if (!paper) return 0;
    return axis === "x" ? paper.offsetWidth : paper.offsetHeight;
  }, [axis]);

  const progressFromCoord = useCallback(
    (coord: number) => {
      const size = sizeRef.current || 1;
      const delta = ((coord - startCoordRef.current) * openSign) / size;
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
    [axis, hysteresis, minFlingVelocity, onClose, onOpen, openSign, progressFromCoord, stopListening],
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
      openingRef.current = opening;
      sizeRef.current = measurePaperSize();
      startCoordRef.current = coord;
      lastMoveCoordRef.current = coord;
      lastMoveTimeRef.current = performance.now();
      setDragProgress(opening ? 0 : 1);
    },
    [axis, measurePaperSize],
  );

  const handleEdgeMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => beginDrag(event, true);
  const handleEdgeTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => beginDrag(event, true);
  const handlePaperMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (open) beginDrag(event, false);
  };
  const handlePaperTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (open) beginDrag(event, false);
  };

  const classes = ["okkly-component", "okkly-swipeable-drawer", className].filter(Boolean).join(" ");
  const edgeStyle = {
    "--okkly-swipeable-drawer-edge-size": `${swipeAreaWidth}px`,
  } as CSSProperties;

  return (
    <>
      {!open && !disableSwipeToOpen && (
        <div
          className={`okkly-swipeable-drawer__edge okkly-swipeable-drawer__edge--${anchor}`}
          style={edgeStyle}
          onMouseDown={handleEdgeMouseDown}
          onTouchStart={handleEdgeTouchStart}
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
        keepMounted
        className={classes}
      >
        <div
          style={{ height: "100%" }}
          onMouseDown={handlePaperMouseDown}
          onTouchStart={handlePaperTouchStart}
        >
          {children}
        </div>
      </Drawer>
    </>
  );
}
