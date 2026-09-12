---
"@okkly/react": minor
"@okkly/design-system": minor
---

`Drawer` gains `variant="persistent"` and `variant="permanent"` for an in-flow sidebar (no portal, no backdrop, no focus trap) alongside the existing `"temporary"` overlay — `persistent` toggles through `open`/`onClose` and collapses its own width/height instead of sliding off-screen, `permanent` is always shown. Added `SwipeableDrawer`, a `Drawer` that also opens on an edge swipe and closes on a drag of the open panel, tracking the gesture live. It can peek — `peekSize` keeps a strip on screen while closed, with a one-time discovery hint on mount (`disableDiscovery` to skip it) — and show a grab handle (`showHandle`, sized and placed with `handleLength`/`handleThickness`/`handlePosition`/`handleColor`); `handleDragOnly` restricts dragging to that handle. A `persistent` drawer also takes `mini` for a short view between closed and open (sized by `--okkly-drawer-mini-width`/`--okkly-drawer-mini-height`), and its content can read the drawer's state through the new `useDrawerState()` hook or the `okkly-drawer--mini` class.
