# @okkly/design-system

## 0.4.1

### Patch Changes

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`44f650b`](https://github.com/lovelycentury/okkly/commit/44f650b551077474f0ccecf94885ca0556aff31a) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Fix the `ButtonGroup` menu being invisible when open: the group's `overflow: hidden` clipped the absolutely positioned dropdown. The end segments now round their own outer corners instead, so hover fills and focus rings still stay inside the pill.

## 0.4.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Box`, a layout primitive with MUI-style system props — spacing, flex layout, sizing, token colors and border — polymorphic through `as`. Every prop is responsive: per viewport breakpoint (`{ base: "column", md: "row" }`), and per container breakpoint through `@`-keys (`{ "@md": "row" }`), which answer to the nearest Box marked `container`. `@okkly/design-system` adds the 4px spacing scale from the Figma library (`--okkly-space-unit` and the `--okkly-space-<n>` steps), the `$container-breakpoints` scale and the Box styles. `@okkly/shared` is new: the framework-neutral half of the components — here Box's prop types and `resolveBoxSystemProps`, which turns the props into those styles — that every framework package shares.

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`cbed6f0`](https://github.com/lovelycentury/okkly/commit/cbed6f0b765ee06086798509a3e597227a51a076) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add corner-radius (`--okkly-radius-none` … `--okkly-radius-3xl`, `--okkly-radius-full`) and elevation (`--okkly-shadow-xs` … `--okkly-shadow-lg`) tokens, mirroring the `radius/*` variables and `shadow/*` effect styles of the Figma library.

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`1d72f7d`](https://github.com/lovelycentury/okkly/commit/1d72f7d3da20c163a399d2f2c17d4bf68619456b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Remove the unused required/optional marker utilities from the global styles: the `.okkly-required-marker`, `.okkly-optional-marker`, `.okkly-use-required` and `.okkly-use-optional` classes and the `--ON`/`--OFF` custom properties they set on `:root`. No component used them — fields mark themselves required through their own `__required` element — and their colors and fonts pointed at tokens that do not exist.

## 0.3.0

### Minor Changes

- [#241](https://github.com/lovelycentury/okkly/pull/241) [`13dcdcf`](https://github.com/lovelycentury/okkly/commit/13dcdcfc2950bcb3538d7a57f63a8ea9ddb4a04c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `Dialog` now opens and closes with a Grow transition — the same one `Tooltip`/`Popover` use — instead of snapping in and out, with the backdrop fading in alongside it. New `transitionDuration` prop (`"auto"` by default, matching MUI) controls the Grow's timeout. `Modal` stays mounted for the length of the exit shrink regardless of the caller's own `keepMounted`, the same way `Drawer` already does.

- [#241](https://github.com/lovelycentury/okkly/pull/241) [`5afd452`](https://github.com/lovelycentury/okkly/commit/5afd45246ae3f7a0da5d81f97366bae97f135af1) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `Drawer` gains `variant="persistent"` and `variant="permanent"` for an in-flow sidebar (no portal, no backdrop, no focus trap) alongside the existing `"temporary"` overlay — `persistent` toggles through `open`/`onClose` and collapses its own width/height instead of sliding off-screen, `permanent` is always shown. Added `SwipeableDrawer`, a `Drawer` that also opens on an edge swipe and closes on a drag of the open panel, tracking the gesture live. It can peek — `peekSize` keeps a strip on screen while closed, with a one-time discovery hint on mount (`disableDiscovery` to skip it) — and show a grab handle (`showHandle`, sized and placed with `handleLength`/`handleThickness`/`handlePosition`/`handleColor`); `handleDragOnly` restricts dragging to that handle. A `persistent` drawer also takes `mini` for a short view between closed and open (sized by `--okkly-drawer-mini-width`/`--okkly-drawer-mini-height`), and its content can read the drawer's state through the new `useDrawerState()` hook or the `okkly-drawer--mini` class.

## 0.2.0

### Minor Changes

- [#234](https://github.com/lovelycentury/okkly/pull/234) [`6e1c97a`](https://github.com/lovelycentury/okkly/commit/6e1c97aa57f2ab66c4d063032f9d941b67b44f51) Thanks [@lovelycentury](https://github.com/lovelycentury)! - TextField's `color` prop now accepts every accent color (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`), not just `primary`/`dante`.

## 0.1.1

### Patch Changes

- [#10](https://github.com/lovelycentury/okkly/pull/10) [`1d821e8`](https://github.com/lovelycentury/okkly/commit/1d821e8c1450d387a098dd56c5b2550cc6e4579c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Declare the cascade layer order in every layer-opening stylesheet, not just `styles/index.scss`.

  A bundler splits component CSS into chunks that load in arbitrary order, and a layer takes its position where it is first seen. When a chunk that opens `@layer okkly.component { … }` loaded before the ordering statement, `okkly.component` was registered ahead of `okkly.reset`, inverting the cascade so the reset outranked every component rule — the built Storybook showed a checked Checkbox with both the check and the indeterminate minus, because normalize's `svg { display: block }` beat the component's `svg { display: none }`.

## 0.1.0

### Minor Changes

- [#7](https://github.com/lovelycentury/okkly/pull/7) [`bb32660`](https://github.com/lovelycentury/okkly/commit/bb32660421d99ed3c7defd51525b4df67ca13cbe) Thanks [@lovelycentury](https://github.com/lovelycentury)! - First public release on npm.
