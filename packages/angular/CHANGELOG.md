# @okkly/angular

## 0.3.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`141c5cd`](https://github.com/lovelycentury/okkly/commit/141c5cd851329d961bce84fa6747b3890cf7484c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyBox` (`[okklyBox]`), a layout directive with MUI-style system props — spacing, flex layout, sizing, token colors and border, each responsive per viewport breakpoint or, through `@`-keys, per container breakpoint — mirroring `@okkly/react`'s `Box` on whatever element it decorates.

### Patch Changes

- Updated dependencies [[`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae), [`cbed6f0`](https://github.com/lovelycentury/okkly/commit/cbed6f0b765ee06086798509a3e597227a51a076), [`1d72f7d`](https://github.com/lovelycentury/okkly/commit/1d72f7d3da20c163a399d2f2c17d4bf68619456b), [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376)]:
  - @okkly/design-system@0.4.0
  - @okkly/shared@0.1.0

## 0.2.0

### Minor Changes

- [#232](https://github.com/lovelycentury/okkly/pull/232) [`a19a09f`](https://github.com/lovelycentury/okkly/commit/a19a09f9bd574423aaf4b9686d868add4f895a8f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyTextField` (`okkly-text-field`), a single-line text input with label, helper, and error — the foundation for most form fields. Built on a new internal `Field` shell shared with future field-based controls (Select, Autocomplete). `color` supports every design-system accent token (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`).

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

- [#14](https://github.com/lovelycentury/okkly/pull/14) [`b2ccbd4`](https://github.com/lovelycentury/okkly/commit/b2ccbd4d0bbb89f0e554724a5925c572407553cb) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `@okkly/angular`, the Angular build of the design system, with `OkklyButton` (attribute component on native `<button>`/`<a>`, with variant/color/shape/size/loading/ripple parity with `@okkly/react`) and the `OkklyRipple` host directive.
