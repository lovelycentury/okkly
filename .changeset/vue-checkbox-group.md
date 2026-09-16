---
"@okkly/vue": minor
---

Add `CheckboxGroup`, a multi-select set of `Checkbox` children with shared name and propagated size/color, mirroring `@okkly/react`'s `CheckboxGroup`. `Checkbox` also gains `value`/`name` props and now wires up to a surrounding `CheckboxGroup` via `provide`/`inject`, closing the gap its own doc comment previously noted.
