# @okkly/react

## 0.4.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Box`, a layout primitive with MUI-style system props — spacing, flex layout, sizing, token colors and border — polymorphic through `as`. Every prop is responsive: per viewport breakpoint (`{ base: "column", md: "row" }`), and per container breakpoint through `@`-keys (`{ "@md": "row" }`), which answer to the nearest Box marked `container`. `@okkly/design-system` adds the 4px spacing scale from the Figma library (`--okkly-space-unit` and the `--okkly-space-<n>` steps), the `$container-breakpoints` scale and the Box styles. `@okkly/shared` is new: the framework-neutral half of the components — here Box's prop types and `resolveBoxSystemProps`, which turns the props into those styles — that every framework package shares.

### Patch Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `@okkly/shared` takes over `@okkly/helpers`: `bem`, `clamp`, `uniqueId` and `debounce` are exported from `@okkly/shared` with the same signatures, and `@okkly/helpers` is no longer published — import them from `@okkly/shared` instead. `uniqueId`'s default prefix is now `okkly` (it was `lokki`, from the project's former name). `@okkly/react` drops its unused dependency on `@okkly/helpers`.

- Updated dependencies [[`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae), [`cbed6f0`](https://github.com/lovelycentury/okkly/commit/cbed6f0b765ee06086798509a3e597227a51a076), [`1d72f7d`](https://github.com/lovelycentury/okkly/commit/1d72f7d3da20c163a399d2f2c17d4bf68619456b), [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376)]:
  - @okkly/design-system@0.4.0
  - @okkly/shared@0.1.0

## 0.3.1

### Patch Changes

- [#253](https://github.com/lovelycentury/okkly/pull/253) [`4df17ac`](https://github.com/lovelycentury/okkly/commit/4df17acfc340a61d1a99e47bd3215c7cc13b6120) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `TimePicker` (and so `DateTimePicker`) no longer commits the rows a wheel scrolls past while it animates to a value on its own — after a click, a keypress, an external `value` change, or a `format` switch. Switching `format` could previously fire a burst of `onChange` calls and, if the wheel re-measured mid-animation, leave the hour on the wrong value (e.g. 13:00 becoming 05:00 PM).

## 0.3.0

### Minor Changes

- [#241](https://github.com/lovelycentury/okkly/pull/241) [`13dcdcf`](https://github.com/lovelycentury/okkly/commit/13dcdcfc2950bcb3538d7a57f63a8ea9ddb4a04c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `Dialog` now opens and closes with a Grow transition — the same one `Tooltip`/`Popover` use — instead of snapping in and out, with the backdrop fading in alongside it. New `transitionDuration` prop (`"auto"` by default, matching MUI) controls the Grow's timeout. `Modal` stays mounted for the length of the exit shrink regardless of the caller's own `keepMounted`, the same way `Drawer` already does.

- [#241](https://github.com/lovelycentury/okkly/pull/241) [`5afd452`](https://github.com/lovelycentury/okkly/commit/5afd45246ae3f7a0da5d81f97366bae97f135af1) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `Drawer` gains `variant="persistent"` and `variant="permanent"` for an in-flow sidebar (no portal, no backdrop, no focus trap) alongside the existing `"temporary"` overlay — `persistent` toggles through `open`/`onClose` and collapses its own width/height instead of sliding off-screen, `permanent` is always shown. Added `SwipeableDrawer`, a `Drawer` that also opens on an edge swipe and closes on a drag of the open panel, tracking the gesture live. It can peek — `peekSize` keeps a strip on screen while closed, with a one-time discovery hint on mount (`disableDiscovery` to skip it) — and show a grab handle (`showHandle`, sized and placed with `handleLength`/`handleThickness`/`handlePosition`/`handleColor`); `handleDragOnly` restricts dragging to that handle. A `persistent` drawer also takes `mini` for a short view between closed and open (sized by `--okkly-drawer-mini-width`/`--okkly-drawer-mini-height`), and its content can read the drawer's state through the new `useDrawerState()` hook or the `okkly-drawer--mini` class.

### Patch Changes

- Updated dependencies [[`13dcdcf`](https://github.com/lovelycentury/okkly/commit/13dcdcfc2950bcb3538d7a57f63a8ea9ddb4a04c), [`5afd452`](https://github.com/lovelycentury/okkly/commit/5afd45246ae3f7a0da5d81f97366bae97f135af1)]:
  - @okkly/design-system@0.3.0

## 0.2.0

### Minor Changes

- [#234](https://github.com/lovelycentury/okkly/pull/234) [`6e1c97a`](https://github.com/lovelycentury/okkly/commit/6e1c97aa57f2ab66c4d063032f9d941b67b44f51) Thanks [@lovelycentury](https://github.com/lovelycentury)! - TextField's `color` prop now accepts every accent color (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`), not just `primary`/`dante`.

### Patch Changes

- Updated dependencies [[`6e1c97a`](https://github.com/lovelycentury/okkly/commit/6e1c97aa57f2ab66c4d063032f9d941b67b44f51)]:
  - @okkly/design-system@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`1d821e8`](https://github.com/lovelycentury/okkly/commit/1d821e8c1450d387a098dd56c5b2550cc6e4579c)]:
  - @okkly/design-system@0.1.1

## 0.1.0

### Minor Changes

- [#7](https://github.com/lovelycentury/okkly/pull/7) [`bb32660`](https://github.com/lovelycentury/okkly/commit/bb32660421d99ed3c7defd51525b4df67ca13cbe) Thanks [@lovelycentury](https://github.com/lovelycentury)! - First public release on npm.

### Patch Changes

- Updated dependencies [[`bb32660`](https://github.com/lovelycentury/okkly/commit/bb32660421d99ed3c7defd51525b4df67ca13cbe)]:
  - @okkly/design-system@0.1.0
  - @okkly/react-hooks@0.1.0
  - @okkly/helpers@0.1.0
  - @okkly/icons@0.1.0
