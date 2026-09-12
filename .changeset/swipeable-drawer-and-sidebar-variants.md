---
"@okkly/react": minor
"@okkly/design-system": minor
---

`Drawer` gains `variant="persistent"` and `variant="permanent"` for an in-flow sidebar (no portal, no backdrop, no focus trap) alongside the existing `"temporary"` overlay — `persistent` toggles through `open`/`onClose` and collapses its own width/height instead of sliding off-screen, `permanent` is always shown. Added `SwipeableDrawer`, a `Drawer` that also opens on an edge swipe and closes on a drag of the open panel, tracking the gesture live.
