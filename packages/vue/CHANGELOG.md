# @okkly/vue

## 0.2.1

### Patch Changes

- [#256](https://github.com/lovelycentury/okkly/pull/256) [`1ebd944`](https://github.com/lovelycentury/okkly/commit/1ebd9448b9daf2a23df9f16f26cbb6dc09737d89) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Stop publishing test files: `dist` no longer ships the type declarations of the `*.ct.ts` component tests and their `src/playwright` helpers.

## 0.2.0

### Minor Changes

- [#233](https://github.com/lovelycentury/okkly/pull/233) [`6113acc`](https://github.com/lovelycentury/okkly/commit/6113acc4fe408cb90b26f1ccdbdf63ef75687c3e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add the internal `Field` shell (label, control box, adornments, helper text), mirroring `@okkly/react`'s `<Field>`. Not exported — it is the wrapper `TextField` renders inside.

- [#233](https://github.com/lovelycentury/okkly/pull/233) [`6113acc`](https://github.com/lovelycentury/okkly/commit/6113acc4fe408cb90b26f1ccdbdf63ef75687c3e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `TextField`, a single-line text input with label, helper text, and error state, mirroring `@okkly/react`'s `TextField`. Its `color` prop accepts any accent color (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`), matching `@okkly/react`'s `TextFieldColor`/`FieldAccentColor`.

## 0.1.2

### Patch Changes

- Updated dependencies [[`13dcdcf`](https://github.com/lovelycentury/okkly/commit/13dcdcfc2950bcb3538d7a57f63a8ea9ddb4a04c), [`5afd452`](https://github.com/lovelycentury/okkly/commit/5afd45246ae3f7a0da5d81f97366bae97f135af1)]:
  - @okkly/design-system@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`6e1c97a`](https://github.com/lovelycentury/okkly/commit/6e1c97aa57f2ab66c4d063032f9d941b67b44f51)]:
  - @okkly/design-system@0.2.0

## 0.1.0

### Minor Changes

- [#18](https://github.com/lovelycentury/okkly/pull/18) [`d732eb1`](https://github.com/lovelycentury/okkly/commit/d732eb1e49b0a645af86d4c50a7f1629fccb06c4) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `@okkly/vue`, the Vue build of the design system, with `<Button>` (variant/color/shape/size/loading/ripple parity with `@okkly/react`, icons as slots) and the `useRipple` composable behind `<Ripple>`.
