# @okkly/vue

## 0.4.0

### Minor Changes

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`4d7dce3`](https://github.com/lovelycentury/okkly/commit/4d7dce32a5c76cdcfa04cf66a10aac80084465c4) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Accordion`/`AccordionSummary`/`AccordionDetails`, an expandable section with an animated panel, mirroring `@okkly/react`'s `Accordion`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`0afcb5f`](https://github.com/lovelycentury/okkly/commit/0afcb5f36cb798de646787196053bd97d4d31715) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Alert`, an inline banner that reports the outcome of something the user just did or a condition they need to know about, mirroring `@okkly/react`'s `Alert`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`cd82dfe`](https://github.com/lovelycentury/okkly/commit/cd82dfe07e48a333d2b52d652f65c19d7ca07ea9) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `AnimatedBackground`, a layered deep-space background with nebulae, stars, a falling spark, a beacon, micro-fireworks and grain animated with CSS keyframes, mirroring `@okkly/react`'s `AnimatedBackground`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`7d508e5`](https://github.com/lovelycentury/okkly/commit/7d508e5c95b9abd7542b2edc825d29b723a89d9b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Autocomplete`, a filter-as-you-type combobox with multi-select tags, grouping and free solo, mirroring `@okkly/react`'s `Autocomplete`. It's built on the new `useAutocomplete` and `useControllableState` composables from `@okkly/vue-composables`. Also adds `Spinner` and the `Option` primitives (`OptionScope`, `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`, `OptionCheck`, `HighlightMatch`) it depends on.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`90d3777`](https://github.com/lovelycentury/okkly/commit/90d37777857abecea20e87ed21ec910023b2782e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Badge`, a count or status dot pinned to the corner of another element, mirroring `@okkly/react`'s `Badge`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`620f9d7`](https://github.com/lovelycentury/okkly/commit/620f9d7325b403406ef321677683aeb751e110da) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Breadcrumbs`, a trail of parent pages ending at the current location, mirroring `@okkly/react`'s `Breadcrumbs`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`81bde2b`](https://github.com/lovelycentury/okkly/commit/81bde2b152373431aa939c480fc6209fafe0ee6c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `ButtonGroup`, a split button (one main action plus an optional chevron menu of variants of that action), mirroring `@okkly/react`'s `ButtonGroup`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`e3b4f6a`](https://github.com/lovelycentury/okkly/commit/e3b4f6a390726483f7175d5e32f47b8a2e191b95) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Calendar`, a month grid for a single date or a start/end range with a year → month → day drill-down header, mirroring `@okkly/react`'s `Calendar`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`1ea11be`](https://github.com/lovelycentury/okkly/commit/1ea11bedbb8c694c0f8b6a062b0896b46802ca12) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `CheckboxGroup`, a multi-select set of `Checkbox` children with shared name and propagated size/color, mirroring `@okkly/react`'s `CheckboxGroup`. `Checkbox` also gains `value`/`name` props and now wires up to a surrounding `CheckboxGroup` via `provide`/`inject`, closing the gap its own doc comment previously noted.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Checkbox`, a binary or indeterminate choice control, mirroring `@okkly/react`'s `Checkbox`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`b0f57dc`](https://github.com/lovelycentury/okkly/commit/b0f57dc47d439c203142bbfc909660ee8152be04) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Chip` and `ChipGroup`, mirroring `@okkly/react`'s components of the same names. `ChipGroup` composes `Chip`s into a wrapping row with single- or multi-select, driven by an `items` array and `v-model`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`c13fc12`](https://github.com/lovelycentury/okkly/commit/c13fc123d76a6a1c97bc90cd4017251ec87e9534) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Icon`, `Typography`, `Avatar`, `AvatarGroup` and `Divider`, mirroring `@okkly/react`'s components of the same names.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`ed6ac69`](https://github.com/lovelycentury/okkly/commit/ed6ac6952f412fde9b1db8798faba00da116b6d0) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `DateField`, a masked `dd.mm.yyyy` text input with a `Calendar` popover built on `@maskito/vue`, mirroring `@okkly/react`'s `DateField`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`c8d3088`](https://github.com/lovelycentury/okkly/commit/c8d3088b4b8daa93f86eec0f5109d8773d722ae6) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `DateTimeField`, a masked `dd.mm.yyyy, HH:mm` text input with a `DateTimePicker` popover built on `@maskito/vue`, mirroring `@okkly/react`'s `DateTimeField`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`7e26441`](https://github.com/lovelycentury/okkly/commit/7e2644105f83ab4efb4b78f40ccd7d21f00551af) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `DateTimePicker`, a fixed inline card composed from `Calendar` + `TimePicker` with a summary and Confirm button, mirroring `@okkly/react`'s `DateTimePicker`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`305b214`](https://github.com/lovelycentury/okkly/commit/305b2143bb2d64691cf69e94a223fc80066fffc6) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Dialog`, along with the `DialogTitle`, `DialogContent`, `DialogActions` and `DialogClose` subcomponents, mirroring `@okkly/react`'s `Dialog`. It builds on `Modal` for the portal, backdrop, focus trap and scroll lock, and opens the paper with a `Grow` transition.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`d3487e8`](https://github.com/lovelycentury/okkly/commit/d3487e86a37eedf5a6a53f3461b856f7ff23407c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Drawer`, a panel that slides in from an edge and takes the page with it — temporary (built on `Modal`), persistent, or permanent — mirroring `@okkly/react`'s `Drawer`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`7d07c46`](https://github.com/lovelycentury/okkly/commit/7d07c46eefbed8978ec83fcdf0bce502e11f853e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Fab`, a floating action button for a screen's primary create/navigate action, mirroring `@okkly/react`'s `Fab`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`264cedc`](https://github.com/lovelycentury/okkly/commit/264cedcbfd2ca92bace057ce4ad72811d8d6945b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `FileUpload`, a drop zone for selecting files with drag & drop, per-file validation and a selection list, mirroring `@okkly/react`'s `FileUpload`. `@okkly/vue-composables` gains the headless `useFileUpload` composable it's built on, the Vue port of `@okkly/react-hooks`'s `useFileUpload`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`17d692a`](https://github.com/lovelycentury/okkly/commit/17d692ae1947bd55bbf64e74593cef94c7417d7f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `IconButton`, an icon-only control for toolbars and dense UIs, mirroring `@okkly/react`'s `IconButton`. It shares `Button`'s ripple and `<a>`/`<button>` polymorphism.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`a041474`](https://github.com/lovelycentury/okkly/commit/a04147441f8199c16b4c86a0171bd0a541151ffc) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `InlineAction`, a compact text/icon control for table rows and cards with loading, success and error states, mirroring `@okkly/react`'s `InlineAction`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`7f7cb81`](https://github.com/lovelycentury/okkly/commit/7f7cb818ad9799a7b7d31e301b7ce69f20c1c293) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `NumberInput`, a numeric text field with steppers, mirroring `@okkly/react`'s `NumberInput`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`dddc0c5`](https://github.com/lovelycentury/okkly/commit/dddc0c5b3a3e6713d8e17286dfa8e5021d4615c8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Only`, a viewport gate that mounts its default slot only within a breakpoint range, backed by a new `useMediaQuery` composable, and `Logo`, the static brand lockup — both mirroring `@okkly/react`'s equivalents.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`6005cf1`](https://github.com/lovelycentury/okkly/commit/6005cf10efff056ca9a40f0f360cddda7eea4134) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Pagination`, page controls with boundary pages, a sibling window and ellipses, mirroring `@okkly/react`'s `Pagination`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Popper`, `Popover` and `Modal`, mirroring `@okkly/react`'s components of the same names. `Popper` positions a slot against an anchor with `@popperjs/core`; `Popover` adds Escape, click-outside, a surface and a scale+fade transition; `Modal` is the portal/backdrop/focus-trap/scroll-lock primitive both dialogs and drawers are built on. They are built on the composables now published as `@okkly/vue-composables`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`1127fd6`](https://github.com/lovelycentury/okkly/commit/1127fd6034b53813f533575e3a93680cb54ab596) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Progress`, a linear bar or circular ring that reports how far along a task is, mirroring `@okkly/react`'s `Progress`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`45a19f5`](https://github.com/lovelycentury/okkly/commit/45a19f5cf43aab7c971a39bfb69c5e552274743c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Radio` and `RadioGroup`, mirroring `@okkly/react`'s components of the same names. `RadioGroup` shares its selection with nested `Radio`s through `provide`/`inject`, the Vue equivalent of React's context.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`6faf63c`](https://github.com/lovelycentury/okkly/commit/6faf63ceffee13204aee975e70a902805b6721f1) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Rating`, a star (or custom glyph) scale for scores with half-step precision, mirroring `@okkly/react`'s `Rating`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`642d1fb`](https://github.com/lovelycentury/okkly/commit/642d1fbd2d7fadeaa8528e6650165b7d62802571) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `RichEditor`, a TipTap-based rich text editor with toolbar, slash menu, word count and autosave status, mirroring `@okkly/react`'s `RichEditor`. Built on `@tiptap/vue-3` instead of `@tiptap/react`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`5c4ff61`](https://github.com/lovelycentury/okkly/commit/5c4ff61712eb794c52f8e600668c45d02b9eed1f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `SegmentedToggle`, exclusive or multi-select segments in one control for view modes, filters, or short option sets, mirroring `@okkly/react`'s `SegmentedToggle`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`265aefd`](https://github.com/lovelycentury/okkly/commit/265aefd0664a8423b06833f3d573180b6bd6db26) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Select`, a closed list of options in a field, mirroring `@okkly/react`'s `Select`. `@okkly/vue-composables` gains the headless `useSelect` composable it's built on, the Vue port of `@okkly/react-hooks`'s `useSelect`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`5a74588`](https://github.com/lovelycentury/okkly/commit/5a745888021ae1d2958f7b81e3a9287f94594d50) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `SeverityIcon`, a small tinted status badge for alerts, dialogs, and list rows, mirroring `@okkly/react`'s `SeverityIcon`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`f9e420f`](https://github.com/lovelycentury/okkly/commit/f9e420f04b9e7a486f81da1f7d85f002c97564cd) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Skeleton`, a grey stand-in for content that hasn't arrived, mirroring `@okkly/react`'s `Skeleton`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`89f11be`](https://github.com/lovelycentury/okkly/commit/89f11be21e2c2049c0a2a25efd09215b04b8740c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Slider`, a continuous or discrete value control with single or range selection, mirroring `@okkly/react`'s `Slider`. It's built on the new `useSlider` composable from `@okkly/vue-composables`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`a5ae24c`](https://github.com/lovelycentury/okkly/commit/a5ae24c44e46630d2ef3e9b663f3fd6e6afbca11) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `StaticBackground`, an SSR-safe atmospheric scene for dark canvases — nebulae, stars and grain frozen on their resting frame, mirroring `@okkly/react`'s `StaticBackground`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`9f21ec0`](https://github.com/lovelycentury/okkly/commit/9f21ec0b1380a09c24542a1b9395ce8243a3a2d1) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Stepper`, progress through an ordered flow with done/active/pending steps, mirroring `@okkly/react`'s `Stepper`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`cc23137`](https://github.com/lovelycentury/okkly/commit/cc23137d60d6beebc0c0248a480bd369867f74b8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `SwipeableDrawer`, `Drawer` plus an edge swipe to open it and a drag to close it with the panel tracking the pointer live, mirroring `@okkly/react`'s `SwipeableDrawer`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`dd9a302`](https://github.com/lovelycentury/okkly/commit/dd9a302aef7a1696ae001a091a3b35dba03f8d47) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Switch`, an immediate on/off toggle, mirroring `@okkly/react`'s `Switch`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`29e3b69`](https://github.com/lovelycentury/okkly/commit/29e3b6917598eaf9934838abec22cbc83c27c77f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Tabs`, a switch between peer views inside one panel with WAI-ARIA-pattern keyboard navigation, mirroring `@okkly/react`'s `Tabs`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`62b132f`](https://github.com/lovelycentury/okkly/commit/62b132fd62123fd2f6805be2ad8d1488dbb6c848) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `TextArea`, a multi-line text field with label, helper text, error state, character counter and optional autosize, mirroring `@okkly/react`'s `TextArea`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`d475fea`](https://github.com/lovelycentury/okkly/commit/d475fead2285f7b4c86b2c912a1c0a036cfa5b0a) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `TimeField`, a masked `HH:mm` text input with a `TimePicker` popover built on `@maskito/vue`, mirroring `@okkly/react`'s `TimeField`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`02ca36a`](https://github.com/lovelycentury/okkly/commit/02ca36a7722915b6124bf125ae540d3925cd38a2) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `TimePicker`, scrollable hour/minute (and, for `format="12h"`, AM/PM) wheels for picking a time inline, mirroring `@okkly/react`'s `TimePicker`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`e66ac23`](https://github.com/lovelycentury/okkly/commit/e66ac23d07bb836c4acabfc2dd094e4c5b4b258e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Tooltip`, a short label that appears on hover or focus and says what a control is, built on `Popper`, mirroring `@okkly/react`'s `Tooltip`.

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add the transition family — `Fade`, `Grow`, `Zoom`, `Slide` and `Collapse` — mirroring `@okkly/react`'s components of the same names. Each takes a single default slot and an `in` boolean and animates it; `Popover`'s own scale+fade transition now reuses the same duration/easing helpers as `Grow` instead of duplicating them.

### Patch Changes

- [#268](https://github.com/lovelycentury/okkly/pull/268) [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Fix `Popover` opening with no animation: the paper's enter transition never ran because its `<Transition>` lacked `appear`, and the paper fully remounts on every open (rather than toggling in place), so every open was an "appear" that Vue skipped without it.

- Updated dependencies [[`7d508e5`](https://github.com/lovelycentury/okkly/commit/7d508e5c95b9abd7542b2edc825d29b723a89d9b), [`96077a2`](https://github.com/lovelycentury/okkly/commit/96077a296ce62bc9d1b60f3dcf3c807e65d5b9f8), [`264cedc`](https://github.com/lovelycentury/okkly/commit/264cedcbfd2ca92bace057ce4ad72811d8d6945b), [`dddc0c5`](https://github.com/lovelycentury/okkly/commit/dddc0c5b3a3e6713d8e17286dfa8e5021d4615c8), [`265aefd`](https://github.com/lovelycentury/okkly/commit/265aefd0664a8423b06833f3d573180b6bd6db26), [`89f11be`](https://github.com/lovelycentury/okkly/commit/89f11be21e2c2049c0a2a25efd09215b04b8740c)]:
  - @okkly/vue-composables@0.2.0

## 0.3.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`141c5cd`](https://github.com/lovelycentury/okkly/commit/141c5cd851329d961bce84fa6747b3890cf7484c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `Box`, a layout primitive with MUI-style system props — spacing, flex layout, sizing, token colors and border, each responsive per viewport breakpoint or, through `@`-keys, per container breakpoint — mirroring `@okkly/react`'s `Box`.

### Patch Changes

- Updated dependencies [[`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae), [`cbed6f0`](https://github.com/lovelycentury/okkly/commit/cbed6f0b765ee06086798509a3e597227a51a076), [`1d72f7d`](https://github.com/lovelycentury/okkly/commit/1d72f7d3da20c163a399d2f2c17d4bf68619456b), [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376)]:
  - @okkly/design-system@0.4.0
  - @okkly/shared@0.1.0

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
