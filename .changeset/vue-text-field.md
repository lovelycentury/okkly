---
"@okkly/vue": minor
"@okkly/design-system": minor
---

Add `TextField`, a single-line text input with label, helper text, and error state, mirroring `@okkly/react`'s `TextField`. Its `color` prop accepts any `--okkly-accent-*` token (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`), which required generalizing the `field.shell` SCSS mixin's color modifier from a `dante`-only special case to one covering every accent color.
