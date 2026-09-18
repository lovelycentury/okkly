# @okkly/vue-composables

## 0.2.0

### Minor Changes

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`7d508e5`](https://github.com/lovelycentury/okkly/commit/7d508e5c95b9abd7542b2edc825d29b723a89d9b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Autocomplete`, a filter-as-you-type combobox with multi-select tags, grouping and free solo, mirroring `@okkly/react`'s `Autocomplete`. It's built on the new `useAutocomplete` and `useControllableState` composables from `@okkly/vue-composables`. Also adds `Spinner` and the `Option` primitives (`OptionScope`, `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`, `OptionCheck`, `HighlightMatch`) it depends on.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `@okkly/vue-composables`, the Vue counterpart of `@okkly/react-hooks`: `useRipple`, `useEscapeKey`, `useClickOutside`, `useFocusTrap` and `useBodyScrollLock`. `@okkly/vue`'s components are built on these; they moved out of `@okkly/vue` itself so they can be depended on independently, matching how `@okkly/react-hooks` sits beside `@okkly/react`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`264cedc`](https://github.com/lovelycentury/okkly/commit/264cedcbfd2ca92bace057ce4ad72811d8d6945b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `FileUpload`, a drop zone for selecting files with drag & drop, per-file validation and a selection list, mirroring `@okkly/react`'s `FileUpload`. `@okkly/vue-composables` gains the headless `useFileUpload` composable it's built on, the Vue port of `@okkly/react-hooks`'s `useFileUpload`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`dddc0c5`](https://github.com/lovelycentury/okkly/commit/dddc0c5b3a3e6713d8e17286dfa8e5021d4615c8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Only`, a viewport gate that mounts its default slot only within a breakpoint range, backed by a new `useMediaQuery` composable, and `Logo`, the static brand lockup — both mirroring `@okkly/react`'s equivalents.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`265aefd`](https://github.com/lovelycentury/okkly/commit/265aefd0664a8423b06833f3d573180b6bd6db26) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Select`, a closed list of options in a field, mirroring `@okkly/react`'s `Select`. `@okkly/vue-composables` gains the headless `useSelect` composable it's built on, the Vue port of `@okkly/react-hooks`'s `useSelect`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`89f11be`](https://github.com/lovelycentury/okkly/commit/89f11be21e2c2049c0a2a25efd09215b04b8740c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Slider`, a continuous or discrete value control with single or range selection, mirroring `@okkly/react`'s `Slider`. It's built on the new `useSlider` composable from `@okkly/vue-composables`.
