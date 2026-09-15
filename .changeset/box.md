---
"@okkly/react": minor
"@okkly/design-system": minor
"@okkly/shared": minor
---

Add `Box`, a layout primitive with MUI-style system props — spacing, flex layout, sizing, token colors and border — polymorphic through `as`. Every prop is responsive: per viewport breakpoint (`{ base: "column", md: "row" }`), and per container breakpoint through `@`-keys (`{ "@md": "row" }`), which answer to the nearest Box marked `container`. `@okkly/design-system` adds the 4px spacing scale from the Figma library (`--okkly-space-unit` and the `--okkly-space-<n>` steps), the `$container-breakpoints` scale and the Box styles. `@okkly/shared` is new: the framework-neutral half of the components — here Box's prop types and `resolveBoxSystemProps`, which turns the props into those styles — that every framework package shares.
