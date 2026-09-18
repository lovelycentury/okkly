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
 * design allows, mirroring `@okkly/react`'s `<SwipeableDrawer>`
 * name-for-name: `open`/`disableSwipeToOpen`/`swipeAreaWidth`/
 * `disableDiscovery` match name-for-name, and every other `Drawer` prop is
 * forwarded. Additions: `peekSize` and the `handle*` props. Deliberate
 * gaps: no `disableBackdropTransition`, and `variant` is fixed to
 * `"temporary"`, since `persistent`/`permanent` have nothing to swipe open
 * from (they are always in the layout).
 *
 * Vue-forced differences: `onOpen`/`onClose` become `open`/`close` emits.
 */
export interface SwipeableDrawerProps extends Omit<
  DrawerProps,
  "variant" | "dragProgress" | "peekSize" | "keepMounted"
> {
  /**
   * Open.
   *
   * @default undefined
   */
  open: boolean;
  /**
   * Disables opening on a swipe — from the edge strip, the peeking sliver or
   * the handle. Swiping an already-open drawer closed is unaffected.
   *
   * @default false
   */
  disableSwipeToOpen?: boolean;
  /**
   * Width of the edge strip, in pixels, that starts an opening swipe.
   *
   * @default 20
   */
  swipeAreaWidth?: number;
  /**
   * Fraction of the drawer's own size a drag has to cross before release
   * commits to the gesture's direction instead of springing back.
   *
   * @default 0.5
   */
  hysteresis?: number;
  /**
   * A fast-enough flick commits regardless of `hysteresis`, in pixels per
   * millisecond.
   *
   * @default 0.6
   */
  minFlingVelocity?: number;
  /**
   * Pixels of the closed drawer left on screen as a hint that it can be
   * swiped open. While peeking, the visible sliver itself starts an opening
   * drag too. `0` hides it fully.
   *
   * @default 0
   */
  peekSize?: number;
  /**
   * Skips the one-time hint played on mount when `peekSize` is set: the peek
   * slides out a little further than `peekSize`, then settles back.
   *
   * @default false
   */
  disableDiscovery?: boolean;
  /**
   * Shows a grab handle on the paper edge facing into the screen — the edge
   * still visible while peeking.
   *
   * @default false
   */
  showHandle?: boolean;
  /**
   * Only the handle starts a drag: the edge strip, the peeking sliver and the
   * open panel stop reacting. Useful when the panel scrolls or holds its own
   * draggable content. With `peekSize` at 0 the handle is off-screen while
   * closed, so this leaves no way to swipe it open.
   *
   * @default false
   */
  handleDragOnly?: boolean;
  /**
   * Handle length along its edge, in pixels.
   *
   * @default 32
   */
  handleLength?: number;
  /**
   * Handle thickness, in pixels.
   *
   * @default 4
   */
  handleThickness?: number;
  /**
   * Where the handle sits along its edge.
   *
   * @default "center"
   */
  handlePosition?: SwipeableDrawerHandlePosition;
  /**
   * Handle colour, any CSS colour value. Falls back to the strong border token.
   *
   * @default undefined
   */
  handleColor?: string;
}
