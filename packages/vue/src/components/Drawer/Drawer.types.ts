import type { ModalProps } from "../Modal/Modal.types";

export type DrawerAnchor = "left" | "right" | "top" | "bottom";

/**
 * `temporary` overlays the page through `Modal` (portal, backdrop, focus trap,
 * scroll lock) and slides fully off-screen when closed, unmounting once the
 * exit transition finishes (unless `keepMounted` is set). `persistent` and
 * `permanent` render in the normal document flow instead — no portal, no
 * backdrop, no focus trap — so they read as part of the page's own layout (a
 * sidebar), not a surface floating above it:
 *
 * - `persistent` toggles through `open`/the `close` emit like `temporary`,
 *   but stays mounted always and collapses its own width/height to 0 rather
 *   than sliding off-screen, so it reclaims the layout space it was taking.
 *   With `mini`, an open one narrows to a short view instead of its full size.
 * - `permanent` ignores `open`/the `close` emit/`keepMounted` entirely and is
 *   always shown at full size — the caller decides whether to render it at
 *   all (e.g. behind a breakpoint / `Only`).
 */
export type DrawerVariant = "temporary" | "persistent" | "permanent";

/** What a drawer's content can read about the drawer it sits in. */
export interface DrawerState {
  open: boolean;
  mini: boolean;
  variant: DrawerVariant;
  anchor: DrawerAnchor;
}

/**
 * Built on `Modal` for the `temporary` variant, which owns the portal, backdrop,
 * focus trap, scroll lock and focus restoration — the same split `Dialog` uses.
 * `persistent`/`permanent` skip `Modal` altogether and render the anchored
 * paper directly in the flow (see `DrawerVariant`).
 *
 * Props follow MUI's Drawer API (https://mui.com/material-ui/api/drawer/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Drawer>`
 * name-for-name: `open`/`anchor`/`variant`/`dragProgress`/`peekSize`/`mini`
 * match name-for-name, and the `Modal` pass-throughs (`container`,
 * `disableEscapeKeyDown`, `disableScrollLock`, `hideBackdrop`, …) are
 * forwarded for `temporary`. For a version that also opens and closes on an
 * edge swipe, see `SwipeableDrawer`.
 *
 * `keepMounted` behaves as it does in MUI, and only means anything for
 * `temporary` — the subtree stays in the DOM while closed. Note that
 * `temporary` keeps *itself* mounted for the length of the exit animation
 * regardless, because there is no `closeAfterTransition`: unmounting on the
 * same tick `open` flips would cut the slide short.
 *
 * Vue-forced differences: `children` becomes the default slot. `onClose`
 * becomes the `close` emit, still carrying `(event, reason)`.
 */
export interface DrawerProps extends Omit<ModalProps, "open"> {
  /**
   * Open. Ignored by `variant="permanent"`, which is always shown.
   *
   * @default false
   */
  open?: boolean;
  /**
   * Anchor.
   *
   * @default "right"
   */
  anchor?: DrawerAnchor;
  /**
   * Variant.
   *
   * @default "temporary"
   */
  variant?: DrawerVariant;
  /**
   * Live open/close progress (0 closed → 1 open) while a gesture is dragging
   * the paper, bypassing the normal transition. Internal — `SwipeableDrawer`
   * is the only intended caller; a plain `Drawer` has no reason to set it.
   * Only meaningful for `variant="temporary"`.
   *
   * @default undefined
   */
  dragProgress?: number;
  /**
   * Pixels of the closed paper left on screen instead of sliding it fully
   * away. Internal — `SwipeableDrawer` exposes it as its own `peekSize`.
   * Only meaningful for `variant="temporary"`.
   *
   * @default 0
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
   */
  mini?: boolean;
}
