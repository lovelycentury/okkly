import type { DrawerProps } from "../Drawer/Drawer.types";

export type SwipeableDrawerHandlePosition = "start" | "center" | "end";

export type DragAxis = "x" | "y";

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
