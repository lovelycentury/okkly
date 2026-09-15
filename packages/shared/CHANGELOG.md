# @okkly/shared

## 0.1.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Box`, a layout primitive with MUI-style system props — spacing, flex layout, sizing, token colors and border — polymorphic through `as`. Every prop is responsive: per viewport breakpoint (`{ base: "column", md: "row" }`), and per container breakpoint through `@`-keys (`{ "@md": "row" }`), which answer to the nearest Box marked `container`. `@okkly/design-system` adds the 4px spacing scale from the Figma library (`--okkly-space-unit` and the `--okkly-space-<n>` steps), the `$container-breakpoints` scale and the Box styles. `@okkly/shared` is new: the framework-neutral half of the components — here Box's prop types and `resolveBoxSystemProps`, which turns the props into those styles — that every framework package shares.

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376) Thanks [@lovelycentury](https://github.com/lovelycentury)! - `@okkly/shared` takes over `@okkly/helpers`: `bem`, `clamp`, `uniqueId` and `debounce` are exported from `@okkly/shared` with the same signatures, and `@okkly/helpers` is no longer published — import them from `@okkly/shared` instead. `uniqueId`'s default prefix is now `okkly` (it was `lokki`, from the project's former name). `@okkly/react` drops its unused dependency on `@okkly/helpers`.
