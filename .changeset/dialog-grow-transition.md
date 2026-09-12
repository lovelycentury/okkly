---
"@okkly/react": minor
"@okkly/design-system": minor
---

`Dialog` now opens and closes with a Grow transition — the same one `Tooltip`/`Popover` use — instead of snapping in and out, with the backdrop fading in alongside it. New `transitionDuration` prop (`"auto"` by default, matching MUI) controls the Grow's timeout. `Modal` stays mounted for the length of the exit shrink regardless of the caller's own `keepMounted`, the same way `Drawer` already does.
