# @okkly/design-system

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
