---
"@okkly/vue": minor
---

Add the transition family — `Fade`, `Grow`, `Zoom`, `Slide` and `Collapse` — mirroring `@okkly/react`'s components of the same names. Each takes a single default slot and an `in` boolean and animates it; `Popover`'s own scale+fade transition now reuses the same duration/easing helpers as `Grow` instead of duplicating them.
