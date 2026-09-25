---
"@okkly/design-system": patch
"@okkly/react": patch
"@okkly/angular": patch
"@okkly/vue": patch
---

Fix the `ButtonGroup` menu being invisible when open: the group's `overflow: hidden` clipped the absolutely positioned dropdown. The end segments now round their own outer corners instead, so hover fills and focus rings still stay inside the pill.
