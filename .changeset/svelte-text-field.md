---
"@okkly/svelte": minor
"@okkly/design-system": minor
---

Add `TextField`, a single-line text input with label, helper, and error, mirroring `@okkly/react`'s `TextField`.

Widen the shared `field.shell` SCSS mixin's color modifier (used by TextField, Select, Autocomplete, DateField, DateTimeField, TimeField) from `primary`/`dante` to every accent token: `secondary`, `violet`, `ember`, `ice`, and `contrast`. `@okkly/svelte`'s `TextField` is the first consumer to expose all seven through its `color` prop.
