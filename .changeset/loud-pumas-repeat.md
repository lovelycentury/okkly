---
"@okkly/design-system": patch
---

Declare the cascade layer order in every layer-opening stylesheet, not just `styles/index.scss`.

A bundler splits component CSS into chunks that load in arbitrary order, and a layer takes its position where it is first seen. When a chunk that opens `@layer okkly.component { … }` loaded before the ordering statement, `okkly.component` was registered ahead of `okkly.reset`, inverting the cascade so the reset outranked every component rule — the built Storybook showed a checked Checkbox with both the check and the indeterminate minus, because normalize's `svg { display: block }` beat the component's `svg { display: none }`.
