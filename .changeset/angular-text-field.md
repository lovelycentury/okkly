---
"@okkly/angular": minor
"@okkly/design-system": minor
---

Add `OkklyTextField` (`okkly-text-field`), a single-line text input with label, helper, and error — the foundation for most form fields. Built on a new internal `Field` shell shared with future field-based controls (Select, Autocomplete).

The shared `field.shell` SCSS mixin's `color` modifier now covers every design-system accent token (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`), not just `primary`/`dante`.
